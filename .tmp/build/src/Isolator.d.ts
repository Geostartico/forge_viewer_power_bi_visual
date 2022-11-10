/// <reference types="forge-viewer" />
import { struct } from './attribute_parser';
export declare class Isolator {
    curDbids: Set<number>;
    dbidToColor: Map<number, number[][]>;
    numOfNames: number;
    curDone: number;
    viewer: any;
    searchParam: {
        names: struct[];
        vals: string[];
    };
    isolate: boolean;
    zoom: boolean;
    paint: boolean;
    constructor(aviewer: Autodesk.Viewing.Viewer3D);
    clear(): void;
    searchAndIsolate(anames: struct[], avalues: string[], isolate: boolean, zoom: boolean, paint: boolean): void;
    searchAndColorByValue(field: string, keyword: string, valueField: string, valueToColor: Map<string, number[]>, clearPrev?: boolean): void;
    private succcallback;
    private errCallback;
    private average;
}
