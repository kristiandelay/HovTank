#pragma strict

var forwardPower:float;
var steerPower:float;
var landingPower:float;
var jumpingPower:float;
var hoverHeight:float;
var stability:float = 1;

var body:GameObject;
var barrel:GameObject;
var turret:GameObject;
var target:GameObject;
var turretMuzzlePoint:GameObject;
var turretGunProjectile:Rigidbody;

var tankHealth:float = 100;
var tankShieldTotal:float = 100;
var tankSheildFront:float = 100;
var tankShieldBack:float = 100;

public var speedUpdate:float;

private var hitNormal:Vector3[] = new Vector3[5];
private var rotation:Quaternion;
private var increment:float;
private var lastNormals:Vector3[] = new Vector3[5];
private var physicsSetup:boolean = false;
private var boxDim:Vector3;
private var cornersPoint:Vector3[] = new Vector3[5];
private var corners:Transform[] = new Transform[5];
private var boxCollider:BoxCollider;
private var yBounce:float;
private var lastPosition:Vector3;
private var distance:float;
private var average:Vector3;

private var turretRotationForce:float = 83.5; // 53.5
private var barrelRotationForce:float = 43.5; // 53.5
private var barrelMinRotation:float = 20.0;
private var barrelMaxRotation:float = 330.0;
private var maximumFireRange:float = 80.0;
private var maximumEnemyDetectionRange:float = 130.0;

function Start()
{
	
}

function Awake()
{
    InitializePhysics(); 
}

function Update()
{    
    CalculateSpeed(); 
    
       // If enemy is set, turn turret
	if (target) {

		// Rotation (Yaw) of the turret
		var targetVectorTurret : Vector3 = target.transform.position - turret.transform.position;
		var localTurretHeading : Vector3 = turret.transform.InverseTransformDirection(targetVectorTurret);
		var requiredYaw : float = Mathf.Rad2Deg * Mathf.Atan2(localTurretHeading.x, localTurretHeading.z);
		//var requiredPitch : float = Vector3.Angle(Vector3.up, localTurretHeading) - 90.0;
			//var deltaYaw = (requiredYaw / 10) * turretRotationForce * Time.deltaTime;
			//deltaYaw = Mathf.Clamp(deltaYaw, -2.0, 2.0);
		var deltaYaw = Mathf.Clamp((requiredYaw / 10) * turretRotationForce, -45.0, 45.0) * Time.deltaTime;
		turret.transform.Rotate(Vector3.up, deltaYaw, Space.Self);
		
		// Pitch of the barrel
		var targetVectorBarrel : Vector3 = target.transform.position - barrel.transform.position;
		var localBarrelHeading : Vector3 = barrel.transform.InverseTransformDirection(targetVectorBarrel);
		var requiredPitch : float = Vector3.Angle(Vector3.up, localBarrelHeading) - 90.0;
		
		var deltaPitch = Mathf.Clamp((requiredPitch / 10) * barrelRotationForce, -45.0, 45.0) * Time.deltaTime;
		//print("requiredPitch: " + requiredPitch + " barrel.x: " + barrel.transform.localEulerAngles.x + " " + deltaPitch);
		//if (barrel.transform.localEulerAngles.x > 20 && barrel.transform.localEulerAngles.x < 340) {
		//	deltaPitch = 0;
		//}
		barrel.transform.Rotate(Vector3.right, deltaPitch, Space.Self);
		
		// Check pitch bounds
		var pitchBounds : Vector3 = barrel.transform.localEulerAngles;
		//print("pitchBounds: " + pitchBounds);
		if (barrel.transform.localEulerAngles.x > barrelMinRotation && barrel.transform.localEulerAngles.x < 180) {
			pitchBounds.x = barrelMinRotation;
		} else if (barrel.transform.localEulerAngles.x < barrelMaxRotation && barrel.transform.localEulerAngles.x > 180) {
			pitchBounds.x = barrelMaxRotation;
		}		
		barrel.transform.localEulerAngles = pitchBounds;
		
		// Draw Debug Ray
		var forward = barrel.transform.TransformDirection(Vector3.forward) * 100;
		Debug.DrawRay (barrel.transform.position, Vector3.forward * 100, Color.green);
		Debug.DrawRay (barrel.transform.position, barrel.transform.eulerAngles, Color.green);
	}   
}

function FixedUpdate()
{    
    if(physicsSetup)
    {
		var hit:RaycastHit;        
        
        for(var i:int =0; i<=corners.length-1; i++)
        {
            if(Physics.Raycast(corners[i].position,-corners[i].up,hit, hoverHeight+100))
            {                
            
				//Debug.Log(String.Format("Tag Name: {0}", hit.collider.gameObject.tag));
               // if(hit.collider.gameObject.tag == "Terrain")
              //  {                   
                
                    hitNormal[i] = body.transform.InverseTransformDirection(hit.normal);                    
                    if(lastNormals[i] != hitNormal[i])
                    {                        
                        increment=0;                        
                        lastNormals[i] = hitNormal[i];                        
                    }
                    
                    distance = hit.distance;
                    
                    if(hit.distance < hoverHeight)
                    {                        
                        constantForce.relativeForce = (-average+transform.up) * rigidbody.mass * jumpingPower * rigidbody.drag * Mathf.Min(hoverHeight,hoverHeight/distance);                        
                    }
                    else 
                    {                        
                        constantForce.relativeForce = -(transform.up)* rigidbody.mass * landingPower * rigidbody.drag / Mathf.Min(hoverHeight,hoverHeight/distance);                       
                    }                    
               // }                
            }            
        }
        
        average = -(hitNormal[0] + hitNormal[1] + hitNormal[2] + hitNormal[3] + hitNormal[4])/2;        
        
        if(increment !=1)
        {
        	increment +=0.03;
        }       
        
        rotation = Quaternion.Slerp(body.transform.localRotation,Quaternion.Euler(average * Mathf.Rad2Deg),increment);      
        body.transform.localRotation = rotation;      
        body.transform.localRotation.y = transform.up.y * Mathf.Deg2Rad;      
        
        var fwdForce:float = Input.GetAxis("Vertical") * forwardPower;        
        rigidbody.AddForce(transform.forward * fwdForce);       
        
        var steerForce:float = Input.GetAxis("Horizontal") * steerPower;       
        rigidbody.AddTorque(transform.up * steerForce);   
        
        // Turret movement
        if (Input.GetKeyDown (KeyCode.Space))
        {
    	    print ("space key was pressed");
        }
        
    }
}

function CalculateSpeed()
{    
    if(lastPosition != transform.position)
    {      
        var distance:float = Vector3.Distance(transform.position, lastPosition);        
        speedUpdate = (distance/1000)/(Time.deltaTime/3600); //Km/h        
    }    
}

function InitializePhysics()
{    
    //Store the box dimenssion of the hovering object.
    
    boxCollider = body.AddComponent(BoxCollider);    
    boxDim = Vector3(boxCollider.size.x * body.transform.localScale.x, boxCollider.size.y * body.transform.localScale.y, boxCollider.size.z * body.transform.localScale.z) * stability;    
    cornersPoint[0] = Vector3(transform.position.x-boxDim.x, transform.position.y -boxDim.y/2 , transform.position.z +boxDim.z);    
    cornersPoint[1] = Vector3(boxDim.x + transform.position.x, transform.position.y -boxDim.y/2 , transform.position.z + boxDim.z);    
    cornersPoint[2] = Vector3(boxDim.x + transform.position.x, transform.position.y -boxDim.y/2 , transform.position.z - boxDim.z);    
    cornersPoint[3] = Vector3(transform.position.x-boxDim.x, transform.position.y -boxDim.y/2 , transform.position.z - boxDim.z);   
    cornersPoint[4] = transform.position;    
    
	Debug.Log(String.Format("Box size Width: {0}", boxCollider.size.x));
    Destroy(boxCollider);   
    
    for (var i:int=0; i<=cornersPoint.length-1; i++)
    {        
        var stablePlatform:GameObject = GameObject.CreatePrimitive(PrimitiveType.Sphere);
        
        stablePlatform.name = "StablePlatform" + "(" + i + ")";        
        stablePlatform.transform.parent = body.transform;        
        stablePlatform.transform.localPosition = transform.InverseTransformPoint(cornersPoint[i]);        
        corners[i] = stablePlatform.transform;        
        Destroy(stablePlatform.GetComponent(MeshRenderer));        
        Destroy(stablePlatform.GetComponent(Collider));        
    }
    
    cornersPoint = null;    
    physicsSetup = true;    
}

////////////////////////////////////////////////////////////////////////////////////
//// Game Play
////////////////////////////////////////////////////////////////////////////////////

// set target
function SetTarget(newTarget : UnityEngine.GameObject)
{	
	print("old target: " + target);
	target = newTarget;
	print("new target: " + target);
}

function isTargetInFiringArc()
{

}

////////////////////////////////////////////////////////////////////////////////////
//// Networking Code here
////////////////////////////////////////////////////////////////////////////////////

// TODO: 
@RPC
function recordDamage (myTankHealth : float, info : NetworkMessageInfo)
{
	// 
	tankHealth -= 30;
}

////////////////////////////////////////////////////////////////////////////////////
//// Debug
////////////////////////////////////////////////////////////////////////////////////

function OnCollisionStay(collision : Collision) 
{	
    // Debug-draw all contact points and normals
    for (var contact : ContactPoint in collision.contacts) {
        Debug.DrawRay(contact.point, contact.normal, Color.white);
    }
}

function OnDrawGizmos() 
{
	// debuggin hover platform positions.
	if(corners[0] != null) { Gizmos.DrawWireSphere(corners[0].position, 1); }
	if(corners[1] != null) { Gizmos.DrawWireSphere(corners[1].position, 1); }
	if(corners[2] != null) { Gizmos.DrawWireSphere(corners[2].position, 1); }
	if(corners[3] != null) { Gizmos.DrawWireSphere(corners[3].position, 1); }
	if(corners[4] != null) { Gizmos.DrawWireSphere(corners[4].position, 1); }
}