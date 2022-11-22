export function isolateFunction(dbIds : number[], tree : any/*instance tree*/, viewer, hide : boolean){
    console.log("dbIds: ", dbIds);
    let leafIDs = getLeaves(dbIds, tree); 
    let allIds = getLeaves([tree.getRootId()], tree)
    let unwanted = allIds.filter((id) => {return leafIDs.indexOf(id) < 0});
    console.log("unwanted: ", unwanted);
    console.log('leaves', leafIDs);
    viewer.isolate(leafIDs);
    if(hide){
        for(let i of unwanted){
            viewer.impl.visibilityManager.setNodeOff(i, true);
        }
    }
}
function getLeaves(dbIds : number[], tree){
    let leaves : number[] = [];
    for(let i = 0; i < dbIds.length; i++){
        let subchildren = (id) =>{
            if(tree.getChildCount(id) === 0){
                leaves.push(id)
            }
            tree.enumNodeChildren(id, (child) => {subchildren(child)});
        }
        subchildren(dbIds[i]);
    }
    return leaves;
}
