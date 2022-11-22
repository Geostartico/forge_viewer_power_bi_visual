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
    private zoom;
    private color;
    private isolate;
    private hidden;
    /**
     *  id_column e id_property devono diventare una, chiamiamo MATRICOLA perchè deve corrispondere, key_field in cui è contenuto
     *  colori inseriti in una tabella (facciamo nome Color, R rosso, G verde, B blue, I intensità)
     *  associazioni colore-valore da tabella (facciamo color, value)
     *  da implementare azioni(primo bit zoom, secondo isola, terzo colore)(chiamiamo actions)
     *  implementa hide o non hide da colonna hidden
     * **/
    private id_column;
    private colorDict;
    private value_to_color;
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
    private updateParameters;
}
