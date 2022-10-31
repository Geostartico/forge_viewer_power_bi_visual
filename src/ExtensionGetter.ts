export class ExtensionGetter{
    static Autodesk;
    static Extension = selectionlistenerextension;
} 
function selectionlistenerextension(viewer, options){
    selectionlistenerextension.prototype.load = selectionlistenerextension.prototype.load.bind(this);
    ExtensionGetter.Autodesk.Viewing.Extension.call(viewer, options);
}
selectionlistenerextension.prototype = Object.create(ExtensionGetter.Autodesk.Viewing.Extension.prototype);
selectionlistenerextension.prototype.constructor = selectionlistenerextension;
selectionlistenerextension.prototype.load = () => {
    console.log("selection listener loaded");
    if(this != undefined){
        this?.viewer.addEventListener(ExtensionGetter.Autodesk.Viewing.SELECTION_CHANGED_EVENT, selectionlistenerextension.prototype.selectionChangedAgent);
    }
};
 
selectionlistenerextension.prototype.selectionChangedAgent = (event) => {
    console.log(event.dbIdArray);
};
