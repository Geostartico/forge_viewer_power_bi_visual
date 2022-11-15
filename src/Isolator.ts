import {struct} from './attribute_parser'
import {isolateFunction} from './isolateFunction'
//refactoring of the function to paint and 
export class Isolator{
    curDbids : Set<number>;
    dbidToColor : Map<number, number[][]>;
    numOfNames : number;
    curDone : number;
    viewer : any;//the types have the wrong number of parameters for some functions, so i have to use any
    searchParam : {names : struct[], vals : string[]};
    isolate : boolean;
    zoom : boolean;
    paint : boolean;
    
    constructor(aviewer : Autodesk.Viewing.Viewer3D){
        this.viewer = aviewer;
    }

    public clear() : void{
        this.viewer.impl.visibilityManager.setNodeOff(this.viewer.model.getRootId(), false);
        this.viewer.isolate();
        this.viewer.clearThemingColors(this.viewer.model);
        this.viewer.fitToView();
    }
    //TODO: make multithred
    public searchAndIsolate(anames : struct[], avalues : string[], isolate : boolean, zoom : boolean, paint : boolean) : void{
        if(anames.length != avalues.length){
            throw new Error('the values and structs must be the same number');
        }
        this.isolate = isolate;
        this.zoom = zoom;
        this.paint = paint;
        this.curDbids = new Set<number>();
        this.dbidToColor = new Map<number, number[][]>();
        this.numOfNames = anames.length;
        this.curDone = 0;
        this.searchParam = {names : anames, vals : avalues}
        this.clear();
        this.viewer.search('"' + this.searchParam.vals[0] + '"', this.succcallback.bind(this), this.errCallback, this.searchParam.names[0].names, {searchHidden: true, includeInherited: true});

    }
    public searchAndColorByValue(field : string, keyword: string, valueField : string, valueToColor : Map<string, number[]>, clearPrev : boolean = true){
        this.curDbids = new Set<number>();
        if(clearPrev){
            this.clear();
        }
        let succcallback2 = (dbids : number[]) => {
            for(let i of dbids){
                this.curDbids.add(i);
            }
            let valueFieldUpper = valueField.toUpperCase();
            for(let db of this.curDbids.values()){
                this.viewer.getProperties(db, (prop) => {
                    for(let erty of prop.properties){
                        if(erty.displayName.toUpperCase() == valueFieldUpper){
                            if(valueToColor.has(erty.displayValue.toString())){
                                //console.log(valueToColor.get(erty.displayValue.toString()));
                                let cl = valueToColor.get(erty.displayValue.toString()).map((e) => {return e/256});
                                this.viewer.setThemingColor(db, new THREE.Vector4(cl[0], cl[1], cl[2], cl[3]), this.viewer.model, true);
                            }
                        }
                    }
                }, 
                this.errCallback)
            }
            isolateFunction(dbids, this.viewer.model.getInstanceTree(), this.viewer)
        }
        this.viewer.search('"' + keyword + '"', succcallback2.bind(this), this.errCallback, [field], {searchHidden: true, includeInherited: true});
    } 

    private succcallback(dbids : number[]){
        //insert new dbids
        for(let i of  dbids){
            this.curDbids.add(i);
            if(!this.dbidToColor.has(i)){
                this.dbidToColor.set(i, [this.searchParam.names[this.curDone].color]);
            }
            else{
                this.dbidToColor.set(i, this.dbidToColor.get(i).concat([this.searchParam.names[this.curDone].color]));
            }
        }
        this.curDone++;
        //console.log(this.curDone);
        //it's the last iteration, isolate and paint
        if(this.curDone === this.numOfNames){
            this.clear();
            let tree = this.viewer.model.getInstanceTree();
            //isolate
            if(this.isolate){
                isolateFunction(Array.from(this.curDbids.values()), tree, this.viewer);
            }
            //paint
            if(this.paint){
                this.dbidToColor.forEach((colors : number[][], num : number) => {
                        let avgcolor : number [] = this.average(colors, 256);
                        let threeAvgColor = new THREE.Vector4(avgcolor[0], avgcolor[1], avgcolor[2], avgcolor[3]);
                        this.viewer.setThemingColor(num, threeAvgColor, this.viewer.model, true) 
                })
            }
            if(this.zoom){
                this.viewer.fitToView(Array.from(this.curDbids.values()));
            }
        }
        else{
            this.viewer.search('"' + this.searchParam.vals[this.curDone] + '"', this.succcallback.bind(this), this.errCallback, this.searchParam.names[this.curDone].names, {searchHidden: true, includeInherited: true});
        }
    }

    private errCallback(err){
        console.log('an error has occured during search', err)
    }

    //the length of every array must be the same
    private average(arrs : number[][], normalization : number = 1) : number[]{
        let ret : number[] = [];
        for(let i = 0; i < arrs[0].length; i ++){
            let sum : number = 0;
            for(let ii = 0; ii < arrs.length; ii++){
                sum += arrs[ii][i];
            }
            sum /= arrs.length;
            sum /= normalization;
            ret.push(sum);
        }
        return ret;
    }
}
