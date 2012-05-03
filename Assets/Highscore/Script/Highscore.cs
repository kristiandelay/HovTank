using UnityEngine;
using System.Collections;
using System.Text;
using System.Security;

public class Highscore : MonoBehaviour 
{
	public string secretKey = "12345";
	public string PostScoreUrl = "http://YouWebsite.com/.../postScore.php?";
	public string GetHighscoreUrl = "http://YouWebsite.com/.../getHighscore.php";

	private string name = "Name";
	private string score = "Score";
	private string WindowTitel = "";
	private string Score = "";

	public GUISkin Skin;
	public float windowWidth = 380;
	private float windowHeight = 300;
	public Rect windowRect;

	public int maxNameLength = 10;
	public int getLimitScore = 15;
	
	
	void Start () 
	{
		windowRect = new Rect (120, 40, 300, 300);
		StartCoroutine("GetScore");		
	}

	void Update () 
	{
		windowRect = new Rect (Screen.width / 2 -(windowWidth / 2), 40, windowWidth, Screen.height - 50);
		windowHeight = Screen.height - 50;
	}
	
	IEnumerator GetScore()
	{
		Score = "";
			
    	WindowTitel = "Loading";
		
		WWWForm form = new WWWForm();
		form.AddField("limit",getLimitScore);
		
    	WWW www = new WWW(GetHighscoreUrl,form);
    	yield return www;
		
		if(www.text == "") 
    	{
			print("There was an error getting the high score: " + www.error);
			WindowTitel = "There was an error getting the high score";
    	}
		else 
		{
			WindowTitel = "Done";
       		Score = www.text;
		}
	}
	
	IEnumerator PostScore(string name, int score)
	{
		string _name = name;
		int _score = score;
		
		string hash = Md5Sum(_name + _score + secretKey).ToLower();
		
		WWWForm form = new WWWForm();
		form.AddField("name",_name);
		form.AddField("score",_score);
		form.AddField("hash",hash);
		
		WWW www = new WWW(PostScoreUrl,form);
		WindowTitel = "Wait";
		yield return www;
		
    	if(www.text == "done") 
    	{
       		StartCoroutine("GetScore");
    	}
		else 
		{
			print("There was an error posting the high score: " + www.error);
			WindowTitel = "There was an error posting the high score";
		}
	}
	
	void OnGUI()
	{
	GUI.skin = Skin;
		
		windowRect = GUI.Window(0, windowRect, DoMyWindow, WindowTitel);
	
		name = GUI.TextField (new Rect (Screen.width / 2 - 160, 10, 100, 20), name, maxNameLength);
    	score = GUI.TextField (new Rect (Screen.width / 2 - 50, 10, 100, 20), score, 25);
		
    	if (GUI.Button(new Rect(Screen.width / 2 + 60, 10, 90, 20),"Post Score"))
    	{
			StartCoroutine(PostScore(name, int.Parse(score)));
       		name = "";
       		score = "";
    	}    
	}
	
	void DoMyWindow(int windowID) 
	{
      GUI.skin = Skin;
		
    	GUI.Label (new Rect (windowWidth / 2 - windowWidth / 2, 30, windowWidth, windowHeight), Score);
    	
    	if (GUI.Button(new Rect(15,Screen.height - 90,70,30),"Refresh"))
    	{
			StartCoroutine("GetScore");
    	}         
    }
	
	public string Md5Sum(string input)
	{
    	System.Security.Cryptography.MD5 md5 = System.Security.Cryptography.MD5.Create();
    	byte[] inputBytes = System.Text.Encoding.ASCII.GetBytes(input);
    	byte[] hash = md5.ComputeHash(inputBytes);
 
    	StringBuilder sb = new StringBuilder();
    	for (int i = 0; i < hash.Length; i++)
    	{
    	    sb.Append(hash[i].ToString("X2"));
    	}
    	return sb.ToString();
	}
}
