"use strict";

import powerbi from "powerbi-visuals-api";
import "./../style/visual.less";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;
import {ExtensionGetter} from "./ExtensionGetter"
let htmlText : string = 'no rendering?'
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
        console.log("authenticate");
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
        console.log("reached end of authentication");
        console.log(this.accessToken);
        succcallback();
    }


    public update(options: VisualUpdateOptions) {
        /*console.log('Visual update', options);
        console.log(options.dataViews);*/
        let cat = options.dataViews[0].categorical;
        //console.log(cat.values[0]);
        let curcred : string[] = [this.client_id, this.client_secret, this.urn];
        this.urn = cat.values[0].values[0] instanceof String || typeof cat.values[0].values[0] === 'string'  ? cat.values[0].values[0] as string : undefined; 
        this.client_id = cat.values[1].values[0] instanceof String || typeof cat.values[1].values[0] === 'string'  ? cat.values[1].values[0] as string : undefined;
        this.client_secret = cat.values[2].values[0] instanceof String || typeof cat.values[2].values[0] === 'string'  ? cat.values[2].values[0] as string : undefined

        console.log(curcred, [this.client_id, this.client_secret, this.urn]);

        if(this.client_id != undefined && this.client_secret != undefined && this.urn != undefined){
            if(this.forgeviewer === undefined){
                console.log("strapped");
                let cl = () => {console.log("finished authenticating"); this.initializeViewer(viewId)}; 
                this.syncauth(cl);
            }
            else{
               console.info("updating");
               if(this.client_id != curcred[0]){
                   console.info("changing account");
                   this.syncauth(() => {
                       console.log("finished authenticating");
                       this.forgeviewer.finish();
                       this.forgeviewer = undefined;
                       this.initializeViewer(viewId);
                   });
               }
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
                let config = {extensions: ['Autodesk.ViewCubeUi',
                     extensionid]};
                this.forgeviewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(viewerDiv), config);
                console.log(this.forgeviewer.start());
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
                let extension = ExtensionGetter.SelectDesk(Autodesk);
                Autodesk.Viewing.theExtensionManager.registerExtension(extensionid, extension)
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
}
