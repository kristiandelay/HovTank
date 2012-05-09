#pragma strict

/* 
* Controls the Laser Sight for the player's aim
*/
// Reference to the LineRenderer we will use to display the simulated path
var sightLine : LineRenderer;

// Reference to a Component that holds information about fire strength, location of cannon, etc.
var playerFire : PlayerFire;

// Number of vertices to calculate - more gives a smoother line
var numVertices : int = 20;

// Length scale for each segment
var segmentScale : float = 1.0;

// Local cache of the line's positions
private var positions : Vector3[];

// The following may be useful for highlighting a target, etc.

// gameobject we're actually pointing at
var hitObject:GameObject;

function Start()
{
    positions = new Vector3[numVertices];
}

function FixedUpdate()
{
    simulatePath();
}

/**
* simulate the path of a launched ball. 
* Slight errors are inherent in the numerical method used
*/
function simulatePath()
{
    // The first line point is wherever the player's cannon, etc is
    positions[0] = playerFire.transform.position;
    
    // Time it takes to traverse one segment of length segScale
    var segTime : float;
    
    // The velocity of the current segment
    var segVelocity : Vector3 = playerFire.transform.up * playerFire.fireStrength * Time.fixedDeltaTime;
    
    var hit : RaycastHit;
    
    // reset our hit object
    //hitObject = null;
    
    for (var i=1; i<numVertices; i++)
    {
        // worry about if velocity has zero magnitude
        if(segVelocity.sqrMagnitude != 0)
            segTime = segmentScale/segVelocity.magnitude;
        else
            segTime = 0;
        // Add velocity from gravity for this segment's timestep
        segVelocity = segVelocity + Physics.gravity*segTime;
        
        // Check to see if we're going to hit a physics object
        if(Physics.Raycast(positions[i-1], segVelocity, hit, segmentScale))
        {
            // set next position to the position where we hit the physics object
            positions[i] = positions[i-1] + segVelocity.normalized*hit.distance;
            // correct ending velocity, since we didn't actually travel an entire segment
            segVelocity = segVelocity - Physics.gravity*(segmentScale - hit.distance)/segVelocity.magnitude;
            // flip the velocity to simulate a bounce
            segVelocity = Vector3.Reflect(segVelocity, hit.normal);
            
            /*
             * Here you could check if the object hit by the Raycast had some property - was 
             * sticky, would cause the ball to explode, or was another ball in the air for 
             * instance. You could then end the simulation by setting all further points to 
             * this last point and then breaking this for loop, and setting 
             * hitObject = hit.collider.gameObject.
             */
        }
        // If our raycast hit no objects, then set the next position to the last one plus v*t
        else
        {
            positions[i] = positions[i-1] + segVelocity*segTime;
        }
    }
    
    // At the end, apply our simulations to the LineRenderer
    
    // Set the colour of our path to the colour of the next ball
    var startColor : Color = playerFire.nextColor;
    var endColor : Color = startColor;
    startColor.a = 1;
    endColor.a = 0;
    sightLine.SetColors(startColor, endColor);
    
    sightLine.SetVertexCount(numVertices);
    
    for(i=0; i<numVertices; i++)
    {
        sightLine.SetPosition(i, positions[i]);
    }
}

function getHitObject()
{
    return hitObject;
}