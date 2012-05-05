var IPServer = "127.0.0.1";
var  IPServ = "";
 var bullet : Rigidbody;
  var OneTime=0;
 
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

 @RPC
function Walk(playername : String){
  
 var Player = GameObject.Find(playername );
  //Player.animation["WalkForward"].layer = 20;
    //Player.animation["ShootStraight"].layer = 0;
	 // Player.animation["Idle"].layer = 0;

  Player.animation.CrossFade("WalkForward");
   Player.animation.wrapMode = WrapMode.Loop;
}
  

 @RPC
function Shoot(playername : String){
var Player = GameObject.Find(playername );
 Player.animation.CrossFade("ShootStraight");
   Player.animation.wrapMode = WrapMode.Once;
   }
   
  @RPC 
 function ShootB(ent : String, OneTime:System.Int32){
 var Player = GameObject.Find("Human(Clone)"+ent); 
 
 // Player.animation.CrossFade("ShootStraight");
  // Player.animation.wrapMode = WrapMode.Once;
  
  if(OneTime==0){ 
   
  var av = GameObject.Find("Human(Clone)" + ent );
  
 var balFiClone : Rigidbody = Instantiate(bullet,Vector3(av.transform.position.x,av.transform.position.y+1.4,av.transform.position.z ),av.transform.rotation);
  balFiClone.velocity = av.transform.forward * 7;
  balFiClone.gameObject.GetComponent(Renderer). enabled = false;
   balFiClone.detectCollisions = false;
   
   yield WaitForSeconds(0.4);
   balFiClone.gameObject.GetComponent(Renderer). enabled = true;
   balFiClone.detectCollisions = true;

    }
  
 
OneTime=1;
  
 }
   
 


   
   
   
    @RPC
function Idle(playername : String){
 
 var Player = GameObject.Find(playername );
 //Player.animation["WalkForward"].layer = 0;
    //Player.animation["ShootStraight"].layer = 0;
	// Player.animation["Idle"].layer = 20;
 
  Player.animation.CrossFade("Idle");
   Player.animation.wrapMode = WrapMode.Once;
   }




  
 


