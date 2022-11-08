import {attributeParser, struct} from './attribute_parser';
import {isolateFunction} from './isolateFunction';
export class PanelExtension{
    public static SELECT_DESK(desk){
        class panel extends desk.Viewing.UI.DockingPanel{
            attrName: string;
            attrValue: string;
            attributeNameInput : HTMLInputElement;
            attributeValueInput : HTMLInputElement;
            submitButton : HTMLInputElement;
            clearButton : HTMLInputElement;

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

            private updateAttributeName(event : Event){
                this.attrName = (event.target as HTMLInputElement).value;
                console.log("attribute name: ", this.attrName);
            }

            private updateAttributeValue(event : Event){
                this.attrValue = (event.target as HTMLInputElement).value;
                console.log("attribute value: ", this.attrValue);

            }

            private onClickSubmit(event : Event){
                this.clear();
                this.viewer.search('"' + this.attrValue + '"', this.succcallback.bind(this), this.errCallback, [this.attrName], {searchHidden: true, includeInherited: true})
            }
            //restores model visibility to default
            private clear(event : Event = null){
                console.log("clearing");
                this.viewer.impl.visibilityManager.setNodeOff(this.viewer.model.getRootId(), false);
                this.viewer.isolate();
            }

            private succcallback(dbIds: Array<number>){
                if(dbIds.length === 0){
                    return;
                }
                let tree = this.viewer.model.getInstanceTree();
                isolateFunction(dbIds, tree, this.viewer);
                for(let dbid of dbIds){
                    //!!!!AYO!!!!!
                    this.viewer.setThemingColor(dbid, new THREE.Vector4(1, 0, 0, 1), this.viewer.model, true);
                }
                this.viewer.fitToView(dbIds[0]);
            }

            private errCallback(err){
                console.log("an error occured during the search: ", err);
            }
        }
        class exte extends desk.Viewing.Extension{
            pn : panel;
            constructor(viewer, options){
                super(viewer, options);
            }
            public load() : boolean{
                console.log("loading DockingPanel");
                this.pn = new panel(this.viewer, this.viewer.container, 'panelID', 'panelTitle') 
                console.log(this.pn);
                this.pn.setVisible(true);
                return true;
            } 
            public unload() : boolean{
                console.log("unload DockingPanel")
                return true;
            }
        } 
        return exte;
    } 
}
