import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
export declare class ForgeViewerVis implements IVisual {
    private target;
    private updateCount;
    private textNode;
    private pbioptions;
    private forgeviewer;
    private authClient;
    private client_id;
    private client_secret;
    private autorefresh;
    private accessToken;
    private urn;
    constructor(options: VisualConstructorOptions);
    private syncauth;
    update(options: VisualUpdateOptions): void;
    initializeViewer(viewerDiv: string): Promise<void>;
    private getForgeviewerStyleAndSrc;
    private onLoadSuccess;
    private onLoadFailure;
    private myloadExtension;
}
