import {utcWednesday, NumberValue} from "d3";

export class ExtensionGetter{
    
    static SelectDesk(desk) : any{
        class x extends desk.Viewing.Extension{
            private modelLoaded = false;
            private selectionStarted = false;
            constructor(viewer, options){
                super(viewer, options);
            }
            public listener(event){
                console.log(event.dbIdArray);
            }
            public load() : boolean{
                console.log("selection listener loaded");
                this.viewer.addEventListener(desk.Viewing.SELECTION_CHANGED_EVENT, this.selectionListener.bind(this));
                this.viewer.addEventListener(desk.Viewing.MODEL_ADDED_EVENT, ((event) =>{console.log("modelLoaded: ");this.modelLoaded = true}).bind(this));
                return true;
            }
            public unload() : boolean{
                console.log("extension unloaded");
                return true;
            }
            private selectionListener(event) : void{
                console.log("element selected" + event.dbIdArray);
                let succcallback = (dbIds) => {
                    console.log(dbIds);
                    for(let i = 0; i < dbIds.length; i ++){
                        this.viewer.getProperties(dbIds[i], (prop) => {console.log("dbId" + dbIds[i],prop)});
                    }
                    let id = dbIds[0];
                    let tree = this.viewer.model.getInstanceTree();
                    let i = 0
                    while(i < 10){
                        id = tree.getNodeParentId(id);
                        this.viewer.getProperties(id, (prop) => {console.log("dbId " + id,prop)})
                        i++
                    }

                    this.isolateChildren(dbIds.map((elem) => {return elem/* + 1*/}));
                    this.viewer.fitToView(dbIds);
                    this.selectionStarted = false;
                    
                };

                let errCallback = (err) => {console.log("an error has occured in the search: " + err)};
                //this.viewer.isolate(event.dbIdArray);
                this.viewer.getProperties(Array.isArray(event.dbIdArray) ? event.dbIdArray[0] : event.dbIdArray, (res) => {console.log("dbid properties:"); console.log(res)}, (err) => {console.log("error has accurred fetching properties: " + err)});
                if(event.dbIdArray != undefined && this.modelLoaded && !this.selectionStarted){
                    this.selectionStarted = true
                    console.log("starting search");
                    this.viewer.search('"' + "Glass" + '"', succcallback.bind(this), errCallback, ['Material'], {searchHidden: true, includeInherited: true});
                }
            }
            private isolateChildren(dbIds : number[]){
                console.log("dbIds: ", dbIds);
                let tree = this.viewer.model.getInstanceTree();
                let leafIDs = this.getLeaves(dbIds, tree); 
                let allIds = this.getLeaves([tree.getRootId()], tree)
                let unwanted = allIds.filter((id) => {return leafIDs.indexOf(id) < 0});
                console.log("unwanted: ", unwanted);
                console.log('leaves', leafIDs);
                this.viewer.isolate(leafIDs);
                for(let i of unwanted){
                    this.viewer.impl.visibilityManager.setNodeOff(i, true);
                }
            }
            private getLeaves(dbIds : number[], tree){
                let leaves : number[] = [];
                for(let i = 0; i < dbIds.length; i++){
                    let subchildren = (id) =>{
                        if(tree.getChildCount(id) === 0){
                            leaves.push(id)
                        }
                        tree.enumNodeChildren(id, (child) => {subchildren(child)});
                    }
                    subchildren(dbIds[i]);
                }
                return leaves;
            }
            


        };
        /*
        extension = (viewer, options) => {
            desk.Viewing.Extension.call(viewer, options);
        }
        extension.prototype = Object.create(desk.Viewing.Extension.prototype);
        extension.prototype.selectionChangedAgent = (event) => {
            console.log(event.dbIdArray);
        };
        extension.prototype.constructor = extension;
        extension.prototype.load = () => {
            console.log("selection listener loaded");
            //if(this != undefined){
                //this?.viewer.addEventListener(ExtensionGetter.Autodesk.Viewing.SELECTION_CHANGED_EVENT, selectionlistenerextension.prototype.selectionChangedAgent);
            //}
            return true
        };
        extension.prototype.unload = () => {
            console.log("extension unloaded");
            return true
        }
        console.log(extension);*/
        return x 
        };
} 
 

