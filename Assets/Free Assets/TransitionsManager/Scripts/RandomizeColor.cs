using UnityEngine;

public class RandomizeColor : MonoBehaviour
{
    private GUITexture me = null;
    private float count = 0f;
    void Start()
    {
        me = gameObject.GetComponent<GUITexture>();
    }
    void Update()
    {
        if (me != null)
        {
            count += Time.deltaTime;
            if (count > 0.1f)
            {
                count = 0f;
                me.color = new Color(Random.Range(0.1f, 0.9f), Random.Range(0.1f, 0.9f), Random.Range(0.1f, 0.9f));
            }
        }
    }
}
