/**
 * extension to allow the user to enter the values
 * to select objects according to the selections on other visuals
 **/
export function visualConnectorExtension(){
    class Panel extends Autodesk.Viewing.UI.DockingPanel{
        attrName: string;
        attrValue: string;
        id_column : HTMLInputElement;
        id_property : HTMLInputElement;
        value_column : HTMLInputElement;
        value_colors : HTMLInputElement;
        div : HTMLDivElement;
        form : any;
        submitButton : HTMLInputElement;
        viewer : any;//can't type it, issues with some methods signatures which miss parameters in the typescript version
        titleBar : any;
        closeButton : any;
        temp : string[] = ['', '', '', ''];
        id_column_string : string;
        id_property_string : string;
        value_column_string : string;
        value_colors_string : string;


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
            this.container.appendChild(this.createScrollContainer({}));

            // footer
            this.container.appendChild(this.createFooter());
            //create div to contain the menu, containing a form with two fields: attributename and attributevalue and a button to commit
            this.div = document.createElement('div');
            this.form = document.createElement('form');

            let txt = document.createElement("span");
            txt.innerText = "column containing the id";

            //text input for attributeName
            this.id_column = document.createElement('input');
            this.id_column.type = 'text';
            this.id_column.id = 'id_column_input';
            this.id_column.name = 'id column';
            this.id_column.addEventListener('input', this.updateId_column.bind(this))

            let txt2 = document.createElement('span');
            txt2.innerText = 'id of the property in the model';

            //text input for id_property
            this.id_property = document.createElement('input');
            this.id_property.type = 'text';
            this.id_property.id = 'attributeValueInput';
            this.id_property.name = 'attribute value';
            this.id_property.addEventListener('input', this.updateId_property.bind(this)) 

            let txt3 = document.createElement('span');
            txt2.innerText = 'value-color associations';
            
            //text input for id_property
            this.value_colors = document.createElement('input');
            this.value_colors.type = 'text';
            this.value_colors.id = 'value_to_colors_input';
            this.value_colors.name = 'value to colors';
            this.value_colors.addEventListener('input', this.updateValueToColor.bind(this)) 

            let txt4 = document.createElement('span');
            txt2.innerText = 'column to read for value';
            
            //text input for id_property
            this.value_column = document.createElement('input');
            this.value_column.type = 'text';
            this.value_column.id = 'value_column_input';
            this.value_column.name = 'column value';
            this.value_column.addEventListener('input', this.updateValue_column.bind(this)) 


            //submit Button
            this.submitButton = document.createElement('input');
            this.submitButton.type = 'submit';
            this.submitButton.value = 'chainge config';
            this.submitButton.addEventListener('click', this.onClickSubmit.bind(this))
            //attach elements to form
            this.form.appendChild(txt);
            this.form.appendChild(this.id_column);
            this.form.appendChild(document.createElement('br'));
            this.form.appendChild(txt2);
            this.form.appendChild(this.id_property);
            this.form.appendChild(document.createElement('br'));
            this.form.appendChild(txt3)
            this.form.appendChild(this.value_colors)
            this.form.appendChild(txt4);
            this.form.appendChild(this.value_column);
            this.form.appendChild(this.submitButton);
            this.form.appendChild(document.createElement('br'));

            this.div.appendChild(this.form);
            this.scrollContainer.appendChild(this.div);
        }

        private onClickSubmit(event : Event){
            this.id_column_string = this.temp[0];
            this.id_property_string = this.temp[1];
            this.value_column_string = this.temp[2];
            this.value_colors_string = this.temp[3];
        }

        private updateId_column(event : Event){
            this.temp[0] = (<HTMLInputElement>event.target).value;
        }

         private updateId_property(event : Event){
            this.temp[1] = (<HTMLInputElement>event.target).value;
        }
         private updateValue_column(event : Event){
            this.temp[2] = (<HTMLInputElement>event.target).value;
        }
         private updateValueToColor(event : Event){
            this.temp[3] = (<HTMLInputElement>event.target).value;
        }

        public getInput() : string[]{
            return [this.id_column_string, this.id_property_string, this.value_column_string, this.value_colors_string]
        } 
    }

    class PanelExt extends Autodesk.Viewing.Extension{

        pn : Panel;
        btn : Autodesk.Viewing.UI.Button;
        subToolbar : Autodesk.Viewing.UI.ToolBar;

        constructor(viewer, options){
            super(viewer, options);
        }

        public load() : boolean{
            console.log("loading select config extension");
            //this.pn = new Panel(this.viewer, this.viewer.container, 'panelID', 'panelTitle') 
            ////console.log(this.pn);
            //this.pn.setVisible(true);
            return true;
        } 

        public unload() : boolean{
            console.log("unload DockingPanel")
            return true;
        }

        public onToolbarCreated(toolbar : Autodesk.Viewing.UI.ToolBar){
            var viewer = this.viewer;


            // Button 1
            this.btn = new Autodesk.Viewing.UI.Button('configButton');
            this.btn.onClick = ((e) => {
                this.pn = new Panel(this.viewer, this.viewer.container, 'configPanel', 'config');
                this.pn.setVisible(true);
            }).bind(this);
            this.btn.addClass('open-config-panel-button');
            this.btn.setToolTip('open config panel');

            
            // SubToolbar
            this.subToolbar = new Autodesk.Viewing.UI.ControlGroup('configToolbar');
            this.subToolbar.addControl(this.btn);

            toolbar.addControl(this.subToolbar);
            };
    } 
    return PanelExt
}
