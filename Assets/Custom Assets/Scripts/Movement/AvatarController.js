#pragma strict

var speed : float = 6.0;
var jumpSpeed : float = 8.0;
var turnSpeed : float = 60;
var gravity : float = 20.0;
var target : Transform; 
public var distance = 2.8; 
public var targetHeight = 2.0;
private var x = 0.0; 
private var y = 0.0;  

private var moveDirection : Vector3 = Vector3.zero;
var hit : RaycastHit;


function Update()
 {
    var controller : CharacterController = GetComponent(CharacterController);
    transform.Rotate(0, turnSpeed * Input.GetAxis("Horizontal") * Time.deltaTime, 0);
   // if (controller.isGrounded)
   //  {
        moveDirection = transform.forward * Input.GetAxis("Vertical") * speed;
        if (Input.GetButton ("Jump"))
         {
            moveDirection.y = jumpSpeed;
        }
   // }
    // Apply gravity
    moveDirection.y -= gravity * Time.deltaTime;
    // Move the controller
    controller.Move(moveDirection * Time.deltaTime);
    
    
    if(!target) 
      return;
      
   y = target.eulerAngles.y; 
 
 var dwn = transform.TransformDirection (Vector3.down);

   if (Physics.Raycast (transform.position, dwn, hit))
   {
   Debug.Log(hit);
   }


//  // ROTATE CAMERA:
//   var rotation:Quaternion = Quaternion.Euler(x, y, 0); 
//   transform.rotation = rotation; 
//   
//   // POSITION CAMERA:
//   var position = target.position - (rotation * Vector3.forward * distance + Vector3(0,-targetHeight,0)); 
//   transform.position = position; 
}

function Start()
{ 
    var angles = transform.eulerAngles; 
    x = angles.x; 
    y = angles.y;
}  

function LateUpdate()
{ 
   
}
