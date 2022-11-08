/**
 * name format: [name1, name2, name3] (number, number, number, number); ... (the number must be between 0 and 256)
 * value format: val1, val2, val3 ...
 * **/
export declare class struct {
    names: string[];
    color: number[];
    constructor(str: string[], nm: number[]);
}
export declare function attributeParser(attributeVals: string, attributeNames: string): {
    names: struct[];
    vals: string[];
};
