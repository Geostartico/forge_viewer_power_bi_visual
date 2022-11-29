"use strict"

import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
//import {ExtensionGetter} from "./ExtensionGetter";
import {PanelExtension} from "./panel_extension";
import {Isolator} from "./Isolator";
import {struct} from "./attribute_parser";
import {selectionManagerExtension} from './Selection_manager_extension'
//import {visualConnectorExtension} from './VisualConnector_extension';
let htmlText : string = 'no rendering?';
let viewId : string = 'forge-viewer';
let extensionid : string = 'connector_extension';
//strings used to identify the columns(the user can rename them to match these)
let color_value = "value_color";
let value_ref = "value_ref";
let color_ref = "color_ref";
let R = "R";
let G = "G";
let B = "B";
let I = "I";
let value_column = "value";
export class Visual implements IVisual {
    private target: HTMLElement;
    private pbioptions: VisualConstructorOptions;
    private selectionMan : powerbi.extensibility.ISelectionManager;
    private host : powerbi.extensibility.visual.IVisualHost;
    private selection_extension;
    private suppress_render_cycle : boolean
    private forgeviewer : Autodesk.Viewing.GuiViewer3D;
    private client_id : string | undefined;
    private client_secret : string | undefined;
    private accessToken : string | undefined;
    //urn of the model to be shown
    private urn : string | undefined;
    //object used to isalate, color, zoom on objects
    private isolator : Isolator;
    //options of the selection
    private zoom : boolean = true;
    private color : boolean = true;
    private isolate : boolean = true;
    private hidden : boolean = true
    //the column name in the table where it is selected, must match the name of the actual model property
    private id_column : string = '';
    //color to RGBI representation
    private colorDict : Map<string, number[]> = new Map<string, number[]>();
    //value of the column to the name of the color
    private value_to_color : Map<string, string> = new Map<string, string>();
    private pulledCode = false;

    constructor(options: VisualConstructorOptions) {
        console.log('Visual constructor', options);
        this.pbioptions = options;
        this.target = options.element;
        this.target.innerText = htmlText;
        console.log(this.target); 
        this.selectionMan = options.host.createSelectionManager();
        this.host = options.host;
        this.onLoadSuccess = this.onLoadSuccess.bind(this);
    }
    //method used to authenticate from syncronous functions
    private async syncauth(succcallback : Function){
        //fetching the access token
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
        //calls the callback given in case of success
        succcallback();
    }

    //called by power BI when something is changed in the report
    public update(options: VisualUpdateOptions) {
        if(!this.selection_extension){
            this.myGetExtension();
        }
        //where the tables given by the user are passed
        let cat = options.dataViews[0].categorical;
        console.log(cat);
        //saves the credentials before they are updated
        let curcred : string[] = [this.client_id, this.client_secret, this.urn];
        //changing parameters
        this.updateParameters(cat);
        if(this.selection_extension){
            this.selection_extension.setPropertyName(this.id_column);
            this.selection_extension.setSelectionHost(this.host);
            this.selection_extension.setOnNonVoidSelectionCallback((() => {this.suppress_render_cycle = true}).bind(this));
            this.selection_extension.setSelectionManager(this.selectionMan);
        }
        console.log("credentials", [this.urn, this.client_id, this.client_secret]);
        //at some point the credentials where set
        if(this.client_id != undefined && this.client_secret != undefined && this.urn != undefined){
            //the forge viewer was invalidated(wrong credentials) or it was never initialized
            if(this.forgeviewer === undefined){
                //when the authentication is finished the viewer is initialized
                let cl = () => {this.initializeViewer(viewId, cat)}; 
                this.syncauth(cl);
            }
            else{
                console.info("updating");
                //coloring based on the selection
                console.log(this.suppress_render_cycle);
                if(!this.suppress_render_cycle){
                    this.isolateBySelection(cat);
                }
                else{
                    this.suppress_render_cycle = false
                }
                //credentials changed
                if(this.client_id != curcred[0] || this.client_secret != curcred[1]){
                   console.info("changing account");
                   this.syncauth(() => {
                       this.forgeviewer.finish();
                       this.forgeviewer = undefined;
                       this.initializeViewer(viewId, cat);
                   });
               }
               //model changed
               else if(this.urn != curcred[2]){
                   Autodesk.Viewing.Document.load('urn:' + this.urn, (async (doc) => {await this.onLoadSuccess; this.isolateBySelection(cat)}).bind(this), this.onLoadFailure)
               }
            }
        }
    }

    public async initializeViewer(viewerDiv : string, cat : powerbi.DataViewCategorical) : Promise<void>{
        let aT = this.accessToken;
        //options for the viewer initialization
        let options = {
        env: 'AutodeskProduction',
        api: 'derivativeV2', 
        getAccessToken: (onTokenReady : any) =>{ 
            let timeInSeconds = 3599; 
            onTokenReady(aT, timeInSeconds); 
            }
        }
        //gets the needed code and the css to initialize the viewer
        if(!this.pulledCode){
            await this.getForgeviewerStyleAndSrc();
            this.pulledCode = true;
        }
        //function used to initialize viewer
        Autodesk.Viewing.Initializer(options, () =>{
                console.log("getting started");
                //specifies extensions to load in the viewer
                let config = {extensions: 
                    [
                    'Autodesk.ViewCubeUi',
                    'panel_extension',
                    'selection_manager_extension'
                    ]
                };
                this.forgeviewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(viewerDiv), config);
                console.log(this.forgeviewer.start());
                this.isolator = new Isolator(this.forgeviewer);
                //this.forgeviewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, ((e) => {this.forgeviewer.getProperties(e.dbIdArray[0], (k) => {console.log(k);})}).bind(this));
                //extension to hide viewCube
                this.myloadExtension('Autodesk.ViewCubeUi', (res) => {res.setVisible(false);});
                Autodesk.Viewing.Document.load('urn:' + this.urn, (async (doc) => {await this.onLoadSuccess(doc); this.isolateBySelection(cat)}).bind(this), this.onLoadFailure);
            });
    }
    //fetched needed js and css code for the viewer to run
    private async getForgeviewerStyleAndSrc() : Promise<void>{
        console.log("getting style");
        return new Promise<void>((resolve, reject) =>{
            let forgeViewerStyle = "https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css" 
            let forgeViewerSrc = "https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.js"
            //might be needed to run the viewer on chrome, currently doesn't work
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
            //the code must be loaded in order for the next operations to work correctly, therefore the code is run only after the loading is finished
            forgeViewerjs.onload = () =>{
                console.log("script loaded");
                let panelext = PanelExtension();
                //registers the user defined extensions
                Autodesk.Viewing.theExtensionManager.registerExtension("panel_extension", panelext);
                Autodesk.Viewing.theExtensionManager.registerExtension('selection_manager_extension', selectionManagerExtension())
                //appends css and the div of the viewer to target div
                this.target.appendChild(forgeViewercss);
                this.target.appendChild(forgeViewerDiv);
                resolve();
            }
            //document.head.appendChild(securityIssue);
            //appedns js to the target div
            this.target.appendChild(forgeViewerjs);
           
        }) 
    }

    //function callsed when the document is loaded correctly
    private async onLoadSuccess(doc :Autodesk.Viewing.Document){
        console.log("SUCCESS");
        //loads the document on the viewer, visualising it
        await this.forgeviewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry())
    }
    //generic function used in case of error
    private onLoadFailure(errorCode){
        console.log("load error: " + errorCode);
    }
    //used in case a command must be run on an extension
    private async myloadExtension(name : string, succcallback : Function){
        this.forgeviewer.loadExtension(name).then((res) => {succcallback(res)});
    } 

    /**
    * pass the options.categories used in the update function
    * the model objects will be isolated/colored accordingly (see class parameters)
    * **/
    private async isolateBySelection(cat : powerbi.DataViewCategorical){
        //colora di default, in caso aggiungeremo funzione per resettare
        console.log("PCOnsanjsbnfdsofib");
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
        //retrieves the columns of the value to determine the color and the identifier of the color
        for(let obj of cat.categories){
            if(obj.source.displayName === this.id_column){
                if(this.selection_extension){
                    this.selection_extension.setSelectables(obj);
                }
                curModello = obj.values.map((e) => {return e.toString()});
                console.log("ids found: ", curModello);
            }
            else if(obj.source.displayName === value_column){
                curValues = obj.values.map((e) => {return e.toString()});
                console.log("values found: ", curValues);
            }
        }
        //creates data structures used by isolator
        let stru : struct[] = [];
        if(curValues != undefined){
            for(let val of curValues){
                let curcolor = this.value_to_color.has(val)? this.colorDict.get(this.value_to_color.get(val)) : [0, 0, 0, 0];
                stru.push(new struct([this.id_column], curcolor));
            }
        }
        //the isolator highlights the given models (determined by the id), according to the set options
        this.isolator.searchAndIsolate(stru, curModello, this.isolate, this.zoom, this.color, this.hidden)
    }

    //updates the parameters using the passed columns
    private updateParameters(cat : powerbi.DataViewCategorical){
        console.log("updating parameters");
        let RGBI : number[][] = [[], [], [], []];
        let color_reference : string[] = [];
        let value_reference : string[] = [];
        let value_color : string[] = [];
        //updates credentials
        this.urn = cat.values[0].values[0] instanceof String || typeof cat.values[0].values[0] === 'string'  ? <string>cat.values[0].values[0] : undefined; 
        this.client_id = cat.values[1].values[0] instanceof String || typeof cat.values[1].values[0] === 'string'  ? <string>cat.values[1].values[0] : undefined;
        this.client_secret = cat.values[2].values[0] instanceof String || typeof cat.values[2].values[0] === 'string'  ? <string>cat.values[2].values[0] : undefined
        //updates the name of the column identifying the id
        this.id_column = cat.values[4].values[0] instanceof String || typeof cat.values[4].values[0] === 'string'  ? <string>cat.values[4].values[0] : undefined
        //column determining if the highlighted elements are hidden completely or not
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
            //Red column
            if(displayName === R){
               RGBI[0] = val.values.map((e) => {return Number(e.toString())});
            }
            //green column
            if(displayName === G){
               RGBI[1] = val.values.map((e) => {return Number(e.toString())}); 
            }
            //blue column
            if(displayName === B){
               RGBI[2] = val.values.map((e) => {return Number(e.toString())}); 
            }
            //intensity column
            if(displayName === I){
               RGBI[3] = val.values.map((e) => {return Number(e.toString())}); 
            }
            //color column
            if(displayName === color_ref){
                color_reference = val.values.map((e) => {return e.toString()});
            }
            //value column associated to the color
            if(displayName === value_ref){
                value_reference = val.values.map((e) => {return e.toString()});
            }
            //color associated to the value
            if(displayName === color_value){
                value_color = val.values.map((e) => {return e.toString()});
            }

            
        }
        //checking if all the columns are given
        let length = color_reference.length
        let samelength = true;
        for(let tmp of RGBI){
            samelength = length === tmp.length;
        }
        if(samelength){
            //inserting the colors in a map
            for(let i = 0; i < length; i ++){
                this.colorDict.set(color_reference[i], [RGBI[0][i], RGBI[1][i], RGBI[2][i], RGBI[3][i]])
            }
            console.log(this.colorDict);
        }
        //if both the color and the value are given
        if(value_color.length === value_reference.length){
            //inserts the associations value-color in a map
            for(let i = 0; i < value_color.length; i ++){
                this.value_to_color.set(value_reference[i], value_color[i])
            }
            console.log(this.value_to_color);
        }
    }

    private async myGetExtension(){
        if(this.forgeviewer){
            this.forgeviewer.getExtension('selection_manager_extension', ((ext) => {this.selection_extension = ext}));
        }
    }

}
