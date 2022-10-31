export class ExtensionGetter{
    
    static SelectDesk(desk) : any{
        let extension : any;
        class x extends desk.Viewing.Extension{
            constructor(viewer, options){
                super(viewer, options);
            }
            public listener(event){
                console.log(event.dbIdArray);
            }
            public load() : boolean{
                console.log("selection listener loaded");
            //if(this != undefined){
                //this?.viewer.addEventListener(ExtensionGetter.Autodesk.Viewing.SELECTION_CHANGED_EVENT, selectionlistenerextension.prototype.selectionChangedAgent);
            //}
                return true;
            }
            public unload() : boolean{
                console.log("extension unloaded");
                return true;
            }
            


        };
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
        console.log(extension);
        return x 
        };
} 
 

