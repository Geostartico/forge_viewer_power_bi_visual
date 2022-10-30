import { ForgeViewerVis } from "../../src/visual";
import powerbiVisualsApi from "powerbi-visuals-api";
import IVisualPlugin = powerbiVisualsApi.visuals.plugins.IVisualPlugin;
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import DialogConstructorOptions = powerbiVisualsApi.extensibility.visual.DialogConstructorOptions;
var powerbiKey: any = "powerbi";
var powerbi: any = window[powerbiKey];
var pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG: IVisualPlugin = {
    name: 'pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG',
    displayName: 'pbi_viewer_test',
    class: 'ForgeViewerVis',
    apiVersion: '5.1.0',
    create: (options: VisualConstructorOptions) => {
        if (ForgeViewerVis) {
            return new ForgeViewerVis(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId: string, options: DialogConstructorOptions, initialState: object) => {
        const dialogRegistry = globalThis.dialogRegistry;
        if (dialogId in dialogRegistry) {
            new dialogRegistry[dialogId](options, initialState);
        }
    },
    custom: true
};
if (typeof powerbi !== "undefined") {
    powerbi.visuals = powerbi.visuals || {};
    powerbi.visuals.plugins = powerbi.visuals.plugins || {};
    powerbi.visuals.plugins["pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG"] = pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG;
}
export default pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG;