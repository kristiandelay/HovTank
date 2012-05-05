#pragma strict

var IPServer = "127.0.0.1";
var  IPServ = "";
 
function OnGUI (){
	 
 if (Network.peerType == NetworkPeerType.Disconnected){
	IPServer = GUI.TextField(new Rect(120,10,100,20),IPServer);
	if (GUI.Button (new Rect(10,10,100,30),"Conect")){
	 Network.Connect(IPServer, 25000);
	}
	if (GUI.Button (new Rect(10,50,100,30),"Start Server")){
	  Network.InitializeServer(50, 25000,false);
	  
	 for (var go : GameObject in FindObjectsOfType(GameObject)){
	  go.SendMessage("OnLoaded", SendMessageOptions.DontRequireReceiver);	
	 }
	}
 }
 
 else{  
  if(Network.isServer){
	IPServ = Network.player.ipAddress;
	GUI.Label(new Rect(140,20,250,40),"IP to be used: "+IPServ );
  }
    
  if (GUI.Button (new Rect(10,10,100,30),"Exit")){
   if(Network.isServer){
    networkView.RPC("ExitCL", RPCMode.Others);
   }
   Network.Disconnect();
   Application.Quit();
  }
 }
 
}
 
function OnConnectedToServer() {
	 
	for (var go : GameObject in FindObjectsOfType(GameObject))
	 go.SendMessage("OnLoaded", SendMessageOptions.DontRequireReceiver);		
}
 

@RPC
function ExitCL(){
  Application.Quit();
}