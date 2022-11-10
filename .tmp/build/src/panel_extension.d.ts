/// <reference types="forge-viewer" />
import { struct } from './attribute_parser';
import { Isolator } from './Isolator';
declare class Panel extends Autodesk.Viewing.UI.DockingPanel {
    attrName: string;
    attrValue: string;
    attributeNameInput: HTMLInputElement;
    attributeValueInput: HTMLInputElement;
    submitButton: HTMLInputElement;
    clearButton: HTMLInputElement;
    fileInput: HTMLInputElement;
    div: HTMLDivElement;
    form: any;
    curDbids: Set<number>;
    dbidToColor: Map<number, number[][]>;
    numOfNames: number;
    curDone: number;
    searchParam: {
        names: struct[];
        vals: string[];
    };
    isol: Isolator;
    viewer: any;
    titleBar: any;
    closeButton: any;
    constructor(viewer: any, container: any, id: any, title: any, options?: {});
    initialize(): void;
    private updateAttributeName;
    private updateAttributeValue;
    private onClickSubmit;
    private clear;
}
export declare class PanelExtension extends Autodesk.Viewing.Extension {
    pn: Panel;
    constructor(viewer: any, options: any);
    load(): boolean;
    unload(): boolean;
}
export {};
