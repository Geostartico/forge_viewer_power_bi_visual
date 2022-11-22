import {attributeParser, struct} from './attribute_parser';
import {isolateFunction} from './isolateFunction';
import {Isolator} from './Isolator';
/**
 * the class extends Autodesk.Viewing.UI.DockingPanel, if it is imported in another file the class is evaluated, unfortunately
 * the code for autodesk is imported in runtime, therefore before the import Autodesk is undefined, making the code stop when
 * Autodesk.Viewing is evaluated. the smarter solution would be to dynamically import the class, but it returns a syntax error
 * in the code for which i don't have an exact explanation
 * **/
export function PanelExtension(){
    //actual panel to insert the query
    class Panel extends Autodesk.Viewing.UI.DockingPanel{
        attrName: string;
        attrValue: string;
        attributeNameInput : HTMLInputElement;
        attributeValueInput : HTMLInputElement;
        submitButton : HTMLInputElement;
        clearButton : HTMLInputElement;
        fileInput : HTMLInputElement;
        div : HTMLDivElement;
        form;
        curDbids : Set<number>;
        dbidToColor : Map<number, number[][]>;
        numOfNames : number;
        curDone : number;
        searchParam : {names : struct[], vals: string[]};
        isol : Isolator;
        viewer : any;//can't type it, issues with some methods signatures which miss parameters in the typescript version
        titleBar : any;
        closeButton : any;

        constructor(viewer, container, id, title, options = {}) {
            super(container, id, title, options);
            this.viewer = viewer;
            this.isol = new Isolator(this.viewer);
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
            this.attributeNameInput.addEventListener('input', this.updateAttributeName.bind(this))

            let txt2 = document.createElement('span');
            txt2.innerText = 'Attribute value to search';

            //text input for attributeValue
            this.attributeValueInput = document.createElement('input');
            this.attributeValueInput.type = 'text';
            this.attributeValueInput.id = 'attributeValueInput';
            this.attributeValueInput.name = 'attribute value';
            this.attributeValueInput.addEventListener('input', this.updateAttributeValue.bind(this)) 
            
            //submit Button
            this.submitButton = document.createElement('input');
            this.submitButton.type = 'submit';
            this.submitButton.value = 'start query';
            this.submitButton.addEventListener('click', this.onClickSubmit.bind(this))

            //clear button
            this.clearButton = document.createElement('input');
            this.clearButton.type = 'submit';
            this.clearButton.value = 'clear selections';
            this.clearButton.addEventListener('click', this.clear.bind(this))

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

        private updateAttributeName(event : Event){
            this.attrName = (event.target as HTMLInputElement).value;
            console.log("attribute name: ", this.attrName);
        }

        private updateAttributeValue(event : Event){
            this.attrValue = (event.target as HTMLInputElement).value;
            console.log("attribute value: ", this.attrValue);
        }

        //performs query when the form is submitted
        private onClickSubmit(event : Event){
            this.clear();
            this.searchParam = attributeParser(this.attrValue,this.attrName);

            if(this.searchParam.names.length != this.searchParam.vals.length){
                console.log(this.searchParam);
                throw new Error("You must have the same number of name lists and keywords");
            }
            
            this.curDone = 0;
            this.numOfNames = this.searchParam.vals.length;
            this.dbidToColor = new Map<number, number[][]>();
            this.curDbids = new Set<number>();
            this.isol.searchAndIsolate(this.searchParam.names, this.searchParam.vals, true, true, true, true);
        }
        //restores model visibility to default
        private clear(event : Event = null){
            console.log("clearing");
            this.isol.clear();
        }
        
    }

    //extension of the viewer to implement the panel
    class PanelExt extends Autodesk.Viewing.Extension{

        pn : Panel;
        btn : Autodesk.Viewing.UI.Button;
        subToolbar : Autodesk.Viewing.UI.ToolBar;

        constructor(viewer, options){
            super(viewer, options);
        }


        public load() : boolean{
            console.log("loading DockingPanel");
            return true;
        } 

        public unload() : boolean{
            console.log("unload DockingPanel")
            return true;
        }

        //initializes ui elements 
        public onToolbarCreated(toolbar : Autodesk.Viewing.UI.ToolBar){
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
            };
    } 
    return PanelExt
}
