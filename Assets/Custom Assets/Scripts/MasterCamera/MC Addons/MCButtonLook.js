/*
Master Camera addon script to allow for button looking.
All code (c) Jesse Falleur unless otherwise noted.
www.ThoughtVandal.com 
*/

#pragma strict

class ButtonHorizontal extends System.Object {
	var mouseSensitivity : float = 15;
	var minimumAngle : float = -360;
	var maximumAngle : float = 360;
}

class ButtonVertical extends System.Object {
	var mouseSensitivity : float = 15;
	var minimumAngle : float = -60;
	var maximumAngle : float = 60;
}

var inputButton : String = "Fire1";
var returnToOnClick : boolean = true;
var buttonHorizontal = ButtonHorizontal();
var buttonVertical = ButtonVertical();



private var vRotation : float;
private var hRotation : float;
private var vReturn : float;
private var hReturn : float;

private var mc : MasterCamera;

function Awake(){
	mc = GetComponent("MasterCamera") as MasterCamera;
}

function Update () {
	if(Input.GetButtonDown(inputButton)){
	
		if(returnToOnClick){
			hRotation = mc.rotationObject.transform.localEulerAngles.y;
			vRotation = mc.rotationObject.transform.localEulerAngles.x;
			hReturn = mc.rotationObject.transform.localEulerAngles.y;
			vReturn = mc.rotationObject.transform.localEulerAngles.x;
		}

	}

	if(Input.GetButton(inputButton)){
		hRotation += Input.GetAxisRaw("Mouse X") * buttonHorizontal.mouseSensitivity;			
		hRotation = mc.AngleClamp( hRotation, buttonHorizontal.minimumAngle, buttonHorizontal.maximumAngle);			
		mc.rotationObject.transform.localEulerAngles.y =  hRotation;
				
		vRotation = vRotation - Input.GetAxisRaw("Mouse Y") * buttonVertical.mouseSensitivity;			
		vRotation = mc.AngleClamp( vRotation, buttonVertical.minimumAngle, buttonVertical.maximumAngle);		
		mc.rotationObject.transform.localEulerAngles.x = vRotation;
	}
	
	
	if(returnToOnClick){
		
		if(Input.GetButtonUp(inputButton)){		
			mc.rotationObject.transform.localEulerAngles.y = hReturn;
			mc.rotationObject.transform.localEulerAngles.x = vReturn;
		}
	}
	
	
}