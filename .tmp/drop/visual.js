var pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 699:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "n": () => (/* binding */ ForgeViewerVis)
/* harmony export */ });

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

let htmlText = 'no rendering?';
let viewId = 'forge-viewer';
//todo: remove hardcoded id
let client_id = 'uRw39cAMIF0HtSGMbuTEAoDRRntE6RBh';
let client_secret = 'mZAARANkvSeq2daZ';
let document_id = 'urn:dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6YnVja2V0X2hoL3JhY19hZHZhbmNlZF9zYW1wbGVfcHJvamVjdC5ydnQ=';
class ForgeViewerVis {
    constructor(options) {
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
    syncauth(succcallback) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("authenticate");
            let fetched = yield fetch("https://developer.api.autodesk.com/authentication/v1/authenticate", {
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
            });
            let jason = yield fetched.json();
            this.accessToken = jason.access_token;
            console.log("reached end of authentication");
            console.log(this.accessToken);
            succcallback();
        });
    }
    update(options) {
        /*console.log('Visual update', options);
        console.log(options.dataViews);*/
        let cat = options.dataViews[0].categorical;
        //console.log(cat.values[0]);
        let curcred = [this.client_id, this.client_secret, this.urn];
        this.urn = cat.values[0].values[0] instanceof String || typeof cat.values[0].values[0] === 'string' ? cat.values[0].values[0] : undefined;
        this.client_id = cat.values[1].values[0] instanceof String || typeof cat.values[1].values[0] === 'string' ? cat.values[1].values[0] : undefined;
        this.client_secret = cat.values[2].values[0] instanceof String || typeof cat.values[2].values[0] === 'string' ? cat.values[2].values[0] : undefined;
        console.log(curcred, [this.client_id, this.client_secret, this.urn]);
        if (this.client_id != undefined && this.client_secret != undefined && this.urn != undefined) {
            if (this.forgeviewer === undefined) {
                console.log("strapped");
                let cl = () => { console.log("finished authenticating"); this.initializeViewer(viewId); };
                this.syncauth(cl);
            }
            else {
                console.info("updating");
                if (this.client_id != curcred[0]) {
                    console.info("changing account");
                    this.syncauth(() => {
                        console.log("finished authenticating");
                        this.forgeviewer.finish();
                        this.forgeviewer = undefined;
                        this.initializeViewer(viewId);
                    });
                }
                else if (this.urn != curcred[2]) {
                    Autodesk.Viewing.Document.load(this.urn, this.onLoadSuccess, this.onLoadFailure);
                }
            }
        }
    }
    initializeViewer(viewerDiv) {
        return __awaiter(this, void 0, void 0, function* () {
            let aT = this.accessToken;
            let options = {
                env: 'AutodeskProduction',
                api: 'derivativeV2',
                extensions: ['Autodesk.ViewCubeUi'],
                getAccessToken: function (onTokenReady) {
                    let timeInSeconds = 3599;
                    onTokenReady(aT, timeInSeconds);
                }
            };
            yield this.getForgeviewerStyleAndSrc();
            Autodesk.Viewing.Initializer(options, () => {
                console.log("getting started");
                this.forgeviewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(viewerDiv));
                console.log(this.forgeviewer.start());
                this.myloadExtension('Autodesk.ViewCubeUi', (res) => { res.setVisible(false); });
                Autodesk.Viewing.Document.load(document_id, this.onLoadSuccess, this.onLoadFailure);
            });
        });
    }
    getForgeviewerStyleAndSrc() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("getting style");
            return new Promise((resolve, reject) => {
                let forgeViewerStyle = "https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css";
                let forgeViewerSrc = "https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.js";
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
                forgeViewerjs.onload = () => {
                    console.log("script loaded");
                    this.target.appendChild(forgeViewercss);
                    this.target.appendChild(forgeViewerDiv);
                    resolve();
                };
                //document.head.appendChild(securityIssue);
                this.target.appendChild(forgeViewerjs);
            });
        });
    }
    onLoadSuccess(doc) {
        console.log("SUCCESS");
        this.forgeviewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
    }
    onLoadFailure(errorCode) {
        console.log("load error: " + errorCode);
    }
    myloadExtension(name, succcallback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.forgeviewer.loadExtension(name).then((res) => { succcallback(res); });
        });
    }
}


/***/ }),

/***/ 738:
/***/ ((module) => {

module.exports = Function('return this')();

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _src_visual__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(699);
/* provided dependency */ var window = __webpack_require__(738);

var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];
var pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG = {
    name: 'pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG',
    displayName: 'pbi_viewer_test',
    class: 'ForgeViewerVis',
    apiVersion: '5.1.0',
    create: (options) => {
        if (_src_visual__WEBPACK_IMPORTED_MODULE_0__/* .ForgeViewerVis */ .n) {
            return new _src_visual__WEBPACK_IMPORTED_MODULE_0__/* .ForgeViewerVis */ .n(options);
        }
        throw 'Visual instance not found';
    },
    createModalDialog: (dialogId, options, initialState) => {
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
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG);

})();

pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG = __webpack_exports__;
/******/ })()
;
//# sourceMappingURL=https://localhost:8080/assets/visual.js.map