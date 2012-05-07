/*
Master Camera addon script to control camera zoom / scrolling.
All code (c) Jesse Falleur unless otherwise noted.
www.ThoughtVandal.com 
*/

#pragma strict

class ToggleDistance extends System.Object {
	var enableToggleDistance : boolean = true;
	var lockDistanceWhenToggled : boolean = false;
	var FPSKeyInput : String = "g";
	var FPSDistance : float = 0;
	
}

var enableWheelScrolling : boolean = true;
var Speed : float = .5;
var LimitInner : float = 0;
var LimitOuter: float = 15;
var MeshHideDistance: float = 0.5;
var meshObject : GameObject;
var hideAllChildMesh : boolean = true;
var toggleDistance = ToggleDistance();


private var activateFPS : boolean = false;
private var setDistance : float;
private var mc : MasterCamera;
private var rends : Component[];
function Awake(){
	mc = GetComponent("MasterCamera") as MasterCamera;
}
	
	
function Update () {

		if(toggleDistance.enableToggleDistance){			
		 	if(Input.GetKeyDown(toggleDistance.FPSKeyInput)){	
				activateFPS= !activateFPS ;	
			}	
		}
		if(enableWheelScrolling){
			// Scroll in
			if (Input.GetAxis("Mouse ScrollWheel") > 0 &&  mc.preferredDistance >= LimitInner ){	
				mc.preferredDistance -=  Speed;		
			// Scroll out
			} else if (Input.GetAxis("Mouse ScrollWheel") < 0 &&  mc.preferredDistance < LimitOuter){	
				mc.preferredDistance += Speed;	
			}
			// Don't scroll too far in.
			if(mc.preferredDistance < LimitInner){		
				mc.preferredDistance = LimitInner;	
			}
		}		
		
		var scrollingCollisionCheck = false;
		var camDistance : float ;
		var castDirection : Vector3;
		var playerToCameraHit : RaycastHit; 
		var bufferDistance : float = LimitOuter;
		
	// The message variable is to help determine what the raycasts are hitting.  Helpful when setting up Layer Masks
		var message : String = "none";

			for(var i: int=0; i < (mc.cameraColliders.length) ; i++){				
				camDistance = Vector3.Distance(mc.rotationObject.transform.position, mc.cameraColliders[i].transform.position);			
				castDirection = mc.cameraColliders[i].transform.position - mc.rotationObject.transform.position ;
				Debug.DrawRay(mc.rotationObject.transform.position, castDirection, Color.red);
				if (Physics.Raycast (mc.rotationObject.transform.position, castDirection, playerToCameraHit, LimitOuter , mc.collisionLayerMask)){		
					//message = playerToCameraHit.collider.name;
					if (bufferDistance > playerToCameraHit.distance ){
						bufferDistance = playerToCameraHit.distance ;					
					}			
					scrollingCollisionCheck = true;
				}
			//	Debug.Log("Scroll Collision Check : " + scrollingCollisionCheck + "  :: BufferDistance : " + bufferDistance + " :: i : " + i + " :: Hit collider name : " + message);
			}
		if(scrollingCollisionCheck && bufferDistance < mc.preferredDistance){
			setDistance = bufferDistance;		
		} else {
			setDistance = mc.preferredDistance;		
		}

		if(setDistance < LimitInner){
			setDistance = LimitInner;
		}
		
		if(activateFPS){
			setDistance = toggleDistance.FPSDistance;
		}
		mc.scroller.transform.localPosition.z = Mathf.Lerp(Mathf.Abs(mc.scroller.transform.localPosition.z), setDistance, 0.5) * -1;
		
		//If Camera is too close, hide player mesh.
		if ( mc.scroller.transform.localPosition.z > (MeshHideDistance*-1)){	
			if(hideAllChildMesh){
				rends = meshObject.GetComponentsInChildren(Renderer);
				for(var ir = 0 ; ir < rends.Length ; ir ++){
					rends[ir].renderer.enabled = false;
				}
			} else {
				meshObject.GetComponent(Renderer).renderer.enabled = false;
			}
		} else {
			
			if(hideAllChildMesh){
				rends = meshObject.GetComponentsInChildren(Renderer);
				for(var irx = 0 ; irx < rends.Length ; irx ++){
					rends[irx].renderer.enabled = true;
				}
			} else {
				meshObject.GetComponent(Renderer).renderer.enabled = true;
			}
			
		}
	 // End Scrolling

}