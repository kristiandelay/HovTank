var entID: String;
 var OneTime = 0;
 //Janela
 var renderize : boolean  = false;  
 var windowRect : Rect = Rect (20, 20, 320, 270); // se mudar, verificar no Inspector
 var hidedWindow= true;
 var addTextureBodyI="www.dmu.com/textuDMU2.jpg";
 var addTextureHeadI="www.dmu.com/textuDMU1.jpg";
  var addTextureHairI="www.dmu.com/textuDMU0.jpg";
 var addTextureBody=" ";
  var addTextureHead =" ";
  var addTextureHair =" ";
  var titBut="Avatar-Open/Change";
  
function Start(){
  entID = gameObject.networkView.viewID.ToString().Remove(0,13);
  
}
function showWindow(){
 renderize = true;
}
function  hideWindow(){
 renderize = false;
}

function OnGUI() {
 GUI.depth = 1; //layer mais baixo que 0
  if(OneTime==0 && networkView.isMine){ 
 if (GUI.Button(new Rect(10, Screen.height-30, 135, 20), titBut)){
	
  if (hidedWindow == true){
   showWindow();
   hidedWindow = false;
  }
  else{
  hideWindow();
   hidedWindow = true;
   
     Load();
     OneTime=1;
	 
   }
  }
 }

 if (renderize) {
  windowRect = GUI.Window (1, windowRect, window1, "Redefine and close the window");
 }
}

function window1 (windowID : int) {
 GUI.DragWindow (Rect (0,0, 120, 20)); //altura da area de dragar bloqueia click
  GUI.Label(new Rect(10,40,400,20),"Body: texture address");
	 
	addTextureBodyI = GUI.TextField(new Rect(10,80,300,20),addTextureBodyI);
	 
	GUI.Label(new Rect(10,120,400,20),"Head: texture address");
	 
	addTextureHeadI = GUI.TextField(new Rect(10,160,300,20),addTextureHeadI);
	 GUI.Label(new Rect(10,190,400,20),"Hair: texture address");
	 
	addTextureHairI = GUI.TextField(new Rect(10,220,300,20),addTextureHairI );
	 
	 
	 
	 
    
}

function Load(){
 
  
 addTextureBody  =addTextureBodyI ;
  
 addTextureHead  =addTextureHeadI ;
  addTextureHair =addTextureHairI;
 
if(networkView.isMine)networkView.RPC("LoadCL", RPCMode.AllBuffered,entID,   addTextureBody,   addTextureHead  ,   addTextureHair);

 }

@RPC
function LoadCL(ent : String, tT : String, tC : String , tCl : String ){
 if(gameObject.networkView.viewID.ToString().Remove(0,13) ==ent){
 
 //textura tronco
   var GOH =GameObject.Find("Hero" +ent);
 
 var urlTT = tT; 
 var downloadTT = WWW(urlTT);
  yield downloadTT; 
  GOH.renderer.materials[2].mainTexture = downloadTT.texture;
   
   
 
  //textura cabeca
  var urlTC = tC; 
  var downloadTC = WWW(urlTC);
   yield downloadTC; 
   GOH.renderer.materials[1].mainTexture = downloadTC.texture;
     
   
    //textura cabelo
  var urlTCl = tCl; 
  var downloadTCl = WWW(urlTCl);
   yield downloadTCl; 
   GOH.renderer.materials[0].mainTexture = downloadTCl.texture;
    
  
  
  
   
   }
}
