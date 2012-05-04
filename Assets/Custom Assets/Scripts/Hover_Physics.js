#pragma strict

var forwardPower:float;
var steerPower:float;
var landingPower:float;
var jumpingPower:float;
var hoverHeight:float;
var stability:float = 1;
var body:GameObject;

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

function Awake()
{
    InitializePhysics(); 
}

function Update()
{    
    CalculateSpeed();    
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
            
				Debug.Log(String.Format("Tag Name: {0}", hit.collider.gameObject.tag));
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
    }
}

function OnDrawGizmos() 
{
	// debuggin corners positions.
	if(corners[0] != null) { Gizmos.DrawWireSphere(corners[0].position, 1); }
	if(corners[1] != null) { Gizmos.DrawWireSphere(corners[1].position, 1); }
	if(corners[2] != null) { Gizmos.DrawWireSphere(corners[2].position, 1); }
	if(corners[3] != null) { Gizmos.DrawWireSphere(corners[3].position, 1); }
	if(corners[4] != null) { Gizmos.DrawWireSphere(corners[4].position, 1); }
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
    cornersPoint[0] = Vector3(transform.position.x-boxDim.x/2, transform.position.y -boxDim.y/2 , transform.position.z +boxDim.z/2);    
    cornersPoint[1] = Vector3(boxDim.x/2 + transform.position.x, transform.position.y -boxDim.y/2 , transform.position.z + boxDim.z/2);    
    cornersPoint[2] = Vector3(boxDim.x/2 + transform.position.x, transform.position.y -boxDim.y/2 , transform.position.z - boxDim.z/2);    
    cornersPoint[3] = Vector3(transform.position.x-boxDim.x/2, transform.position.y -boxDim.y/2 , transform.position.z - boxDim.z/2);   
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