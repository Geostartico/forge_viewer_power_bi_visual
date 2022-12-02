var pbiviewertestB15982BC11F74E40B7A6B4503F50947D_DEBUG;
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 438:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "B": () => (/* binding */ Isolator)
/* harmony export */ });
/* harmony import */ var _isolateFunction__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(303);
/* harmony import */ var async_mutex__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(643);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


//class to isolate, color, zoom and hide elements
class Isolator {
    constructor(aviewer) {
        this.mutexOnfunction = new async_mutex__WEBPACK_IMPORTED_MODULE_0__/* .Mutex */ .WU();
        this.mutexOnParameters = new async_mutex__WEBPACK_IMPORTED_MODULE_0__/* .Mutex */ .WU();
        this.viewer = aviewer;
    }
    //clears all modifications
    clear() {
        this.viewer.impl.visibilityManager.setNodeOff(this.viewer.model.getRootId(), false);
        this.viewer.isolate();
        this.viewer.clearThemingColors(this.viewer.model);
        this.viewer.fitToView();
    }
    //elements where the avalues[i] is contained in the property fields anames.names[i].names, according to the color anames.names[i].color
    searchAndIsolate(anames, avalues, isolate, zoom, paint, hide) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.mutexOnfunction.acquire();
            this.clear();
            if (anames.length === 0) {
                return;
            }
            if (anames.length != avalues.length) {
                throw new Error('the values and structs must be the same number');
            }
            this.isolate = isolate;
            this.zoom = zoom;
            this.paint = paint;
            this.hide = hide;
            this.curDbids = new Set();
            this.dbidToColor = new Map();
            this.numOfNames = anames.length;
            this.curDone = 0;
            this.searchParam = { names: anames, vals: avalues };
            for (let i = 0; i < this.searchParam.vals.length; i++) {
                this.viewer.search('"' + this.searchParam.vals[i] + '"', this.succcallback.bind(this), this.errCallback, this.searchParam.names[i].names, { searchHidden: true, includeInherited: true });
            }
        });
    }
    //accidentally implemented this function misunderstanding a feature
    //it colors based on the value of a property
    searchAndColorByValue(field, keyword, valueField, valueToColor, clearPrev = true) {
        this.curDbids = new Set();
        if (clearPrev) {
            this.clear();
        }
        let succcallback2 = (dbids) => {
            for (let i of dbids) {
                this.curDbids.add(i);
            }
            let valueFieldUpper = valueField.toUpperCase();
            for (let db of this.curDbids.values()) {
                this.viewer.getProperties(db, (prop) => {
                    for (let erty of prop.properties) {
                        if (erty.displayName.toUpperCase() == valueFieldUpper) {
                            if (valueToColor.has(erty.displayValue.toString())) {
                                //console.log(valueToColor.get(erty.displayValue.toString()));
                                let cl = valueToColor.get(erty.displayValue.toString()).map((e) => { return e / 256; });
                                this.viewer.setThemingColor(db, new THREE.Vector4(cl[0], cl[1], cl[2], cl[3]), this.viewer.model, true);
                            }
                        }
                    }
                }, this.errCallback);
            }
            (0,_isolateFunction__WEBPACK_IMPORTED_MODULE_1__/* .isolateFunction */ .O)(dbids, this.viewer.model.getInstanceTree(), this.viewer, this.hide);
        };
        this.viewer.search('"' + keyword + '"', succcallback2.bind(this), this.errCallback, [field], { searchHidden: true, includeInherited: true });
    }
    succcallback(dbids) {
        return __awaiter(this, void 0, void 0, function* () {
            //insert new dbids and associate them with the correct color
            yield this.mutexOnParameters.acquire();
            for (let i of dbids) {
                this.curDbids.add(i);
                if (!this.dbidToColor.has(i)) {
                    this.dbidToColor.set(i, [this.searchParam.names[this.curDone].color]);
                }
                else {
                    //the same dbid could satisfy more than one condition
                    this.dbidToColor.set(i, this.dbidToColor.get(i).concat([this.searchParam.names[this.curDone].color]));
                }
            }
            this.curDone++;
            //it's the last iteration, isolate and paint
            if (this.curDone === this.numOfNames) {
                console.log("FATTO");
                this.clear();
                let tree = this.viewer.model.getInstanceTree();
                //isolate
                if (this.isolate) {
                    (0,_isolateFunction__WEBPACK_IMPORTED_MODULE_1__/* .isolateFunction */ .O)(Array.from(this.curDbids.values()), tree, this.viewer, this.hide);
                }
                //paint
                if (this.paint) {
                    this.dbidToColor.forEach((colors, num) => {
                        //averages the colors that should color the object
                        let avgcolor = this.average(colors, 256);
                        let threeAvgColor = new THREE.Vector4(avgcolor[0], avgcolor[1], avgcolor[2], avgcolor[3]);
                        this.viewer.setThemingColor(num, threeAvgColor, this.viewer.model, true);
                    });
                }
                if (this.zoom) {
                    this.viewer.fitToView(Array.from(this.curDbids.values()));
                }
                this.mutexOnfunction.release();
            }
            this.mutexOnParameters.release();
        });
    }
    errCallback(err) {
        console.log('an error has occured during search', err);
    }
    //the length of every array must be the same
    average(arrs, normalization = 1) {
        let ret = [];
        for (let i = 0; i < arrs[0].length; i++) {
            let sum = 0;
            for (let ii = 0; ii < arrs.length; ii++) {
                sum += arrs[ii][i];
            }
            sum /= arrs.length;
            sum /= normalization;
            ret.push(sum);
        }
        return ret;
    }
}


/***/ }),

/***/ 8:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "x": () => (/* binding */ selectionManagerExtension)
/* harmony export */ });
/* harmony import */ var async_mutex__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(643);
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

//extension manages selection on other powerbi tables
function selectionManagerExtension() {
    class ext extends Autodesk.Viewing.Extension {
        constructor(viewer, options) {
            super(viewer, options);
            //map that associates the value of propertyName for a object to the selectionID
            this.idToSelector = new Map();
        }
        load() {
            //adds listener to viewer event
            this.viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, (this.selectionCallback).bind(this));
            console.log('selectionManagerExtension loaded');
            return true;
        }
        setSelectionHost(host) {
            this.host = host;
        }
        //updates selectable objects
        setSelectables(cat) {
            if (!this.host) {
                return;
            }
            for (let i = 0; i < cat.values.length; i++) {
                //generates selectionIds and puts them into the map
                this.idToSelector.set(cat.values[i].toString(), this.host.createSelectionIdBuilder().withCategory(cat, i).createSelectionId());
            }
        }
        setPropertyName(name) {
            if (name) {
                this.propertyName = name;
            }
        }
        setOnNonVoidSelectionCallback(fn) {
            this.onClickCallBack = fn;
        }
        setOnVoidSelectionCallback(fn) {
            this.onVoidClickCallBack = fn;
        }
        //function called when a selection is made
        selectionCallback(event) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Selection on the viewer was made");
                if (!this.selectionManager && this.host) {
                    this.selectionManager = this.host.createSelectionManager();
                }
                console.log("selectables", this.idToSelector);
                let dbIds = event.dbIdArray;
                //no elements were selected
                if (dbIds.length === 0 && this.onVoidClickCallBack) {
                    this.onVoidClickCallBack();
                    this.selectionManager.clear();
                    return;
                }
                let toSelect = [];
                let sem;
                //for each dbId i verify its propertyName value and determine its SelectionID
                if (this.host && this.selectionManager) {
                    sem = new async_mutex__WEBPACK_IMPORTED_MODULE_0__/* .Semaphore */ .L3(dbIds.length);
                    for (let dbid of dbIds) {
                        yield sem.acquire();
                        yield this.viewer.getProperties(dbid, ((pr) => {
                            console.log("gettingProperties");
                            for (let prop of pr.properties) {
                                if (prop.displayName === this.propertyName) {
                                    console.log("property found");
                                    if (this.idToSelector.has(prop.displayValue.toString())) {
                                        toSelect.push(this.idToSelector.get(prop.displayValue.toString()));
                                    }
                                }
                            }
                            sem.release();
                        }).bind(this));
                    }
                }
                if (sem) {
                    //await for all the callbacks to finish
                    yield sem.acquire(dbIds.length);
                }
                console.log(toSelect);
                if (toSelect.length === 0) {
                    return;
                }
                if (this.onClickCallBack) {
                    this.onClickCallBack();
                }
                //if the selections are not clear beforehand they are gonna be stacked
                this.selectionManager.clear();
                this.selectionManager.select(toSelect, true);
            });
        }
    }
    return ext;
}


/***/ }),

/***/ 323:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "V": () => (/* binding */ attributeParser),
/* harmony export */   "n": () => (/* binding */ struct)
/* harmony export */ });
/**
 * name format: [name1, name2, name3] (number, number, number, number); ... (the number must be between 0 and 256)
 * value format: val1, val2, val3 ...
 * **/
class struct {
    constructor(str, nm) {
        this.names = str;
        this.color = nm;
    }
}
//used by the panel extension to parse the given parameters
function attributeParser(attributeVals, attributeNames) {
    let dividedvals = parseVals(attributeVals);
    let divideNames = parseNames(attributeNames);
    return { names: divideNames, vals: dividedvals };
}
function parseVals(values) {
    return values.split(',').map((str) => { return str.trim(); });
}
function parseNames(names) {
    let curStart;
    let curEnd;
    let curNames;
    let curColor;
    let ret = [];
    for (let i = 0; i < names.length; i++) {
        //list of names to search in
        if (names.charAt(i) === '[') {
            curStart = i;
            while (i < names.length && names.charAt(i) != ']') {
                i++;
            }
            curNames = divideNames(names.slice(curStart + 1, i));
        }
        //color to associate
        if (names.charAt(i) === '(') {
            curStart = i;
            while (i < names.length && names.charAt(i) != ')') {
                i++;
            }
            curColor = parseColor(names.slice(curStart + 1, i));
        }
        //end of couple
        if (names.charAt(i) === ';') {
            if (curNames === undefined || curColor === undefined) {
                throw new Error("for every list of names there must be a color and vice versa");
            }
            ret.push(new struct(curNames, curColor));
            curNames = undefined;
            curColor = undefined;
        }
    }
    if (curNames != undefined || curColor != undefined) {
        throw new Error("please end every couple name,string with a semicolon");
    }
    return ret;
}
function divideNames(str) {
    return str.split(',').map((st) => { return st.trim(); });
}
function parseColor(str) {
    return str.split(',').map((st) => {
        let nm = Number(st);
        if (nm > 256 || nm < 0) {
            throw new Error("RGB colors values must be in [0, 256]");
        }
        return Number(st);
    });
}


/***/ }),

/***/ 303:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "O": () => (/* binding */ isolateFunction)
/* harmony export */ });
//used to isolate the elements identified by the id
function isolateFunction(dbIds, tree /*instance tree*/, viewer, hide) {
    console.log("dbIds: ", dbIds);
    let leafIDs = getLeaves(dbIds, tree);
    let allIds = getLeaves([tree.getRootId()], tree);
    let unwanted = allIds.filter((id) => { return leafIDs.indexOf(id) < 0; });
    console.log("unwanted: ", unwanted);
    console.log('leaves', leafIDs);
    viewer.isolate(leafIDs);
    if (hide) {
        for (let i of unwanted) {
            viewer.impl.visibilityManager.setNodeOff(i, true);
        }
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
/* harmony import */ var _attribute_parser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(323);
/* harmony import */ var _Isolator__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(438);


/**
 * the class extends Autodesk.Viewing.UI.DockingPanel, if it is imported in another file the class is evaluated, unfortunately
 * the code for autodesk is imported in runtime, therefore before the import Autodesk is undefined, making the code stop when
 * Autodesk.Viewing is evaluated. the smarter solution would be to dynamically import the class, but it returns a syntax error
 * in the code for which i don't have an exact explanation
 * **/
function PanelExtension() {
    //actual panel to insert the query
    class Panel extends Autodesk.Viewing.UI.DockingPanel {
        constructor(viewer, container, id, title, options = {}) {
            super(container, id, title, options);
            this.viewer = viewer;
            this.isol = new _Isolator__WEBPACK_IMPORTED_MODULE_0__/* .Isolator */ .B(this.viewer);
        }
        initialize() {
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
            this.container.appendChild(this.createScrollContainer({}));
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
            //file input
            this.fileInput = document.createElement('input');
            this.fileInput.type = 'file';
            this.fileInput.id = 'fileinput';
            this.fileInput.name = 'upload file';
            this.fileInput.accept = 'csv';
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
            this.form.appendChild(this.fileInput);
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
        //performs query when the form is submitted
        onClickSubmit(event) {
            this.clear();
            this.searchParam = (0,_attribute_parser__WEBPACK_IMPORTED_MODULE_1__/* .attributeParser */ .V)(this.attrValue, this.attrName);
            if (this.searchParam.names.length != this.searchParam.vals.length) {
                console.log(this.searchParam);
                throw new Error("You must have the same number of name lists and keywords");
            }
            this.curDone = 0;
            this.numOfNames = this.searchParam.vals.length;
            this.dbidToColor = new Map();
            this.curDbids = new Set();
            this.isol.searchAndIsolate(this.searchParam.names, this.searchParam.vals, true, true, true, true);
        }
        //restores model visibility to default
        clear(event = null) {
            console.log("clearing");
            this.isol.clear();
        }
    }
    //extension of the viewer to implement the panel
    class PanelExt extends Autodesk.Viewing.Extension {
        constructor(viewer, options) {
            super(viewer, options);
        }
        load() {
            console.log("loading DockingPanel");
            return true;
        }
        unload() {
            console.log("unload DockingPanel");
            return true;
        }
        //initializes ui elements 
        onToolbarCreated(toolbar) {
            var viewer = this.viewer;
            // Button 1
            this.btn = new Autodesk.Viewing.UI.Button('show-env-bg-button');
            this.btn.onClick = ((e) => {
                this.pn = new Panel(this.viewer, this.viewer.container, 'searchPanel', 'search');
                this.pn.setVisible(true);
            }).bind(this);
            this.btn.addClass('open-panel-button');
            this.btn.setToolTip('open search panel');
            // SubToolbar
            this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('my-custom-toolbar');
            this.subToolbar.addControl(this.btn);
            toolbar.addControl(this.subToolbar);
        }
        ;
    }
    return PanelExt;
}


/***/ }),

/***/ 85:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "u": () => (/* binding */ Visual)
/* harmony export */ });
/* harmony import */ var _panel_extension__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(931);
/* harmony import */ var _Isolator__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(438);
/* harmony import */ var _attribute_parser__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(323);
/* harmony import */ var _Selection_manager_extension__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8);

var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

//import {ExtensionGetter} from "./ExtensionGetter";




//import {visualConnectorExtension} from './VisualConnector_extension';
let htmlText = 'no rendering?';
let viewId = 'forge-viewer';
let extensionid = 'connector_extension';
//strings used to identify the columns(the user can rename them to match these)
let color_value = "value_color";
let value_ref = "value_ref";
let color_ref = "color_ref";
let R = "R";
let G = "G";
let B = "B";
let I = "I";
let value_column = "value";
class Visual {
    constructor(options) {
        //options of the selection
        this.zoom = true;
        this.color = true;
        this.isolate = true;
        this.hidden = true;
        //the column name in the table where it is selected, must match the name of the actual model property
        this.id_column = '';
        //color to RGBI representation
        this.colorDict = new Map();
        //value of the column to the name of the color
        this.value_to_color = new Map();
        //if the code was inserted into the dom
        this.pulledCode = false;
        console.log('Visual constructor', options);
        this.pbioptions = options;
        this.target = options.element;
        this.target.innerText = htmlText;
        console.log(this.target);
        this.host = options.host;
        this.onLoadSuccess = this.onLoadSuccess.bind(this);
    }
    //method used to authenticate from syncronous functions
    syncauth(succcallback) {
        return __awaiter(this, void 0, void 0, function* () {
            //fetching the access token
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
            //calls the callback given in case of success
            succcallback();
        });
    }
    //called by power BI when something is changed in the report
    update(options) {
        //where the tables given by the user are passed
        let cat = options.dataViews[0].categorical;
        console.log(cat);
        //load the extension if it was not loaded yet
        if (!this.selection_extension) {
            this.myGetExtension(cat);
        }
        //saves the credentials before they are updated
        let curcred = [this.client_id, this.client_secret, this.urn];
        //changing parameters
        this.updateParameters(cat);
        //updating selection extension parameters
        if (this.selection_extension) {
            this.selection_extension.setPropertyName(this.id_column);
            this.selection_extension.setSelectionHost(this.host);
            console.log("host: ", this.host);
            if (!this.host) {
                this.update(options);
            }
            this.selection_extension.setOnNonVoidSelectionCallback((() => { this.suppress_render_cycle = true; }).bind(this));
            this.selection_extension.setOnVoidSelectionCallback((() => { this.isolateBySelection(cat); }).bind(this));
        }
        console.log("credentials", [this.urn, this.client_id, this.client_secret]);
        //at some point the credentials where set
        if (this.client_id != undefined && this.client_secret != undefined && this.urn != undefined) {
            //the forge viewer was invalidated(wrong credentials) or it was never initialized
            if (this.forgeviewer === undefined) {
                //when the authentication is finished the viewer is initialized
                let cl = () => { this.initializeViewer(viewId, cat); };
                this.syncauth(cl);
            }
            else {
                console.info("updating");
                //coloring based on the selection
                console.log(this.suppress_render_cycle);
                //the cycle was suppressed by a selection
                if (!this.suppress_render_cycle) {
                    this.isolateBySelection(cat);
                }
                else {
                    this.suppress_render_cycle = false;
                }
                //credentials changed
                if (this.client_id != curcred[0] || this.client_secret != curcred[1]) {
                    console.info("changing account");
                    this.syncauth(() => {
                        this.forgeviewer.finish();
                        this.forgeviewer = undefined;
                        this.initializeViewer(viewId, cat);
                    });
                }
                //model changed
                else if (this.urn != curcred[2]) {
                    Autodesk.Viewing.Document.load('urn:' + this.urn, ((doc) => __awaiter(this, void 0, void 0, function* () { yield this.onLoadSuccess; this.isolateBySelection(cat); })).bind(this), this.onLoadFailure);
                }
            }
        }
    }
    initializeViewer(viewerDiv, cat) {
        return __awaiter(this, void 0, void 0, function* () {
            let aT = this.accessToken;
            //options for the viewer initialization
            let options = {
                env: 'AutodeskProduction',
                api: 'derivativeV2',
                getAccessToken: (onTokenReady) => {
                    let timeInSeconds = 3599;
                    onTokenReady(aT, timeInSeconds);
                }
            };
            //gets the needed code and the css to initialize the viewer
            if (!this.pulledCode) {
                yield this.getForgeviewerStyleAndSrc();
                this.pulledCode = true;
            }
            //function used to initialize viewer
            Autodesk.Viewing.Initializer(options, () => {
                console.log("getting started");
                //specifies extensions to load in the viewer
                let config = { extensions: [
                        'Autodesk.ViewCubeUi',
                        'panel_extension',
                        'selection_manager_extension'
                    ]
                };
                this.forgeviewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById(viewerDiv), config);
                console.log(this.forgeviewer.start());
                this.isolator = new _Isolator__WEBPACK_IMPORTED_MODULE_1__/* .Isolator */ .B(this.forgeviewer);
                //this.forgeviewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, ((e) => {this.forgeviewer.getProperties(e.dbIdArray[0], (k) => {console.log(k);})}).bind(this));
                //extension to hide viewCube
                this.myloadExtension('Autodesk.ViewCubeUi', (res) => { res.setVisible(false); });
                //after loading the elements must be isolated and the selection extension must be retrieved
                Autodesk.Viewing.Document.load('urn:' + this.urn, ((doc) => __awaiter(this, void 0, void 0, function* () {
                    yield this.onLoadSuccess(doc);
                    this.isolateBySelection(cat);
                    this.myGetExtension(cat);
                })).bind(this), this.onLoadFailure);
            });
        });
    }
    //fetched needed js and css code for the viewer to run
    getForgeviewerStyleAndSrc() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("getting style");
            return new Promise((resolve, reject) => {
                let forgeViewerStyle = "https://developer.api.autodesk.com/modelderivative/v2/viewers/style.min.css";
                let forgeViewerSrc = "https://developer.api.autodesk.com/modelderivative/v2/viewers/viewer3D.js";
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
                forgeViewerjs.onload = () => {
                    console.log("script loaded");
                    let panelext = (0,_panel_extension__WEBPACK_IMPORTED_MODULE_0__/* .PanelExtension */ .b)();
                    //registers the user defined extensions
                    Autodesk.Viewing.theExtensionManager.registerExtension("panel_extension", panelext);
                    Autodesk.Viewing.theExtensionManager.registerExtension('selection_manager_extension', (0,_Selection_manager_extension__WEBPACK_IMPORTED_MODULE_2__/* .selectionManagerExtension */ .x)());
                    //appends css and the div of the viewer to target div
                    this.target.appendChild(forgeViewercss);
                    this.target.appendChild(forgeViewerDiv);
                    resolve();
                };
                //document.head.appendChild(securityIssue);
                //appedns js to the target div
                this.target.appendChild(forgeViewerjs);
            });
        });
    }
    //function callsed when the document is loaded correctly
    onLoadSuccess(doc) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("SUCCESS");
            //loads the document on the viewer, visualising it
            yield this.forgeviewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry());
        });
    }
    //generic function used in case of error
    onLoadFailure(errorCode) {
        console.log("load error: " + errorCode);
    }
    //used in case a command must be run on an extension
    myloadExtension(name, succcallback) {
        return __awaiter(this, void 0, void 0, function* () {
            this.forgeviewer.loadExtension(name).then((res) => { succcallback(res); });
        });
    }
    /**
    * pass the options.categories used in the update function
    * the model objects will be isolated/colored accordingly (see class parameters)
    * **/
    isolateBySelection(cat) {
        return __awaiter(this, void 0, void 0, function* () {
            //colora di default, in caso aggiungeremo funzione per resettare
            console.log("PCOnsanjsbnfdsofib");
            let curModello;
            let curValues;
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
            for (let obj of cat.categories) {
                if (obj.source.displayName === this.id_column) {
                    if (this.selection_extension) {
                        this.selection_extension.setSelectables(obj);
                    }
                    curModello = obj.values.map((e) => { return e.toString(); });
                    console.log("ids found: ", curModello);
                }
                else if (obj.source.displayName === value_column) {
                    curValues = obj.values.map((e) => { return e.toString(); });
                    console.log("values found: ", curValues);
                }
            }
            //creates data structures used by isolator
            let stru = [];
            if (curValues != undefined) {
                for (let val of curValues) {
                    let curcolor = this.value_to_color.has(val) ? this.colorDict.get(this.value_to_color.get(val)) : [0, 0, 0, 0];
                    stru.push(new _attribute_parser__WEBPACK_IMPORTED_MODULE_3__/* .struct */ .n([this.id_column], curcolor));
                }
            }
            //the isolator highlights the given models (determined by the id), according to the set options
            this.isolator.searchAndIsolate(stru, curModello, this.isolate, this.zoom, this.color, this.hidden);
        });
    }
    //updates the parameters using the passed columns
    updateParameters(cat) {
        console.log("updating parameters");
        let RGBI = [[], [], [], []];
        let color_reference = [];
        let value_reference = [];
        let value_color = [];
        //updates credentials
        this.urn = cat.values[0].values[0] instanceof String || typeof cat.values[0].values[0] === 'string' ? cat.values[0].values[0] : undefined;
        this.client_id = cat.values[1].values[0] instanceof String || typeof cat.values[1].values[0] === 'string' ? cat.values[1].values[0] : undefined;
        this.client_secret = cat.values[2].values[0] instanceof String || typeof cat.values[2].values[0] === 'string' ? cat.values[2].values[0] : undefined;
        //updates the name of the column identifying the id
        this.id_column = cat.values[4].values[0] instanceof String || typeof cat.values[4].values[0] === 'string' ? cat.values[4].values[0] : undefined;
        //column determining if the highlighted elements are hidden completely or not
        this.hidden = cat.values[5].values[0] != undefined ? cat.values[5].values[0].toString() === '1' : false;
        console.log("updated credentials");
        //update actions
        let sett = Number(cat.values[3].values[0].toString());
        if (sett != -1) {
            this.zoom = sett % 2 === 1;
            this.isolate = (sett >> 1) % 2 === 1;
            this.color = (sett >> 2) % 2 === 1;
        }
        for (let val of cat.categories) {
            let displayName = val.source.displayName;
            //Red column
            if (displayName === R) {
                RGBI[0] = val.values.map((e) => { return Number(e.toString()); });
            }
            //green column
            if (displayName === G) {
                RGBI[1] = val.values.map((e) => { return Number(e.toString()); });
            }
            //blue column
            if (displayName === B) {
                RGBI[2] = val.values.map((e) => { return Number(e.toString()); });
            }
            //intensity column
            if (displayName === I) {
                RGBI[3] = val.values.map((e) => { return Number(e.toString()); });
            }
            //color column
            if (displayName === color_ref) {
                color_reference = val.values.map((e) => { return e.toString(); });
            }
            //value column associated to the color
            if (displayName === value_ref) {
                value_reference = val.values.map((e) => { return e.toString(); });
            }
            //color associated to the value
            if (displayName === color_value) {
                value_color = val.values.map((e) => { return e.toString(); });
            }
        }
        //checking if all the columns are given
        let length = color_reference.length;
        let samelength = true;
        for (let tmp of RGBI) {
            samelength = length === tmp.length;
        }
        if (samelength) {
            //inserting the colors in a map
            for (let i = 0; i < length; i++) {
                this.colorDict.set(color_reference[i], [RGBI[0][i], RGBI[1][i], RGBI[2][i], RGBI[3][i]]);
            }
            console.log(this.colorDict);
        }
        //if both the color and the value are given
        if (value_color.length === value_reference.length) {
            //inserts the associations value-color in a map
            for (let i = 0; i < value_color.length; i++) {
                this.value_to_color.set(value_reference[i], value_color[i]);
            }
            console.log(this.value_to_color);
        }
    }
    myGetExtension(cat) {
        return __awaiter(this, void 0, void 0, function* () {
            console.info("loading extension");
            if (this.forgeviewer) {
                console.info('LOADING');
                this.forgeviewer.getExtension('selection_manager_extension', ((ext) => {
                    //initialize the parameters of the extension
                    this.selection_extension = ext;
                    this.selection_extension.setPropertyName(this.id_column);
                    this.selection_extension.setSelectionHost(this.host);
                    this.selection_extension.setOnNonVoidSelectionCallback((() => { this.suppress_render_cycle = true; }).bind(this));
                    this.selection_extension.setOnVoidSelectionCallback((() => { this.isolateBySelection(cat); }).bind(this));
                    for (let obj of cat.categories) {
                        if (obj.source.displayName === this.id_column) {
                            if (this.selection_extension) {
                                this.selection_extension.setSelectables(obj);
                            }
                        }
                    }
                }));
            }
        });
    }
}


/***/ }),

/***/ 738:
/***/ ((module) => {

module.exports = Function('return this')();

/***/ }),

/***/ 643:
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "L3": () => (/* binding */ Semaphore),
/* harmony export */   "WU": () => (/* binding */ Mutex)
/* harmony export */ });
/* unused harmony exports E_ALREADY_LOCKED, E_CANCELED, E_TIMEOUT, tryAcquire, withTimeout */
const E_TIMEOUT = new Error('timeout while waiting for mutex to become available');
const E_ALREADY_LOCKED = new Error('mutex already locked');
const E_CANCELED = new Error('request for lock canceled');

var __awaiter$2 = ( false) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Semaphore {
    constructor(_value, _cancelError = E_CANCELED) {
        this._value = _value;
        this._cancelError = _cancelError;
        this._weightedQueues = [];
        this._weightedWaiters = [];
    }
    acquire(weight = 1) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        return new Promise((resolve, reject) => {
            if (!this._weightedQueues[weight - 1])
                this._weightedQueues[weight - 1] = [];
            this._weightedQueues[weight - 1].push({ resolve, reject });
            this._dispatch();
        });
    }
    runExclusive(callback, weight = 1) {
        return __awaiter$2(this, void 0, void 0, function* () {
            const [value, release] = yield this.acquire(weight);
            try {
                return yield callback(value);
            }
            finally {
                release();
            }
        });
    }
    waitForUnlock(weight = 1) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        return new Promise((resolve) => {
            if (!this._weightedWaiters[weight - 1])
                this._weightedWaiters[weight - 1] = [];
            this._weightedWaiters[weight - 1].push(resolve);
            this._dispatch();
        });
    }
    isLocked() {
        return this._value <= 0;
    }
    getValue() {
        return this._value;
    }
    setValue(value) {
        this._value = value;
        this._dispatch();
    }
    release(weight = 1) {
        if (weight <= 0)
            throw new Error(`invalid weight ${weight}: must be positive`);
        this._value += weight;
        this._dispatch();
    }
    cancel() {
        this._weightedQueues.forEach((queue) => queue.forEach((entry) => entry.reject(this._cancelError)));
        this._weightedQueues = [];
    }
    _dispatch() {
        var _a;
        for (let weight = this._value; weight > 0; weight--) {
            const queueEntry = (_a = this._weightedQueues[weight - 1]) === null || _a === void 0 ? void 0 : _a.shift();
            if (!queueEntry)
                continue;
            const previousValue = this._value;
            const previousWeight = weight;
            this._value -= weight;
            weight = this._value + 1;
            queueEntry.resolve([previousValue, this._newReleaser(previousWeight)]);
        }
        this._drainUnlockWaiters();
    }
    _newReleaser(weight) {
        let called = false;
        return () => {
            if (called)
                return;
            called = true;
            this.release(weight);
        };
    }
    _drainUnlockWaiters() {
        for (let weight = this._value; weight > 0; weight--) {
            if (!this._weightedWaiters[weight - 1])
                continue;
            this._weightedWaiters[weight - 1].forEach((waiter) => waiter());
            this._weightedWaiters[weight - 1] = [];
        }
    }
}

var __awaiter$1 = ( false) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class Mutex {
    constructor(cancelError) {
        this._semaphore = new Semaphore(1, cancelError);
    }
    acquire() {
        return __awaiter$1(this, void 0, void 0, function* () {
            const [, releaser] = yield this._semaphore.acquire();
            return releaser;
        });
    }
    runExclusive(callback) {
        return this._semaphore.runExclusive(() => callback());
    }
    isLocked() {
        return this._semaphore.isLocked();
    }
    waitForUnlock() {
        return this._semaphore.waitForUnlock();
    }
    release() {
        if (this._semaphore.isLocked())
            this._semaphore.release();
    }
    cancel() {
        return this._semaphore.cancel();
    }
}

var __awaiter = ( false) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function withTimeout(sync, timeout, timeoutError = E_TIMEOUT) {
    return {
        acquire: (weight) => {
            if (weight !== undefined && weight <= 0) {
                throw new Error(`invalid weight ${weight}: must be positive`);
            }
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                let isTimeout = false;
                const handle = setTimeout(() => {
                    isTimeout = true;
                    reject(timeoutError);
                }, timeout);
                try {
                    const ticket = yield sync.acquire(weight);
                    if (isTimeout) {
                        const release = Array.isArray(ticket) ? ticket[1] : ticket;
                        release();
                    }
                    else {
                        clearTimeout(handle);
                        resolve(ticket);
                    }
                }
                catch (e) {
                    if (!isTimeout) {
                        clearTimeout(handle);
                        reject(e);
                    }
                }
            }));
        },
        runExclusive(callback, weight) {
            return __awaiter(this, void 0, void 0, function* () {
                let release = () => undefined;
                try {
                    const ticket = yield this.acquire(weight);
                    if (Array.isArray(ticket)) {
                        release = ticket[1];
                        return yield callback(ticket[0]);
                    }
                    else {
                        release = ticket;
                        return yield callback();
                    }
                }
                finally {
                    release();
                }
            });
        },
        release(weight) {
            sync.release(weight);
        },
        cancel() {
            return sync.cancel();
        },
        waitForUnlock: (weight) => {
            if (weight !== undefined && weight <= 0) {
                throw new Error(`invalid weight ${weight}: must be positive`);
            }
            return new Promise((resolve, reject) => {
                sync.waitForUnlock(weight).then(resolve);
                setTimeout(() => reject(timeoutError), timeout);
            });
        },
        isLocked: () => sync.isLocked(),
        getValue: () => sync.getValue(),
        setValue: (value) => sync.setValue(value),
    };
}

// eslint-disable-next-lisne @typescript-eslint/explicit-module-boundary-types
function tryAcquire(sync, alreadyAcquiredError = E_ALREADY_LOCKED) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return withTimeout(sync, 0, alreadyAcquiredError);
}




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