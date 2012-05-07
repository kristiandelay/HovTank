Shader "Chickenlord/3.5/Detail/Bumped Diffuse" {
Properties {
	_Color ("Main Color", Color) = (1,1,1,1)
	_MainTex ("Base (RGB) Gloss (A)", 2D) = "white" {}
	_BumpMap ("Normalmap", 2D) = "bump" {}
	_Detail ("Detail Base (RGB) Gloss (A)", 2D) = "white" {}
	_DetailBump ("Detail Normalmap", 2D) = "bump" {}
}
SubShader { 
	Tags { "RenderType"="Opaque" }
	LOD 400
	
CGPROGRAM
#pragma surface surf Lambert
#pragma target 3.0

sampler2D _MainTex;
sampler2D _BumpMap;
sampler2D _Detail;
sampler2D _DetailBump;
fixed4 _Color;

struct Input {
	float2 uv_MainTex;
	float2 uv_BumpMap;
	float2 uv_Detail;
};

void surf (Input IN, inout SurfaceOutput o) {
	fixed4 tex = tex2D(_MainTex, IN.uv_MainTex);
	fixed4 td = tex2D(_Detail,IN.uv_Detail);
	td= min(td*1.8,0.9)+0.1;
	tex *= td;
	o.Albedo = tex.rgb * _Color.rgb;
	o.Alpha = tex.a * _Color.a;
	o.Normal = UnpackNormal(tex2D(_BumpMap, IN.uv_BumpMap));
	o.Normal = normalize(o.Normal+UnpackNormal(tex2D(_DetailBump, IN.uv_Detail)));
}
ENDCG
}

FallBack "Specular"
}
