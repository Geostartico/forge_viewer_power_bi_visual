export class PanelExtension{
    public static SELECT_DESK(desk){
        class panel extends desk.Viewing.UI.DockingPanel{
            constructor(viewer, container, id, title, options = {}) {
                super(container, id, title, options);
                this.viewer = viewer;
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
                this.container.appendChild(this.createScrollContainer());

                // footer
                this.container.appendChild(this.createFooter());
                this.div = document.createElement('div');
                this.form = document.createElement('form');
                let txt = document.createElement("span");
                txt.innerText = "Attribute Name to search";
                this.attributeNameInput = document.createElement('input');
                this.attributeNameInput.type = 'text';
                this.attributeNameInput.id = 'attributeNameInput';
                this.attributeNameInput.name = 'attribute Name';
                let txt2 = document.createElement('span');
                txt2.innerText = 'Attribute value to search';
                this.attributeValueInput = document.createElement('input');
                this.attributeValueInput.type = 'text';
                this.attributeValueInput.id = 'attributeValueInput';
                this.attributeValueInput.name = 'attribute value';
                this.form.appendChild(txt);
                this.form.appendChild(this.attributeNameInput);
                this.form.appendChild(document.createElement('br'));
                this.form.appendChild(txt2);
                this.form.appendChild(this.attributeValueInput);
                this.div.appendChild(this.form);
                this.scrollContainer.appendChild(this.div);
            }
        }
        class ext extends desk.Viewing.Extension{
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
        return ext;
    } 
}
