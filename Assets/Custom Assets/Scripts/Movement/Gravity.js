#pragma strict

// simulation of body-to-body gravity

var range : float = 30.0;

function FixedUpdate () 
{
    var cols : Collider[] = Physics.OverlapSphere(transform.position, range);
    var rbs : Array = new Array();
    for (var c = 0; c < cols.length; c++)
     {
        if (cols[c].attachedRigidbody && cols[c].attachedRigidbody != rigidbody) 
        {
            var breaking :boolean = false;
            for (var r = 0; r < rbs.length; r++) 
            {
                if (cols[c].attachedRigidbody == rbs[r]) 
                {
                    breaking=true;
                    break;
                }
            }
            
            if (breaking) continue;
            rbs.Add(cols[c].attachedRigidbody);
            var offset : Vector3 = (transform.position - cols[c].transform.position);
            var mag: float = offset.magnitude;
            cols[c].attachedRigidbody.AddForce(offset/mag/mag * rigidbody.mass);
        }
    }
}