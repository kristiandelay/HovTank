var entID: String;
 
 
function Start(){

 
 

  entID = gameObject.networkView.viewID.ToString().Remove(0,13);
   if(networkView.isMine) networkView.RPC("Change",RPCMode.AllBuffered,  entID);
   
}
 

@RPC
function Change(ent:String){ 
if(gameObject.networkView.viewID.ToString().Remove(0,13) ==ent){
 
var gos= GetComponentsInChildren(Transform);
for (go in gos) {
 
 
if(go.tag=="toChange" )
go.name = go.name+ent ;
}
var renderers = GetComponentsInChildren(Renderer);
for (r in renderers) {
 
  
 for(i=0;i<r.materials.length;i++){
 r.materials[i].name = r.materials[i].name+ent ;
 }
 
 }

}

}

