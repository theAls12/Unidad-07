/* Render: WebGL, postproceso, calidad y redimensionado */
let renderer,
  scene,
  camera,
  W = 1,
  H = 1,
  RS = 1;
const POST = { prevVP: new THREE.Matrix4(), vp: new THREE.Matrix4() },
  QUALITY = {
    ultra: { rs: 1, shadow: 4096, tex: 2, fs: 2048, aa: 1 },
    high: { rs: 0.85, shadow: 2048, tex: 1, fs: 1024, aa: 1 },
    mid: { rs: 0.7, shadow: 2048, tex: 1, fs: 1024, aa: 1 },
    low: { rs: 0.55, shadow: 1024, tex: 1, fs: 512, aa: 0 }
  };
let Q = QUALITY.ultra;
const GT = { value: 0 };
function initRenderer() {
  ((renderer = new THREE.WebGLRenderer({
    canvas: $('#gl'),
    antialias: !1,
    powerPreference: 'high-performance',
    stencil: !1
  })),
    (renderer.physicallyCorrectLights = !0),
    (renderer.shadowMap.enabled = !0),
    (renderer.shadowMap.type = THREE.PCFSoftShadowMap),
    (renderer.shadowMap.autoUpdate = !1),
    (renderer.autoClear = !1),
    renderer.setClearColor(0, 1),
    (maxAniso = Math.min(16, renderer.capabilities.getMaxAnisotropy())),
    (scene = new THREE.Scene()),
    (camera = new THREE.PerspectiveCamera(74, 1, 0.03, 900)),
    (camera.rotation.order = 'YXZ'),
    scene.add(camera),
    initPost(),
    resize(),
    addEventListener('resize', resize));
}
const QV = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
function initPost() {
  ((POST.hdr = renderer.capabilities.isWebGL2),
    (POST.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1)),
    (POST.scene = new THREE.Scene()),
    (POST.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), null)),
    (POST.quad.frustumCulled = !1),
    POST.scene.add(POST.quad),
    (POST.bright = new THREE.ShaderMaterial({
      uniforms: { t: { value: null }, px: { value: new THREE.Vector2() }, thr: { value: 1.2 } },
      vertexShader: QV,
      depthTest: !1,
      depthWrite: !1,
      fragmentShader:
        'uniform sampler2D t;uniform vec2 px;uniform float thr;varying vec2 vUv;\n    void main(){vec3 c=texture2D(t,vUv+px*vec2(-1.,-1.)).rgb+texture2D(t,vUv+px*vec2(1.,-1.)).rgb+texture2D(t,vUv+px*vec2(-1.,1.)).rgb+texture2D(t,vUv+px*vec2(1.,1.)).rgb;c*=.25;\n    float l=max(c.r,max(c.g,c.b));c*=smoothstep(thr,thr*2.5,l);gl_FragColor=vec4(min(c,vec3(30.)),1.);}'
    })),
    (POST.blur = new THREE.ShaderMaterial({
      uniforms: { t: { value: null }, dir: { value: new THREE.Vector2() } },
      vertexShader: QV,
      depthTest: !1,
      depthWrite: !1,
      fragmentShader:
        'uniform sampler2D t;uniform vec2 dir;varying vec2 vUv;\n    void main(){vec3 c=texture2D(t,vUv).rgb*.227;\n    c+=(texture2D(t,vUv+dir*1.385).rgb+texture2D(t,vUv-dir*1.385).rgb)*.316;\n    c+=(texture2D(t,vUv+dir*3.231).rgb+texture2D(t,vUv-dir*3.231).rgb)*.07;gl_FragColor=vec4(c,1.);}'
    })),
    (POST.fxaa = new THREE.ShaderMaterial({
      uniforms: { t: { value: null }, px: { value: new THREE.Vector2() }, sharp: { value: 0.28 } },
      vertexShader: QV,
      depthTest: !1,
      depthWrite: !1,
      fragmentShader:
        'uniform sampler2D t;uniform vec2 px;uniform float sharp;varying vec2 vUv;\n    float lu(vec3 c){return dot(c,vec3(.299,.587,.114));}\n    void main(){vec3 nw=texture2D(t,vUv+vec2(-1.,-1.)*px).rgb,ne=texture2D(t,vUv+vec2(1.,-1.)*px).rgb,sw=texture2D(t,vUv+vec2(-1.,1.)*px).rgb,se=texture2D(t,vUv+vec2(1.,1.)*px).rgb,m=texture2D(t,vUv).rgb;\n    float lnw=lu(nw),lne=lu(ne),lsw=lu(sw),lse=lu(se),lm=lu(m),mn=min(lm,min(min(lnw,lne),min(lsw,lse))),mx=max(lm,max(max(lnw,lne),max(lsw,lse)));\n    vec2 d=vec2(-((lnw+lne)-(lsw+lse)),(lnw+lsw)-(lne+lse));float red=max((lnw+lne+lsw+lse)*.03125,1./128.);float rc=1./(min(abs(d.x),abs(d.y))+red);\n    d=clamp(d*rc,vec2(-8.),vec2(8.))*px;\n    vec3 A=.5*(texture2D(t,vUv+d*(1./3.-.5)).rgb+texture2D(t,vUv+d*(2./3.-.5)).rgb);vec3 B=A*.5+.25*(texture2D(t,vUv-d*.5).rgb+texture2D(t,vUv+d*.5).rgb);\n    float lb=lu(B);vec3 c=(lb<mn||lb>mx)?A:B;\n    vec3 blur=(texture2D(t,vUv+vec2(px.x,0.)).rgb+texture2D(t,vUv-vec2(px.x,0.)).rgb+texture2D(t,vUv+vec2(0.,px.y)).rgb+texture2D(t,vUv-vec2(0.,px.y)).rgb)*.25;\n    c=clamp(c+(c-blur)*sharp,0.,1.);gl_FragColor=vec4(c,1.);}'
    })),
    (POST.final = new THREE.ShaderMaterial({
      vertexShader: QV,
      depthTest: !1,
      depthWrite: !1,
      uniforms: {
        tColor: { value: null },
        tDepth: { value: null },
        tBloom: { value: null },
        tDirt: { value: null },
        uDirt: { value: 0 },
        invVP: { value: new THREE.Matrix4() },
        prevVP: { value: new THREE.Matrix4() },
        res: { value: new THREE.Vector2(1, 1) },
        time: { value: 0 },
        near: { value: 0.03 },
        far: { value: 900 },
        uExposure: { value: 1 },
        uCA: { value: 0.006 },
        uBlur: { value: 0.55 },
        uDistort: { value: 0.32 },
        uGrain: { value: 0.12 },
        uVig: { value: 0.75 },
        uDamage: { value: 0 },
        uHurt: { value: 0 },
        uBlood: { value: 0 },
        uBloodSeed: { value: 0 },
        uFlash: { value: 0 },
        uDeath: { value: 0 },
        uThermal: { value: 0 },
        uNV: { value: 0 },
        uScope: { value: 0 },
        uHaze: { value: 0 },
        uBloom: { value: 0.55 },
        uSat: { value: 0.85 },
        uGrade: { value: new THREE.Vector3(1, 1, 1) },
        uLow: { value: 0 }
      },
      fragmentShader:
        '\nprecision highp float;\nuniform sampler2D tColor,tDepth,tBloom,tDirt;uniform float uDirt;uniform mat4 invVP,prevVP;uniform vec2 res;\nuniform float uHurt,uBlood,uBloodSeed;\nuniform float time,near,far,uExposure,uCA,uBlur,uDistort,uGrain,uVig,uDamage,uFlash,uDeath,uThermal,uNV,uScope,uHaze,uBloom,uSat,uLow;\nuniform vec3 uGrade;varying vec2 vUv;\nfloat hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}\nfloat linZ(float d){float z=d*2.-1.;return 2.*near*far/(far+near-z*(far-near));}\nvec2 barrel(vec2 uv,float k){float a=res.x/res.y;vec2 c=uv-.5;c.x*=a;float r2=dot(c,c);float rm=.25*(a*a+1.);vec2 o=c*(1.+k*r2)/(1.+k*rm);o.x/=a;return o+.5;}\nfloat vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}\nfloat fbm3(vec2 p){return vn(p)*.55+vn(p*2.1+7.)*.3+vn(p*4.3+3.)*.15;}\nvec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}\nvoid main(){\n  vec2 uv0=vUv;\n  if(uDeath>0.){uv0.x+=(hash(vec2(floor(vUv.y*70.),floor(time*18.)))-.5)*.03*uDeath;}\n  vec2 uv=barrel(uv0,uDistort);\n  float dep=texture2D(tDepth,uv).x;float lz=linZ(dep);\n  if(uHaze>0.){float hz=smoothstep(12.,70.,lz)*uHaze*step(dep,.99999);uv+=vec2(sin(uv.y*160.+time*4.),cos(uv.x*130.+time*3.1))*.0011*hz;}\n  vec4 ndc=vec4(uv*2.-1.,dep*2.-1.,1.);vec4 wp=invVP*ndc;wp/=wp.w;vec4 pp=prevVP*wp;vec2 puv=pp.xy/pp.w*.5+.5;\n  vec2 vel=(uv-puv)*uBlur;if(lz<1.1)vel=vec2(0.);float vl=length(vel);if(vl>.04)vel*=.04/vl;\n  vec2 dir=uv-.5;float ca=uCA*(.35+dot(dir,dir)*5.);\n  vec3 col=vec3(0.);float j=hash(uv*res+time);\n  for(int i=0;i<8;i++){float t=(float(i)+j)/8.-.5;vec2 s=uv+vel*t;\n    col.r+=texture2D(tColor,s+dir*ca).r;col.g+=texture2D(tColor,s).g;col.b+=texture2D(tColor,s-dir*ca).b;}\n  col/=8.;\n  vec3 blm=texture2D(tBloom,uv).rgb;col+=blm*uBloom;if(uDirt>0.){vec3 dt=texture2D(tDirt,vUv).rgb;col+=blm*dt*uDirt*3.;}\n  col*=uExposure;\n  if(uThermal>0.){float L=dot(col,vec3(.3,.59,.11));L=pow(clamp(L*1.6,0.,1.),.75);\n    vec3 th=L<.33?mix(vec3(.02,.0,.07),vec3(.42,.0,.55),L/.33):(L<.66?mix(vec3(.42,.0,.55),vec3(1.,.36,.0),(L-.33)/.33):mix(vec3(1.,.36,0.),vec3(1.,1.,.82),(L-.66)/.34));\n    col=mix(col,th,uThermal);}\n  col=aces(col);\n  if(uNV>0.){float L=dot(col,vec3(.3,.59,.11));L=clamp(L*2.4,0.,1.);vec3 nv=vec3(.28,1.,.38)*L+(hash(vUv*res+time*61.)-.5)*.2;\n    float m=smoothstep(.62,.48,length((vUv-.5)*vec2(res.x/res.y,1.)));col=mix(col,nv*m,uNV);}\n  float L=dot(col,vec3(.2126,.7152,.0722));\n  col=mix(vec3(L),col,uSat);col*=uGrade;\n  col=clamp((col-.5)*1.06+.5+uLow*(1.-L)*.02,0.,1.);\n  vec2 vc=(vUv-.5)*vec2(res.x/res.y,1.);float rr=length(vc);\n  col*=mix(1.,smoothstep(1.1,.22,rr),uVig);\n  float dv=smoothstep(.25,.95,rr);\n  col=mix(col,vec3(L*.55+.28,0.,0.),uDamage*dv*.85);col=mix(col,vec3(L),uDamage*.3);\n  // health, felt not read: colour drains and the frame closes in as HP drops\n  col=mix(col,vec3(L)*vec3(1.,.93,.9),uHurt*.75);\n  col*=mix(1.,smoothstep(1.05,.18,rr)*.92+.08*(1.-uHurt),uHurt*.85);\n  // blood spatter on the lens after hits: thick near the edges, thins out over time\n  if(uBlood>.01){vec2 bp=vc*5.5+uBloodSeed;float n=fbm3(bp)*.75+fbm3(bp*3.1+11.)*.45;\n    float edge=smoothstep(.35,.95,rr);float th=1.32-uBlood*.38-edge*.45;float m=smoothstep(th,th+.05,n);\n    col=mix(col,vec3(.045,.002,.002)+col*vec3(.12,.015,.012),m*.85);}\n  col=pow(col,vec3(1./2.2));\n  // body-camera sensor noise: luminance grain + chroma speckle, stronger in the shadows, slight row jitter\n  vec2 np=floor(vUv*res*.75)+fract(time*13.7)*100.;\n  float g=hash(np)-.5;vec3 cn=vec3(hash(np+1.7),hash(np+3.1),hash(np+5.3))-.5;\n  float sh=1.45-L*1.1;col+=(g*.75+cn*.45)*uGrain*sh;\n  col+=(hash(vec2(floor(vUv.y*res.y*.5),floor(time*24.)))-.5)*uGrain*.18;\n  col=mix(col,vec3(1.),clamp(uFlash,0.,1.));\n  if(uDeath>0.){float st=hash(vUv*res*.5+time*97.);col=mix(col,vec3(st)*.75,uDeath*.6);col*=1.-.5*uDeath*step(.97,fract(vUv.y*3.-time*.6));}\n  if(uScope>.5){float m=smoothstep(.432,.425,rr);col*=m;float lw=.0013;\n    if(rr<.43&&((abs(vc.x)<lw&&abs(vc.y)>.012)||(abs(vc.y)<lw&&abs(vc.x)>.012)))col*=.05;\n    if(rr<.43&&abs(vc.x)<lw*.6&&vc.y<0.&&vc.y>-.012)col*=.05;\n    col*=mix(1.,.35,smoothstep(.3,.43,rr));}\n  gl_FragColor=vec4(clamp(col,0.,1.),1.);\n}'
    })));
}
function makeRT(e, t, o, n) {
  const a = new THREE.WebGLRenderTarget(e, t, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    format: THREE.RGBAFormat,
    type: n ? THREE.HalfFloatType : THREE.UnsignedByteType,
    depthBuffer: !!o,
    stencilBuffer: !1
  });
  return (o && ((a.depthTexture = new THREE.DepthTexture(e, t)), (a.depthTexture.type = THREE.UnsignedIntType)), a);
}
function resize() {
  ((W = innerWidth),
    (H = innerHeight),
    (RS = Math.min(devicePixelRatio || 1, 2) * Q.rs),
    (RS = clamp(RS, 0.5, 2)),
    renderer.setPixelRatio(1),
    renderer.setSize(W, H, !1));
  const e = Math.max(2, Math.floor(W * RS)),
    t = Math.max(2, Math.floor(H * RS));
  for (const e of ['rt', 'rtA', 'rtB', 'rtL'])
    POST[e] && (POST[e].dispose(), POST[e].depthTexture && POST[e].depthTexture.dispose());
  ((POST.rt = makeRT(e, t, !0, POST.hdr)),
    (POST.rtL = makeRT(e, t, !1, !1)),
    POST.fxaa.uniforms.px.value.set(1 / e, 1 / t));
  const o = Math.max(2, e >> 2),
    n = Math.max(2, t >> 2);
  ((POST.rtA = makeRT(o, n, !1, POST.hdr)),
    (POST.rtB = makeRT(o, n, !1, POST.hdr)),
    (POST.bw = o),
    (POST.bh = n),
    (camera.aspect = W / H),
    camera.updateProjectionMatrix(),
    POST.final.uniforms.res.value.set(e, t));
  const a = $('#hudc');
  ((a.width = W), (a.height = H));
}
function quad(e, t) {
  ((POST.quad.material = e), renderer.setRenderTarget(t), renderer.render(POST.scene, POST.cam));
}
function renderFrame() {
  (camera.updateMatrixWorld(), POST.vp.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));
  const e = POST.final.uniforms;
  (e.invVP.value.copy(POST.vp).invert(),
    e.prevVP.value.copy(POST.prevVP),
    POST.prevVP.copy(POST.vp),
    (e.near.value = camera.near),
    (e.far.value = camera.far),
    (e.time.value = GT.value),
    (renderer.shadowMap.needsUpdate = !0),
    renderer.setRenderTarget(POST.rt),
    renderer.clear(!0, !0, !1),
    camera.layers.set(0),
    renderer.render(scene, camera),
    renderer.clearDepth(),
    camera.layers.set(1),
    renderer.render(scene, camera),
    camera.layers.set(0),
    (POST.bright.uniforms.t.value = POST.rt.texture),
    POST.bright.uniforms.px.value.set(1 / POST.rt.width, 1 / POST.rt.height),
    quad(POST.bright, POST.rtA));
  for (let e = 0; e < 2; e++)
    ((POST.blur.uniforms.t.value = POST.rtA.texture),
      POST.blur.uniforms.dir.value.set((1 + 1.5 * e) / POST.bw, 0),
      quad(POST.blur, POST.rtB),
      (POST.blur.uniforms.t.value = POST.rtB.texture),
      POST.blur.uniforms.dir.value.set(0, (1 + 1.5 * e) / POST.bh),
      quad(POST.blur, POST.rtA));
  ((e.tColor.value = POST.rt.texture),
    (e.tDepth.value = POST.rt.depthTexture),
    (e.tBloom.value = POST.rtA.texture),
    Q.aa
      ? (quad(POST.final, POST.rtL), (POST.fxaa.uniforms.t.value = POST.rtL.texture), quad(POST.fxaa, null))
      : quad(POST.final, null));
}
