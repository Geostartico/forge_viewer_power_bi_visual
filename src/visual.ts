"use strict";

import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
//import {ExtensionGetter} from "./ExtensionGetter";
import {PanelExtension} from "./panel_extension";
import {Isolator} from "./Isolator";
import {struct} from "./attribute_parser";
//import {visualConnectorExtension} from './VisualConnector_extension';
let htmlText : string = 'no rendering?';
let viewId : string = 'forge-viewer';
let extensionid : string = 'connector_extension';
//strings used to identify the columns(the user can rename them to match these)
let key_field = "key_field";
let settings = "actions";
let color_value = "value_color";
let value_ref = "value_ref";
let color_ref = "color_ref";
let R = "R";
let G = "G";
let B = "B";
let I = "I";
let hidden_column = "hidden";
let value_column = "value";
let client_id_column = "client_id";
let client_secret_column = "client_secret";
let urn_column = "urn";
/*let colordict = {
'White' :   [255, 255, 255, 256],

'Silver':  [192, 192, 192, 256], 

'Gray':    [128, 128, 128,256], 

'Black':   [0  , 0  , 0  , 256], 

'Red':     [255, 0  , 0  , 256], 

'Maroon':  [128, 0  , 0  , 256], 

'Yellow':  [255, 255, 0  , 256], 

'Olive':   [128, 128, 0  , 256], 

'Lime':    [0  , 255, 0  , 256], 

'Green':   [0  , 128, 0  , 256], 

'Aqua':    [0  , 255, 255, 256], 

'Teal':    [0  , 128, 128, 256], 

'Blue':    [0  , 0  , 255, 256], 

'Navy':    [0  , 0  , 128, 256], 

'Fuchsia': [255, 0  , 255, 256], 

'Purple':  [128, 0  , 128, 256],
}*/
export class Visual implements IVisual {
    private target: HTMLElement;
    private updateCount: number;
    private textNode: Text;
    private pbioptions: VisualConstructorOptions;
    private forgeviewer : Autodesk.Viewing.GuiViewer3D;
    private client_id : string | undefined;
    private client_secret : string | undefined;
    private autorefresh : boolean;
    private accessToken : string | undefined;
    private urn : string | undefined;
    private maxrows : number;//if all rows are selected no coloring is made;
    private isolator : Isolator;
    private connector_extension;
    private zoom : boolean = true;
    private color : boolean = true;
    private isolate : boolean = true;
    private hidden : boolean = true;
    /**
     *  id_column e id_property devono diventare una, chiamiamo MATRICOLA perchè deve corrispondere, key_field in cui è contenuto
     *  colori inseriti in una tabella (facciamo nome Color, R rosso, G verde, B blue, I intensità)
     *  associazioni colore-valore da tabella (facciamo color, value)
     *  da implementare azioni(primo bit zoom, secondo isola, terzo colore)(chiamiamo actions)
     *  implementa hide o non hide da colonna hidden
     * **/
    //the column name in the table where it is selected
    private id_column : string = 'Matricola';
    //the name of the model property corresponding to id_column
    private colorDict : Map<string, number[]> = new Map<string, number[]>();
    private value_to_color : Map<string, string> = new Map<string, string>();

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.pbioptions = options;
        this.target = options.element;
        this.target.innerText = htmlText;
        //this.client_id = client_id;
        //this.client_secret = client_secret;
        console.log(this.target); 
        //let cl = () => {console.log("finished authenticating"); this.initializeViewer(viewId)}; 
        //this.syncauth(cl);
        this.onLoadSuccess = this.onLoadSuccess.bind(this);
    }

    private async syncauth(succcallback : Function){
        //console.log("authenticate");
        let fetched = await fetch(
            "https://developer.api.autodesk.com/authentication/v1/authenticate",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                'client_id': this.client_id,
                'client_secret': this.client_secret,
                'grant_type': 'client_credentials',
                'scope': 'viewables:read'
                })
            }
        )

        let jason = await fetched.json();
        this.accessToken = jason.access_token;
        //console.log("reached end of authentication");
        //console.log(this.accessToken);
        succcallback();
    }


    public update(options: VisualUpdateOptions) {
        //console.log('Visual update', options);
        let cat = options.dataViews[0].categorical;
        console.log(cat);
        let curcred : string[] = [this.client_id, this.client_secret, this.urn];
        //changing parameters
        this.updateParameters(cat);
        console.log("credentials", [this.urn, this.client_id, this.client_secret]);
        if(this.client_id != undefined && this.client_secret != undefined && this.urn != undefined){
            if(this.forgeviewer === undefined){
                //console.log("strapped");
                let cl = () => {/*console.log("finished authenticating")*/; this.initializeViewer(viewId)}; 
                this.syncauth(cl);
            }
            else{
                console.info("updating");
                //coloring based on the selection
                this.isolateBySelection(cat);
                //credentials changed
                if(this.client_id != curcred[0]){
                   console.info("changing account");
                   this.syncauth(() => {
                       console.log("finished authenticating");
                       this.forgeviewer.finish();
                       this.forgeviewer = undefined;
                       this.initializeViewer(viewId);
                   });
               }
               //model changed
               else if(this.urn != curcred[2]){
                   Autodesk.Viewing.Document.load('urn:' + this.urn, this.onLoadSuccess, this.onLoadFailure)
               }
            }
        }
    }

    public async initializeViewer(viewerDiv : string) : Promise<void>{
        let aT = this.accessToken;
        let options = {
        env: 'AutodeskProduction',
        api: 'derivativeV2', 
        getAccessToken: (onTokenReady : any) =>{ 
            let timeInSeconds = 3599; 
            onTokenReady(aT, timeInSeconds); 
            }
        }

        await this.getForgeviewerStyleAndSrc();

        Autodesk.Viewing.Initializer(options, () =>{
                console.log("getting started");
                let config = {extensions: 
                    [
                    'Autodesk.ViewCubeUi',
                    'panel_extension'
                    ]
                };
                this.forgeviewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(viewerDiv), config);
                console.log(this.forgeviewer.start());
                this.isolator = new Isolator(this.forgeviewer);
                this.maxrows = 0;
                //this.forgeviewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, ((e) => {this.forgeviewer.getProperties(e.dbIdArray[0], (k) => {console.log(k);})}).bind(this));
                this.myloadExtension('Autodesk.ViewCubeUi', (res) => {res.setVisible(false);});
                Autodesk.Viewing.Document.load('urn:' + this.urn, this.onLoadSuccess, this.onLoadFailure);
            });
    }

    private async getForgeviewerStyleAndSrc() : Promise<void>{
        console.log("getting style");
        return new Promise<void>((resolve, reject) =>{
            let forgeViewerStyle = "https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css" 
            let forgeViewerSrc = "https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.js"
            //let securityIssue = document.createElement('meta');
            let forgeViewerjs = document.createElement("script");
            let forgeViewercss = document.createElement("link");
            let forgeViewerDiv = document.createElement("div");
            
            //securityIssue.httpEquiv = "Content-Security-Policy";
            //securityIssue.content = "script-src 'self' data: gap:  https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/viewer3D.min.js 'unsafe-eval' 'unsafe-inline'; object-src 'self'; style-src 'self' data: gap: https://developer.api.autodesk.com/modelderivative/v2/viewers/7.*/style.min.css  'unsafe-inline'; media-src *";
            forgeViewerjs.src = forgeViewerSrc;
            forgeViewercss.href = forgeViewerStyle; 
            forgeViewercss.rel = 'stylesheet'; 
            forgeViewercss.type = 'text/css';
            forgeViewerDiv.id = viewId;
            forgeViewerjs.onload = () =>{
                console.log("script loaded");
                //let extension = ExtensionGetter.SelectDesk(Autodesk);
                //let panelext = PanelExtension.SELECT_DESK(Autodesk);
                //Autodesk.Viewing.theExtensionManager.registerExtension(extensionid, extension);
                let panelext = PanelExtension();
                //let connectext = visualConnectorExtension();
                Autodesk.Viewing.theExtensionManager.registerExtension("panel_extension", panelext);
                //Autodesk.Viewing.theExtensionManager.registerExtension(extensionid, connectext);
                this.target.appendChild(forgeViewercss);
                this.target.appendChild(forgeViewerDiv);
                resolve();
            }
            //document.head.appendChild(securityIssue);
            this.target.appendChild(forgeViewerjs);
           
        }) 
    }

    private onLoadSuccess(doc :Autodesk.Viewing.Document){
        console.log("SUCCESS");
        this.forgeviewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry())

    }

    private onLoadFailure(errorCode){
        console.log("load error: " + errorCode);
    }

    private async myloadExtension(name : string, succcallback : Function){
        this.forgeviewer.loadExtension(name).then((res) => {succcallback(res)});
    } 

    private async mygetExtension(){
        this.connector_extension = await this.forgeviewer.getExtension(extensionid);
        console.log('connector extension', this.connector_extension);
    }
    /**
    * pass the options.categories used in the update function
    * the model objects will be isolated/colored accordingly (see class parameters)
    * **/
    private async isolateBySelection(cat : powerbi.DataViewCategorical){
        //colora di default, in caso aggiungeremo funzione per resettare
        let curModello : string[];
        let curValues : string[];
        /*if(!this.connector_extension){
            await this.mygetExtension();
        }
        let arr : string[][] = this.connector_extension.getData();
        for(let i = 0; i < arr.length; i ++){
            switch(i){
                case 0 :{
                    if(arr[i][0] != ""){
                        this.id_column = arr[i][0].trim(); 
                    }
                    break;
                }
                case 1 :{
                    if(arr[i][0] != ""){
                        this.id_property = arr[i][0].trim();
                    }
                    break;
                }
                case 2 :{
                    if(arr[i][0] != ""){
                        this.value_column = arr[i][0].trim()
                    }
                    break;
                }
                case 3 :{
                    if(arr[i][0] != ""){
                        this.color_values = [];
                        this.colorStrings = [];
                        for(let str of arr[i]){
                            let couple = str.split(',');
                            if(couple.length != 2){
                                throw new Error('couples must be two comma separated strings');
                            }
                            this.colorStrings.push(couple[0].trim());
                            this.color_values.push(couple[1].trim());
                        }    
                    } 
                    break;
                }
            }
        }*/
        for(let obj of cat.categories){
            if(obj.source.displayName === this.id_column){
                curModello = obj.values.map((e) => {return e.toString()});
                console.log("ids found: ", curModello);
            }
            else if(obj.source.displayName === value_column){
                curValues = obj.values.map((e) => {return e.toString()});
                console.log("values found: ", curValues);
            }
        }
        let stru : struct[] = [];
        if(curValues != undefined){
            for(let val of curValues){
                let curcolor = this.value_to_color.has(val)? this.colorDict.get(this.value_to_color.get(val)) : [0, 0, 0, 0];
                stru.push(new struct([this.id_column], curcolor));
            }
        }
        this.isolator.searchAndIsolate(stru, curModello, this.isolate, this.zoom, this.color, this.hidden)
    }

    private updateParameters(cat : powerbi.DataViewCategorical){
        console.log("updating parameters");
        let RGBI : number[][] = [[], [], [], []];
        let color_reference : string[] = [];
        let value_reference : string[] = [];
        let value_color : string[] = [];
        this.urn = cat.values[0].values[0] instanceof String || typeof cat.values[0].values[0] === 'string'  ? <string>cat.values[0].values[0] : undefined; 
        this.client_id = cat.values[1].values[0] instanceof String || typeof cat.values[1].values[0] === 'string'  ? <string>cat.values[1].values[0] : undefined;
        this.client_secret = cat.values[2].values[0] instanceof String || typeof cat.values[2].values[0] === 'string'  ? <string>cat.values[2].values[0] : undefined
        this.id_column = cat.values[4].values[0] instanceof String || typeof cat.values[4].values[0] === 'string'  ? <string>cat.values[4].values[0] : undefined
        this.hidden = cat.values[5].values[0] != undefined ? cat.values[5].values[0].toString() === '1' : false;
        console.log("updated credentials")

        //update actions
        let sett = Number(cat.values[3].values[0].toString());
        if(sett != -1){
            this.zoom = sett % 2 === 1;
            this.isolate = (sett >> 1) % 2 === 1;
            this.color = (sett >> 2) % 2 === 1;
        }

        for(let val of cat.categories){
            let displayName = val.source.displayName;
            if(displayName === R){
               RGBI[0] = val.values.map((e) => {return Number(e.toString())});
            }
            if(displayName === G){
               RGBI[1] = val.values.map((e) => {return Number(e.toString())}); 
            }
            if(displayName === B){
               RGBI[2] = val.values.map((e) => {return Number(e.toString())}); 
            }
            if(displayName === I){
               RGBI[3] = val.values.map((e) => {return Number(e.toString())}); 
            }
            if(displayName === color_ref){
                color_reference = val.values.map((e) => {return e.toString()});
            }
            if(displayName === value_ref){
                value_reference = val.values.map((e) => {return e.toString()});
            }
            if(displayName === color_value){
                value_color = val.values.map((e) => {return e.toString()});
            }

            
        }
        let length = color_reference.length
        let samelength = true;
        for(let tmp of RGBI){
            samelength = length === tmp.length;
        }
        if(samelength){
            for(let i = 0; i < length; i ++){
                this.colorDict.set(color_reference[i], [RGBI[0][i], RGBI[1][i], RGBI[2][i], RGBI[3][i]])
            }
            console.log(this.colorDict);
        }
        if(value_color.length === value_reference.length){
            for(let i = 0; i < value_color.length; i ++){
                this.value_to_color.set(value_reference[i], value_color[i])
            }
            console.log(this.value_to_color);
        }
    }

}
