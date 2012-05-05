  
function OnTriggerEnter(other : Collider)
{
  if(other.gameObject.name=="bullet(Clone)"){
   
  gameObject.transform.position = GameObject.Find("Administration").transform.position;
  gameObject.transform.rotation = GameObject.Find("Administration").transform.rotation;
 Destroy(other.gameObject);
} 
 }