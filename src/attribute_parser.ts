/**
 * name format: [name1, name2, name3] (number, number, number, number); ... (the number must be between 0 and 256)
 * value format: val1, val2, val3 ...
 * **/
export class struct{
    public names : string[];
    public color : number[];
    constructor(str : string[], nm : number[]){
        this.names = str;
        this.color = nm;
    }
}
export function attributeParser(attributeVals : string, attributeNames : string) : {names : struct[], vals : string[]}{
    let dividedvals : string[] = parseVals(attributeVals);
    let divideNames : struct[] = parseNames(attributeNames);
    return {names : divideNames, vals : dividedvals};
}

function parseVals(values : string) : string[]{
    return values.split(',').map<string>((str) => {return str.trim()})
}

function parseNames(names : string) : struct[]{
    let curStart : number;
    let curEnd : number;
    let curNames : string[];
    let curColor : number[];
    let ret : struct[] = [];
    for(let i = 0; i < names.length; i ++){
        //list of names to search in
        if(names.charAt(i) === '['){
            curStart = i;
            while(i < names.length && names.charAt(i) != ']'){
                i++;
            }
            curNames = divideNames(names.slice(curStart + 1, i));
        }
        //color to associate
        if(names.charAt(i) === '('){
            curStart = i;
            while(i < names.length && names.charAt(i) != ')'){
                i++;
            }
            curColor = parseColor(names.slice(curStart + 1, i));
        }
        //end of couple
        if(names.charAt(i) === ';'){
            if(curNames === undefined || curColor === undefined){
                throw new Error("for every list of names there must be a color and vice versa");
            }
            ret.push(new struct(curNames, curColor));
            curNames = undefined;
            curColor = undefined;
        }
    }
    if(curNames != undefined || curColor != undefined){
        throw new Error("please end every couple name,string with a semicolon");
    }
    return ret;
}

function divideNames(str : string) : string[]{
    return str.split(',').map((st) => {return st.trim()})
}

function parseColor(str : string) : number[]{
    return str.split(',').map((st) => {
        let nm = Number(st);
        if(nm > 256 || nm < 0){
            throw new Error("RGB colors values must be in [0, 256]");
        }
        return Number(st)});
}
