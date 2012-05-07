Shader "Chickenlord/Reflective/Fresnel/Translucency"{
	Properties {
	_Color ("Layer 1 Color", Color) = (1,1,1,1)
	_SpecColor ("Specular Color L3", Color) = (0.5, 0.5, 0.5, 1)	
	_Shininess ("Shininess L1", Range (0.01, 1)) = 0.078125
	_ReflectColor ("Reflection Color", Color) = (1,1,1,0.5)
	_Fresnel("Reflection Fresnel Exponent",Range(0,6)) = 1
	_MainTex ("Base (RGB) RefStrGloss (A)", 2D) = "white" {}
	_Cube ("Reflection Cubemap", Cube) = "" { TexGen CubeReflect }
	_BumpMap ("Normalmap", 2D) = "bump" {}
	
	_SSSC ("SSSC",Color) = (1,1,1,1)
	_TMAP("Translucency Map Color(RGB) Strength(A)",2D) = ""{}
	_TPOW("Translucency Power",Float) = 1
	_TMUL("Translucency Multiplier",Float) = 1
	_Dist("Translucency Distortion",Range(0,1)) = 1
	_AO("Ambient Occlusion Map",2D) = "" {}
	_AOST("Ambient Occlusion Strength",Range(0,1)) = 1
	_PP("Translucency Spread",Range(0.01,1)) = 1
	
	}
	SubShader {
		Tags { "RenderType"="Opaque" }
		LOD 200
		
		CGPROGRAM
		#pragma surface surf BlinnPhongTranslucent nolightmap fullforwardshadows addshadow
		#pragma target 3.0
		
		sampler2D _TMAP;
		sampler2D _AO;
		half _AOST;
		
		samplerCUBE _Cube;

		fixed4 _ReflectColor;
		half _Fresnel;
	
		fixed4 _Color;
		sampler2D _MainTex;
		sampler2D _BumpMap;
		float _Shininess;
		fixed4 _SSSC;
		half _TMUL;
		half _Dist;
		half _TPOW;
		half _PP;
		
		struct Input {
			float2 uv_MainTex;
			float2 uv_BumpMap;
			float3 worldRefl;
			float3 viewDir;
			INTERNAL_DATA
		};
		
		struct SurfaceOutputPS {
			fixed3 Albedo;
			fixed3 Normal;
			fixed Gloss;
			half Specular;	
			fixed Alpha;
			fixed3 Emission;
			float2 ShadeMapUV;
		};
		
		
		inline float Schlick2(float Rzero,float3 lightDir,float3 normal,float exponent)
		{
			return Rzero + (1 - Rzero)*pow((1 - dot(lightDir,normal)),exponent);
		}
		
		inline fixed4 LightingBlinnPhongTranslucent (SurfaceOutputPS s, fixed3 lightDir, fixed3 viewDir, fixed atten)
		{
			fixed4 sub = tex2D(_TMAP,s.ShadeMapUV);
			half3 h = normalize (lightDir + viewDir);
			fixed diff = max (0, dot (s.Normal, lightDir));
			
			float nh = max (0, dot (s.Normal, h));
			float spec = pow (nh, s.Specular*128.0) * s.Gloss;
			float3 ambient = saturate(pow(sub.a*_TMUL*_SSSC.rgb*sub.rgb,_TPOW));
			sub.rgb *= _SSSC.rgb * _LightColor0.rgb * pow(pow(clamp(dot(normalize(normalize(viewDir)+normalize(s.Normal)*_Dist), -(normalize(lightDir))),0,1),_TPOW),_PP)*_TMUL*sub.a;
			
			fixed4 c;
			c.rgb = ((s.Albedo) * (_LightColor0.rgb * diff*atten+sub.rgb)+clamp(1-_LightColor0.a*diff,0,1)*ambient*atten + _LightColor0.rgb * _SpecColor.rgb * spec*atten) * (2);
			c.a = s.Alpha + _LightColor0.a * _SpecColor.a * spec * atten;
			
			fixed ao = tex2D(_AO,s.ShadeMapUV).g;
			c.rgb = (1-_AOST)*c.rgb+_AOST*c.rgb*ao;
			return c;
		}

		void surf (Input IN, inout SurfaceOutputPS o) {
			half4 c = tex2D (_MainTex, IN.uv_MainTex);
			o.ShadeMapUV = IN.uv_MainTex;
			o.Albedo = c.rgb * _Color.rgb;
			o.Gloss = 	c.a;
			o.Specular = _Shininess;
			o.Normal = UnpackNormal(tex2D(_BumpMap,IN.uv_BumpMap));
			float3 worldRefl = WorldReflectionVector (IN, o.Normal);
			fixed4 reflcol = texCUBE (_Cube, worldRefl);
			reflcol *= Schlick2(0,normalize(IN.viewDir),o.Normal,_Fresnel);
			o.Emission = reflcol.rgb * _ReflectColor.rgb*c.a;
			o.Alpha = c.a;
		}
		ENDCG
	} 
	FallBack "Chickenlord/FastSkin"
}
