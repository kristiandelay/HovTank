// *********************************************************************************************************
// * Code belonging to DFT Games and released under use licence as per Unity Asset Store Licence Agreement *
// *********************************************************************************************************

using System.Collections.Generic;
using UnityEngine;

// Delegates
public delegate void PauseMenuDelegate();
public delegate void LoadingLevelDelegate();

public class TransitionManager : MonoBehaviour
{
    // Constants and statics
    private const string STR_FadingTexture = "Fading texture";
    private const string STR_BackgroundTexture = "Background texture";
    private const string STR_LogoTexture = "Logo texture";
    private static Vector3 fadingPosition = new Vector3(0.5f, 0.5f, 10f);
    private static Vector3 pausePosition = new Vector3(0.5f, 0.5f, 11f);
    private static Vector3 backgroundPosition = new Vector3(0.5f, 0.5f, -10f);
    private static Vector3 zeroPosition = new Vector3(0.5f, 0.5f, 0f);
    private static Vector3 ratioIndependentScale = new Vector3(1f, 1f, 1f);
    private static Vector3 noScalingScale = new Vector3(0f, 0f, 1f);

    // Internal members, used by in-game scripts as well
    internal bool gamePaused = false;


    // Public members
    public bool SplashScreenOnLoad = true;
    public bool ClearSlpashOnEnd = true;
    public bool StoryAfterSplash = true;
    public bool DetectPauseRequest = false;
    public bool TimedStory = false;
    public Vector2 TexturesNativeResolution = new Vector2(800f, 600f);
    public bool ScaleContentTextures = true;
    public float SplashScreenFadingTime = 1.5f;
    public float SplashScreenWaitingTime = 3f;
    public bool CanSkipSplashWaiting = true;
    public string NextScene = string.Empty;
    public Color BackgroundColour = Color.black;
    public Texture PitchBlackTexture = null;
    public Texture WhiteTexture = null;
    public Texture PauseTexture = null;
    public List<Texture> CustomSplashScreenBackgrounds;
    public List<Texture> SplashScreenContents;
    public GUITexture LoadingMessageTexture;
    public List<Texture> ClickThroughStory;


    // Implemented Delegates
    public PauseMenuDelegate PauseMenu = null;
    public LoadingLevelDelegate LoadingLevel = null;

    // Private members
    private float waitCounter = 0f; // We won't use "yield WaitForSeconds" to allow the user to skip
    private static TransitionManager instance = null;
    private int ssIndex = 0;
    private bool presentingSS = false;
    private bool fadingIn = false;
    private bool fadingOut = false;
    private bool waiting = false;
    private bool fadeInScene = false;
    private bool fadeOutScene = false;
    private bool showingStory = false;
    private GameObject ssBackground = null;
    private GameObject ssLogo = null;
    private GameObject fadingTexture = null;
    private GameObject pauseTexture = null;
    private bool waitingStreamedLevel = false;
    private Color color = Color.black;
    private Touch touch;
    private bool touched = false;
    private float scale = 0f;
    private int loadingProgress = 0;

    /// <summary>
    /// This indicates if it's loading a streamed scene
    /// </summary>
    public bool WaitingStreamedScene
    {
        get
        {
            return waitingStreamedLevel;
        }
    }

    /// <summary>
    /// This contains the loading progress when loading a streamed scene
    /// </summary>
    public int LoadingProgress
    {
        get
        {
            return loadingProgress;
        }
    }
    /// <summary>
    /// Instance of the Singleton Transition Manager
    /// used to talk to it from other game scripts
    /// </summary>
    public static TransitionManager Instance
    {
        get
        {
            return instance;
        }
    }

    void Awake()
    {
        // This test is here to prevent problems if 
        // by mistake one puts the script in more than one scene
        if (instance != null && instance != this)
        {
            Destroy(this);
            return;
        }
        instance = this;
        DontDestroyOnLoad(this);
        loadingProgress = 0;
    }

    void Start()
    {
        if (Camera.main != null)
            Camera.main.backgroundColor = Color.black;
        scale = Mathf.Min((float)Screen.width / TexturesNativeResolution.x, (float)Screen.height / TexturesNativeResolution.y);
        fadingTexture = new GameObject(STR_FadingTexture);
        fadingTexture.AddComponent<GUITexture>();
        DontDestroyOnLoad(fadingTexture);
        if (SplashScreenOnLoad)
            DoSplashScreens();
    }

    private void DoSplashScreens()
    {
        // No splash screen? Then do nothing
        if (SplashScreenContents.Count == 0)
            return;
        // Set the current splash screen index
        ssIndex = 0;
        // create the needed GUITexture objects
        ssBackground = new GameObject(STR_BackgroundTexture);
        ssLogo = new GameObject(STR_LogoTexture);
        ssBackground.AddComponent<GUITexture>();
        ssLogo.AddComponent<GUITexture>();

        // prepare the fading GUITexture
        fadingTexture.guiTexture.texture = PitchBlackTexture;
        fadingTexture.guiTexture.color = new Color(0.5f, 0.5f, 0.5f, 0.5f);
        fadingTexture.guiTexture.pixelInset = new Rect(-PitchBlackTexture.width / 2, -PitchBlackTexture.height / 2, PitchBlackTexture.width, PitchBlackTexture.height);
        fadingTexture.transform.position = fadingPosition;
        fadingTexture.transform.localScale = ratioIndependentScale;

        SetCurrentSplashScreenTextures();

        // Set the operation values
        presentingSS = true;
        fadingIn = true;
    }

    private void SetCurrentSplashScreenTextures()
    {
        // Prepare the background
        if (CustomSplashScreenBackgrounds != null && CustomSplashScreenBackgrounds.Count >= (ssIndex + 1))
        {
            ssBackground.guiTexture.texture = CustomSplashScreenBackgrounds[ssIndex];
            ssBackground.guiTexture.color = new Color(0.5f, 0.5f, 0.5f, 0.5f);
            ssBackground.guiTexture.pixelInset = new Rect(-CustomSplashScreenBackgrounds[ssIndex].width / 2, -CustomSplashScreenBackgrounds[ssIndex].height / 2, CustomSplashScreenBackgrounds[ssIndex].width, CustomSplashScreenBackgrounds[ssIndex].height);
        }
        else
        {
            ssBackground.guiTexture.texture = WhiteTexture;
            ssBackground.guiTexture.color = BackgroundColour;
            ssBackground.guiTexture.pixelInset = new Rect(-WhiteTexture.width / 2, -WhiteTexture.height / 2, WhiteTexture.width, WhiteTexture.height);
        }
        ssBackground.transform.position = backgroundPosition;
        ssBackground.transform.localScale = ratioIndependentScale;

        // Prepare the splash screen
        ssLogo.guiTexture.texture = SplashScreenContents[ssIndex];
        float myScale = 1f;
        if (ScaleContentTextures)
            myScale = scale;
        ssLogo.guiTexture.pixelInset = new Rect(-((SplashScreenContents[ssIndex].width * myScale) / 2), -((SplashScreenContents[ssIndex].height * myScale) / 2), SplashScreenContents[ssIndex].width * myScale, SplashScreenContents[ssIndex].height * myScale);
        ssLogo.guiTexture.color = new Color(0.5f, 0.5f, 0.5f, 0.5f);
        ssLogo.transform.position = zeroPosition;
        ssLogo.transform.localScale = noScalingScale;
    }

    private void SetCurrentStoryTextures()
    {
        // Prepare the background
        if (ssBackground == null)
        {
            ssBackground = new GameObject(STR_BackgroundTexture);
            ssBackground.AddComponent<GUITexture>();
        }
        ssBackground.guiTexture.texture = WhiteTexture;
        ssBackground.guiTexture.color = BackgroundColour;
        ssBackground.guiTexture.pixelInset = new Rect(-WhiteTexture.width / 2, -WhiteTexture.height / 2, WhiteTexture.width, WhiteTexture.height);
        ssBackground.transform.position = backgroundPosition;
        ssBackground.transform.localScale = ratioIndependentScale;
        if (ssLogo == null)
        {
            ssLogo = new GameObject(STR_LogoTexture);
            ssLogo.AddComponent<GUITexture>();
        }

        // Prepare the story screen
        ssLogo.guiTexture.texture = ClickThroughStory[ssIndex];
        float myScale = 1f;
        if (ScaleContentTextures)
            myScale = scale;
        ssLogo.guiTexture.pixelInset = new Rect(-((ClickThroughStory[ssIndex].width * myScale) / 2), -((ClickThroughStory[ssIndex].height * myScale) / 2), ClickThroughStory[ssIndex].width * myScale, ClickThroughStory[ssIndex].height * myScale);
        ssLogo.guiTexture.color = new Color(0.5f, 0.5f, 0.5f, 0.5f);
        ssLogo.transform.position = zeroPosition;
        ssLogo.transform.localScale = noScalingScale;
    }

    public void ShowStory(string ThenLoadThisScene)
    {
        if (ClickThroughStory == null || ClickThroughStory.Count == 0)
            return;
        ssIndex = 0;
        showingStory = true;
        NextScene = ThenLoadThisScene;
        fadingIn = true;
        SetCurrentStoryTextures();
    }

    void Update()
    {
#if UNITY_IPHONE || UNITY_ANDROID
        touched = false;
        if (Input.touchCount > 0)
        {
            touch = Input.GetTouch(0);
            touched = touch.tapCount > 0 ? true : false;
        }
#endif
        if (presentingSS || showingStory)
        {
            color = fadingTexture.guiTexture.color;
            if (fadingIn)
            {
                color.a -= Time.deltaTime / (SplashScreenFadingTime * 2f);
                if (color.a <= 0f)
                {
                    color.a = 0f;
                    fadingIn = false;
                    waitCounter = 0f;
                    waiting = true;
                }
                fadingTexture.guiTexture.color = color;
            }
            else if (fadingOut)
            {
                color.a += Time.deltaTime / (SplashScreenFadingTime * 2f);
                if (color.a >= 0.5f)
                {
                    color.a = 0.5f;
                    fadingOut = false;
                    ssIndex += 1;
                    if (presentingSS)
                    {
                        if (ssIndex < SplashScreenContents.Count)
                        {
                            SetCurrentSplashScreenTextures();
                            fadingIn = true;
                        }
                    }
                    else
                    {
                        if (ssIndex < ClickThroughStory.Count)
                        {
                            SetCurrentStoryTextures();
                            fadingIn = true;
                        }
                    }
                }
                fadingTexture.guiTexture.color = color;
            }
            else if (waiting)
            {
                if ((presentingSS) || (showingStory && TimedStory))
                {
                    waitCounter += Time.deltaTime;
                    if ((CanSkipSplashWaiting && (Input.anyKeyDown || touched)) || (waitCounter >= SplashScreenWaitingTime))
                    {
                        waiting = false;
                        fadingOut = true;
                        touched = false;
                        waitCounter = 0f;
                    }
                }
                else
                {
                    if (Input.anyKeyDown || touched)
                    {
                        waiting = false;
                        fadingOut = true;
                        touched = false;
                        waitCounter = 0f;
                    }
                }
            }
            else // splash screen or story sequence ended
            {
                if (presentingSS && StoryAfterSplash && ClickThroughStory.Count > 0)
                {
                    presentingSS = false;
                    ShowStory(NextScene);
                }
                else
                {
                    presentingSS = false;
                    showingStory = false;
                    if (ClearSlpashOnEnd)
                    {
                        SplashScreenContents.Clear();
                        CustomSplashScreenBackgrounds.Clear();
                    }
                    LoadScene(NextScene, false);
                }
            }
        }
        else if (fadeInScene)
        {
            color = fadingTexture.guiTexture.color;
            color.a -= Time.deltaTime / (SplashScreenFadingTime * 2f);
            if (color.a <= 0f)
            {
                color.a = 0f;
                fadeInScene = false;
            }
            fadingTexture.guiTexture.color = color;
        }
        else if (fadeOutScene)
        {
            color = fadingTexture.guiTexture.color;
            color.a += Time.deltaTime / (SplashScreenFadingTime * 2f);
            if (color.a >= 0.5f)
            {
                color.a = 0.5f;
                fadeOutScene = false;
                LoadScene(NextScene, false);
            }
            fadingTexture.guiTexture.color = color;
        }
        else if (waitingStreamedLevel)
        {
            if (NextScene != null && NextScene != string.Empty && Application.CanStreamedLevelBeLoaded(NextScene))
            {
                waitingStreamedLevel = false;
                LoadScene(NextScene, false);
            }
            else
            {
                if (NextScene != null && NextScene != string.Empty)
                    loadingProgress = (int)(Application.GetStreamProgressForLevel(NextScene) * 100);
                else
                    loadingProgress = 0;
            }
        }
        if (DetectPauseRequest && !gamePaused && (Input.GetKeyUp(KeyCode.Escape) || Input.GetKeyUp(KeyCode.Pause) || Input.GetKeyUp(KeyCode.Menu)))
        {
            SetGamePaused();
        }
        else if (DetectPauseRequest && gamePaused && (Input.GetKeyUp(KeyCode.Escape) || Input.GetMouseButtonUp(0) || touched))
        {
            color.a = 0f;
            fadingTexture.guiTexture.color = color;
            DestroyImmediate(pauseTexture);
            gamePaused = false;
            Time.timeScale = 1;
        }
    }

    void OnGUI()
    {
        // Call the delegate
        if (gamePaused && PauseMenu != null)
            PauseMenu();
    }

    private void SetGamePaused()
    {
        touched = false;
        // Doesn't show the texture if a delegate exists
        if (pauseTexture == null && PauseMenu == null)
        {
            pauseTexture = new GameObject();
            pauseTexture.AddComponent<GUITexture>();
            pauseTexture.guiTexture.texture = PauseTexture;
            float myScale = 1f;
            if (ScaleContentTextures)
                myScale = scale;
            pauseTexture.guiTexture.color = new Color(0.5f, 0.5f, 0.5f, 0.5f);
            pauseTexture.transform.position = pausePosition;
            pauseTexture.guiTexture.pixelInset = new Rect(-((PauseTexture.width * myScale) / 2), -((PauseTexture.height * myScale) / 2), PauseTexture.width * myScale, PauseTexture.height * myScale);
            pauseTexture.transform.localScale = noScalingScale;
        }
        color.a = 0.25f;
        fadingTexture.guiTexture.color = color;
        Time.timeScale = 0f;
        gamePaused = true;
    }
    void OnApplicationPause(bool paused)
    {
        if (paused && DetectPauseRequest)
            SetGamePaused();
    }

    public void LoadScene(string sceneToLoad, bool fadeOutFirst)
    {
        NextScene = sceneToLoad;
        if (fadeOutFirst)
        {
            fadeOutScene = true;
            return;
        }
        if (Application.isWebPlayer)
        {
            if (Application.CanStreamedLevelBeLoaded(sceneToLoad))
            {
                if (NextScene != null && NextScene != string.Empty)
                    Application.LoadLevel(sceneToLoad);
                fadeInScene = true;
            }
            else
            {
                loadingProgress = 0;
                waitingStreamedLevel = true;
                if (LoadingLevel == null)
                    Instantiate(LoadingMessageTexture);
            }
        }
        else
        {
            if (NextScene != null && NextScene != string.Empty)
                Application.LoadLevel(NextScene);
            fadeInScene = true;
        }
    }
}
