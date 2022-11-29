import powerbi from "powerbi-visuals-api";
import { Semaphore } from "async-mutex";

export function selectionManagerExtension(){
    class ext extends Autodesk.Viewing.Extension{
        onClickCallBack : Function;
        selectionManager : powerbi.extensibility.ISelectionManager;
        host : powerbi.extensibility.visual.IVisualHost;
        idToSelector : Map<string, powerbi.extensibility.ISelectionId> = new Map<string, powerbi.extensibility.ISelectionId>();
        propertyName : string;

        constructor(viewer, options){
            super(viewer, options);
        }

        public load(): boolean | Promise<boolean> {
            this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (this.selectionCallback).bind(this));
            console.log('selectionManagerExtension loaded');
            return true
        }
        public setSelectionHost(host : powerbi.extensibility.visual.IVisualHost){
            this.host = host;
        }
        public setSelectionManager(selMan : powerbi.extensibility.ISelectionManager){
            this.selectionManager = selMan;
        }


        public setSelectables(cat : powerbi.DataViewCategoryColumn){
        if(!this.host){
            return;
        }
            for(let i = 0; i < cat.values.length; i++){
                this.idToSelector.set(cat.values[i].toString(), this.host.createSelectionIdBuilder().withCategory(cat, i).createSelectionId());
            }
        }
        public setPropertyName(name : string){
            if(name){
                this.propertyName = name;
            }
        }
        public setOnNonVoidSelectionCallback(fn : Function){
            this.onClickCallBack = fn;
        }

        private async selectionCallback(event){
            console.log("Selection on the viewer was made");
            
            let dbIds : number[]= event.dbIdArray;
            if(dbIds.length === 0){
                this.selectionManager.clear();
                return;
            }
            let toSelect : powerbi.extensibility.ISelectionId[] = [];
            let sem : Semaphore;
            if(this.host && this.selectionManager){
                sem = new Semaphore(dbIds.length);
                for(let dbid of dbIds){
                    await sem.acquire();
                    await this.viewer.getProperties(dbid, ((pr) => {
                        console.log("gettingProperties");
                        for(let prop of pr.properties){
                            if(prop.displayName === this.propertyName){
                                console.log("property found");
                                if(this.idToSelector.has(prop.displayValue.toString())){
                                    toSelect.push(this.idToSelector.get(prop.displayValue.toString()));
                                }
                            }
                        }
                        sem.release();
                    }).bind(this))
                }
            }
            if(sem){
                await sem.acquire(dbIds.length);
            }
            console.log(toSelect);
            if(this.onClickCallBack){
                this.onClickCallBack()
            }
            this.selectionManager.clear();
            this.selectionManager.select(toSelect, true);
        }

    }
    return ext;
}
