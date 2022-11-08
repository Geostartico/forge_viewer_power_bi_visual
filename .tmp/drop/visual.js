var pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 314:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "V": () => (/* binding */ ExtensionGetter)
/* harmony export */ });
class ExtensionGetter {
    static SelectDesk(desk) {
        class x extends desk.Viewing.Extension {
            constructor(viewer, options) {
                super(viewer, options);
                this.modelLoaded = false;
                this.selectionStarted = false;
            }
            listener(event) {
                console.log(event.dbIdArray);
            }
            load() {
                console.log("selection listener loaded");
                this.viewer.addEventListener(desk.Viewing.SELECTION_CHANGED_EVENT, this.selectionListener.bind(this));
                this.viewer.addEventListener(desk.Viewing.MODEL_ADDED_EVENT, ((event) => { console.log("modelLoaded: "); this.modelLoaded = true; }).bind(this));
                return true;
            }
            unload() {
                console.log("extension unloaded");
                return true;
            }
            selectionListener(event) {
                console.log("element selected" + event.dbIdArray);
                let succcallback = (dbIds) => {
                    console.log(dbIds);
                    for (let i = 0; i < dbIds.length; i++) {
                        this.viewer.getProperties(dbIds[i], (prop) => { console.log("dbId" + dbIds[i], prop); });
                    }
                    let id = dbIds[0];
                    let tree = this.viewer.model.getInstanceTree();
                    let i = 0;
                    while (i < 10) {
                        id = tree.getNodeParentId(id);
                        this.viewer.getProperties(id, (prop) => { console.log("dbId " + id, prop); });
                        i++;
                    }
                    this.isolateChildren(dbIds.map((elem) => { return elem; /* + 1*/ }));
                    this.viewer.fitToView(dbIds);
                    this.selectionStarted = false;
                };
                let errCallback = (err) => { console.log("an error has occured in the search: " + err); };
                //this.viewer.isolate(event.dbIdArray);
                this.viewer.getProperties(Array.isArray(event.dbIdArray) ? event.dbIdArray[0] : event.dbIdArray, (res) => { console.log("dbid properties:"); console.log(res); }, (err) => { console.log("error has accurred fetching properties: " + err); });
                if (event.dbIdArray != undefined && this.modelLoaded && !this.selectionStarted) {
                    this.selectionStarted = true;
                    console.log("starting search");
                    this.viewer.search('"' + "Glass" + '"', succcallback.bind(this), errCallback, ['Material'], { searchHidden: true, includeInherited: true });
                }
            }
            isolateChildren(dbIds) {
                console.log("dbIds: ", dbIds);
                let tree = this.viewer.model.getInstanceTree();
                let leafIDs = this.getLeaves(dbIds, tree);
                let allIds = this.getLeaves([tree.getRootId()], tree);
                let unwanted = allIds.filter((id) => { return leafIDs.indexOf(id) < 0; });
                console.log("unwanted: ", unwanted);
                console.log('leaves', leafIDs);
                this.viewer.isolate(leafIDs);
                for (let i of unwanted) {
                    this.viewer.impl.visibilityManager.setNodeOff(i, true);
                }
            }
            getLeaves(dbIds, tree) {
                let leaves = [];
                for (let i = 0; i < dbIds.length; i++) {
                    let subchildren = (id) => {
                        if (tree.getChildCount(id) === 0) {
                            leaves.push(id);
                        }
                        tree.enumNodeChildren(id, (child) => { subchildren(child); });
                    };
                    subchildren(dbIds[i]);
                }
                return leaves;
            }
        }
        ;
        /*
        extension = (viewer, options) => {
            desk.Viewing.Extension.call(viewer, options);
        }
        extension.prototype = Object.create(desk.Viewing.Extension.prototype);
        extension.prototype.selectionChangedAgent = (event) => {
            console.log(event.dbIdArray);
        };
        extension.prototype.constructor = extension;
        extension.prototype.load = () => {
            console.log("selection listener loaded");
            //if(this != undefined){
                //this?.viewer.addEventListener(ExtensionGetter.Autodesk.Viewing.SELECTION_CHANGED_EVENT, selectionlistenerextension.prototype.selectionChangedAgent);
            //}
            return true
        };
        extension.prototype.unload = () => {
            console.log("extension unloaded");
            return true
        }
        console.log(extension);*/
        return x;
    }
    ;
}


/***/ }),

/***/ 303:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "O": () => (/* binding */ isolateFunction)
/* harmony export */ });
function isolateFunction(dbIds, tree /*instance tree*/, viewer) {
    console.log("dbIds: ", dbIds);
    let leafIDs = getLeaves(dbIds, tree);
    let allIds = getLeaves([tree.getRootId()], tree);
    let unwanted = allIds.filter((id) => { return leafIDs.indexOf(id) < 0; });
    console.log("unwanted: ", unwanted);
    console.log('leaves', leafIDs);
    viewer.isolate(leafIDs);
    for (let i of unwanted) {
        viewer.impl.visibilityManager.setNodeOff(i, true);
    }
}
function getLeaves(dbIds, tree) {
    let leaves = [];
    for (let i = 0; i < dbIds.length; i++) {
        let subchildren = (id) => {
            if (tree.getChildCount(id) === 0) {
                leaves.push(id);
            }
            tree.enumNodeChildren(id, (child) => { subchildren(child); });
        };
        subchildren(dbIds[i]);
    }
    return leaves;
}


/***/ }),

/***/ 931:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "b": () => (/* binding */ PanelExtension)
/* harmony export */ });
/* harmony import */ var _isolateFunction__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(303);

class PanelExtension {
    static SELECT_DESK(desk) {
        class panel extends desk.Viewing.UI.DockingPanel {
            constructor(viewer, container, id, title, options = {}) {
                super(container, id, title, options);
                this.viewer = viewer;
            }
            initialize() {
                //remove this, testing the parser
                //console.log(attributeParser('cane, gatto, uccello, pippo paperino', '[materiale, personalità, hotel] (56, 94, 45, 75); [non io, tu, noi] (45, 67, 255, 156);'));
                this.container.style.top = "10px";
                this.container.style.left = "10px";
                this.container.style.width = "auto";
                this.container.style.height = "auto";
                this.container.style.resize = "auto";
                // title bar
                this.titleBar = this.createTitleBar(this.titleLabel || this.container.id);
                this.container.appendChild(this.titleBar);
                // close button
                this.closeButton = this.createCloseButton();
                this.container.appendChild(this.closeButton);
                // allow move
                this.initializeMoveHandlers(this.titleBar);
                // the main content area
                this.container.appendChild(this.createScrollContainer());
                // footer
                this.container.appendChild(this.createFooter());
                //create div to contain the menu, containing a form with two fields: attributename and attributevalue and a button to commit
                this.div = document.createElement('div');
                this.form = document.createElement('form');
                let txt = document.createElement("span");
                txt.innerText = "Attribute Name to search";
                //text input for attributeName
                this.attributeNameInput = document.createElement('input');
                this.attributeNameInput.type = 'text';
                this.attributeNameInput.id = 'attributeNameInput';
                this.attributeNameInput.name = 'attribute Name';
                this.attributeNameInput.addEventListener('input', this.updateAttributeName.bind(this));
                let txt2 = document.createElement('span');
                txt2.innerText = 'Attribute value to search';
                //text input for attributeValue
                this.attributeValueInput = document.createElement('input');
                this.attributeValueInput.type = 'text';
                this.attributeValueInput.id = 'attributeValueInput';
                this.attributeValueInput.name = 'attribute value';
                this.attributeValueInput.addEventListener('input', this.updateAttributeValue.bind(this));
                //submit Button
                this.submitButton = document.createElement('input');
                this.submitButton.type = 'submit';
                this.submitButton.value = 'start query';
                this.submitButton.addEventListener('click', this.onClickSubmit.bind(this));
                //clear button
                this.clearButton = document.createElement('input');
                this.clearButton.type = 'submit';
                this.clearButton.value = 'clear selections';
                this.clearButton.addEventListener('click', this.clear.bind(this));
                //attach elements to form
                this.form.appendChild(txt);
                this.form.appendChild(this.attributeNameInput);
                this.form.appendChild(document.createElement('br'));
                this.form.appendChild(txt2);
                this.form.appendChild(this.attributeValueInput);
                this.form.appendChild(document.createElement('br'));
                this.form.appendChild(this.submitButton);
                this.form.appendChild(document.createElement('br'));
                this.form.appendChild(this.clearButton);
                this.div.appendChild(this.form);
                this.scrollContainer.appendChild(this.div);
            }
            updateAttributeName(event) {
                this.attrName = event.target.value;
                console.log("attribute name: ", this.attrName);
            }
            updateAttributeValue(event) {
                this.attrValue = event.target.value;
                console.log("attribute value: ", this.attrValue);
            }
            onClickSubmit(event) {
                this.clear();
                this.viewer.search('"' + this.attrValue + '"', this.succcallback.bind(this), this.errCallback, [this.attrName], { searchHidden: true, includeInherited: true });
            }
            //restores model visibility to default
            clear(event = null) {
                console.log("clearing");
                this.viewer.impl.visibilityManager.setNodeOff(this.viewer.model.getRootId(), false);
                this.viewer.isolate();
            }
            succcallback(dbIds) {
                if (dbIds.length === 0) {
                    return;
                }
                let tree = this.viewer.model.getInstanceTree();
                (0,_isolateFunction__WEBPACK_IMPORTED_MODULE_0__/* .isolateFunction */ .O)(dbIds, tree, this.viewer);
                for (let dbid of dbIds) {
                    //!!!!AYO!!!!!
                    this.viewer.setThemingColor(dbid, new THREE.Vector4(1, 0, 0, 1), this.viewer.model, true);
                }
                this.viewer.fitToView(dbIds[0]);
            }
            errCallback(err) {
                console.log("an error occured during the search: ", err);
            }
        }
        class exte extends desk.Viewing.Extension {
            constructor(viewer, options) {
                super(viewer, options);
            }
            load() {
                console.log("loading DockingPanel");
                this.pn = new panel(this.viewer, this.viewer.container, 'panelID', 'panelTitle');
                console.log(this.pn);
                this.pn.setVisible(true);
                return true;
            }
            unload() {
                console.log("unload DockingPanel");
                return true;
            }
        }
        return exte;
    }
}


/***/ }),

/***/ 85:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "u": () => (/* binding */ Visual)
/* harmony export */ });
/* harmony import */ var _ExtensionGetter__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(314);
/* harmony import */ var _panel_extension__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(931);

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
let extensionid = 'selection_listener_extension';
class Visual {
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
            //console.log("authenticate");
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
            //console.log("reached end of authentication");
            //console.log(this.accessToken);
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
        //console.log(curcred, [this.client_id, this.client_secret, this.urn]);
        if (this.client_id != undefined && this.client_secret != undefined && this.urn != undefined) {
            if (this.forgeviewer === undefined) {
                //console.log("strapped");
                let cl = () => { /*console.log("finished authenticating")*/ ; this.initializeViewer(viewId); };
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
                    Autodesk.Viewing.Document.load('urn:' + this.urn, this.onLoadSuccess, this.onLoadFailure);
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
                getAccessToken: (onTokenReady) => {
                    let timeInSeconds = 3599;
                    onTokenReady(aT, timeInSeconds);
                }
            };
            yield this.getForgeviewerStyleAndSrc();
            Autodesk.Viewing.Initializer(options, () => {
                console.log("getting started");
                let config = { extensions: ['Autodesk.ViewCubeUi',
                        /*extensionid*/ 'panel_extension'] };
                this.forgeviewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(viewerDiv), config);
                console.log(this.forgeviewer.start());
                this.myloadExtension('Autodesk.ViewCubeUi', (res) => { res.setVisible(false); });
                Autodesk.Viewing.Document.load('urn:' + this.urn, this.onLoadSuccess, this.onLoadFailure);
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
                    let extension = _ExtensionGetter__WEBPACK_IMPORTED_MODULE_0__/* .ExtensionGetter.SelectDesk */ .V.SelectDesk(Autodesk);
                    let panelext = _panel_extension__WEBPACK_IMPORTED_MODULE_1__/* .PanelExtension.SELECT_DESK */ .b.SELECT_DESK(Autodesk);
                    Autodesk.Viewing.theExtensionManager.registerExtension(extensionid, extension);
                    Autodesk.Viewing.theExtensionManager.registerExtension("panel_extension", panelext);
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
/* harmony import */ var _src_visual__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(85);
/* provided dependency */ var window = __webpack_require__(738);

var powerbiKey = "powerbi";
var powerbi = window[powerbiKey];
var pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG = {
    name: 'pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG',
    displayName: 'pbi_viewer_test',
    class: 'Visual',
    apiVersion: '5.1.0',
    create: (options) => {
        if (_src_visual__WEBPACK_IMPORTED_MODULE_0__/* .Visual */ .u) {
            return new _src_visual__WEBPACK_IMPORTED_MODULE_0__/* .Visual */ .u(options);
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