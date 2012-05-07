Shader "Hidden/WhiteDraw" {
	Properties {
	}
	SubShader {
		Tags { "RenderType"="TransparentCutout" }
		LOD 200
		
		CGPROGRAM
		#pragma surface surf NoLight noambient noambient noambient noambient noambient halfasview approxview
		
		float _DrawMe;

		struct Input {
			float2 uv_MainTex;
		};
		
		inline fixed4 LightingNoLight (SurfaceOutput s, fixed3 lightDir, fixed atten)
		{
				return fixed4(1,1,1,1);
		}

		void surf (Input IN, inout SurfaceOutput o) {
		}
		ENDCG
	} 
}
