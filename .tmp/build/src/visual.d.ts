import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class Visual implements IVisual {
    private target;
    private updateCount;
    private textNode;
    private pbioptions;
    private forgeviewer;
    private client_id;
    private client_secret;
    private autorefresh;
    private accessToken;
    private urn;
    private maxrows;
    private isolator;
    private connector_extension;
    private id_column;
    private value_column;
    private id_property;
    private color_values;
    private colors;
    private colorStrings;
    constructor(options: VisualConstructorOptions);
    private syncauth;
    update(options: VisualUpdateOptions): void;
    initializeViewer(viewerDiv: string): Promise<void>;
    private getForgeviewerStyleAndSrc;
    private onLoadSuccess;
    private onLoadFailure;
    private myloadExtension;
    private mygetExtension;
    /**
    * pass the options.categories used in the update function
    * the model objects will be isolated/colored accordingly (see class parameters)
    * **/
    private isolateBySelection;
}
