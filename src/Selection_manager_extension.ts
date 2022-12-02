import powerbi from "powerbi-visuals-api";
import { Semaphore } from "async-mutex";
//extension manages selection on other powerbi tables
export function selectionManagerExtension(){
    class ext extends Autodesk.Viewing.Extension{
        //callback called when the selection refers to a member of a table
        onClickCallBack : Function;
        //called when the nothing was clicked
        onVoidClickCallBack : Function;
        //selection manager from power bi
        selectionManager : powerbi.extensibility.ISelectionManager;
        //host of the power bi visual
        host : powerbi.extensibility.visual.IVisualHost;
        //map that associates the value of propertyName for a object to the selectionID
        idToSelector : Map<string, powerbi.extensibility.ISelectionId> = new Map<string, powerbi.extensibility.ISelectionId>();
        //name of the property to get the id from
        propertyName : string;

        constructor(viewer, options){
            super(viewer, options);
        }

        public load(): boolean | Promise<boolean> {
            //adds listener to viewer event
            this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (this.selectionCallback).bind(this));
            console.log('selectionManagerExtension loaded');
            return true
        }
        public setSelectionHost(host : powerbi.extensibility.visual.IVisualHost){
            this.host = host;
        }


        //updates selectable objects
        public setSelectables(cat : powerbi.DataViewCategoryColumn){
            if(!this.host){
                    return;
            }
            for(let i = 0; i < cat.values.length; i++){
                //generates selectionIds and puts them into the map
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
        public setOnVoidSelectionCallback(fn : Function){
            this.onVoidClickCallBack = fn;
        }

        //function called when a selection is made
        private async selectionCallback(event){
            console.log("Selection on the viewer was made");
            if(!this.selectionManager && this.host){
                this.selectionManager = this.host.createSelectionManager();
            }
            console.log("selectables", this.idToSelector);
            let dbIds : number[]= event.dbIdArray;
            //no elements were selected
            if(dbIds.length === 0 && this.onVoidClickCallBack){
                this.onVoidClickCallBack();
                this.selectionManager.clear();
                return;
            }
            let toSelect : powerbi.extensibility.ISelectionId[] = [];
            let sem : Semaphore;
            //for each dbId i verify its propertyName value and determine its SelectionID
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
                //await for all the callbacks to finish
                await sem.acquire(dbIds.length);
            }
            console.log(toSelect);
            if(toSelect.length === 0){
                return;
            }
            if(this.onClickCallBack){
                this.onClickCallBack();
            }
            //if the selections are not clear beforehand they are gonna be stacked
            this.selectionManager.clear();
            this.selectionManager.select(toSelect, true);
        }

    }
    return ext;
}
