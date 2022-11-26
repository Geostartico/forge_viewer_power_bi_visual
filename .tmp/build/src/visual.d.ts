import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private pbioptions;
    private selectionMan;
    private host;
    private selection_extension;
    private forgeviewer;
    private client_id;
    private client_secret;
    private accessToken;
    private urn;
    private isolator;
    private zoom;
    private color;
    private isolate;
    private hidden;
    private id_column;
    private colorDict;
    private value_to_color;
    private pulledCode;
    constructor(options: VisualConstructorOptions);
    private syncauth;
    update(options: VisualUpdateOptions): void;
    initializeViewer(viewerDiv: string): Promise<void>;
    private getForgeviewerStyleAndSrc;
    private onLoadSuccess;
    private onLoadFailure;
    private myloadExtension;
    /**
    * pass the options.categories used in the update function
    * the model objects will be isolated/colored accordingly (see class parameters)
    * **/
    private isolateBySelection;
    private updateParameters;
    private myGetExtension;
}
