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
import {visualConnectorExtension} from './VisualConnector_extension';
let htmlText : string = 'no rendering?';
let viewId : string = 'forge-viewer';
let extensionid : string = 'selection_listener_extension';

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
    private connector_extension : Autodesk.Viewing.Extension;
    //TODO: remove hardcoded, give option to modify
    //the column name in the table where it is selected
    private id_column : string = 'Matricola';
    //the value to read to deduce the color
    private value_column : string = 'AnnoManutenzione';
    //the name of the model property corresponding to id_column
    private id_property : string = 'MATRICOLA';
    //the values to associate a color
    private color_values : string[] = ['2021', '2020', '2019'];
    //the colors to associate to the value, which will determine the color of the selected objects
    private colors : number[][] = [[0, 256, 0, 256], [256, 256, 0, 256], [256, 0, 0, 256]];

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
        /*console.log('Visual update', options);
        console.log(options.dataViews);*/
        let cat = options.dataViews[0].categorical;
        console.log(cat);
        let curcred : string[] = [this.client_id, this.client_secret, this.urn];
        //changing credentials
        this.urn = cat.values[0].values[0] instanceof String || typeof cat.values[0].values[0] === 'string'  ? <string>cat.values[0].values[0] : undefined; 
        this.client_id = cat.values[1].values[0] instanceof String || typeof cat.values[1].values[0] === 'string'  ? <string>cat.values[1].values[0] : undefined;
        this.client_secret = cat.values[2].values[0] instanceof String || typeof cat.values[2].values[0] === 'string'  ? <string>cat.values[2].values[0] : undefined


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
                    'panel_extension',
                    'connector_extension'
                    ]
                };
                this.forgeviewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(viewerDiv), config);
                console.log(this.forgeviewer.start());
                this.connector_extension = this.forgeviewer.getExtension('connector_extension');
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
                let connectext = visualConnectorExtension();
                Autodesk.Viewing.theExtensionManager.registerExtension("panel_extension", panelext);
                Autodesk.Viewing.theExtensionManager.registerExtension("connector_extension", connectext);
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
    /**
    * pass the options.categories used in the update function
    * the model objects will be isolated/colored accordingly (see class parameters)
    * **/
    private isolateBySelection(cat : powerbi.DataViewCategorical) : void{
        let curModello : string[];
        let curValues : string[];
        for(let obj of cat.categories){
            if(obj.source.displayName === this.id_column){
                //to determine how many rows there are
                if(obj.values.length > this.maxrows){
                    this.maxrows = obj.values.length
                }
                else if(obj.values.length < this.maxrows && obj.values.length > 0){
                    curModello = obj.values.map((e) => {return e.toString()})
                }
                curModello = obj.values.map((e) => {return e.toString()});
            }
            else if(obj.source.displayName === this.value_column){
                curValues = obj.values.map((e) => {return e.toString()})
            }
        }
        let stru : struct[] = [];
        for(let val of curValues){
            let curcolor = this.color_values.indexOf(val) >= 0 ? this.colors[this.color_values.indexOf(val)] : [0, 0, 0, 0];
            stru.push(new struct([this.id_property], curcolor));
        }
        console.log(stru, curModello);
        this.isolator.searchAndIsolate(stru, curModello, true, true, true)
    }

}
