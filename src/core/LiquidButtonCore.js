export const LIQUID_BUTTON_CSS = `
:host {
  display: inline-block;
  vertical-align: middle;
  background: transparent !important;
  border: none !important;
  padding: 0 !important;
  box-sizing: border-box;
}
:host([disabled]),
.liquid-button-wrapper.disabled {
  opacity: 0.55;
  pointer-events: none;
  cursor: not-allowed;
  filter: grayscale(0.2);
}
.liquid-button-wrapper {
  --h: 52px;
  --u: calc(var(--h) / 516);
  --bw-default: calc(1407 * var(--u));
  --bh: var(--h);
  --pad-x: var(--btn-padding-x, calc(280 * var(--u)));
  
  position: relative;
  width: var(--btn-width, max-content);
  height: var(--bh);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  touch-action: manipulation;
  font-family: "Inter", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif;
  vertical-align: middle;
}
.liquid-button-wrapper * { box-sizing: border-box; }
.liquid-button-plate {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border-radius: var(--br, 999px);
  background: var(--btn-bg);
  border: 1px solid var(--btn-border, rgba(255, 255, 255, 0.15));
  box-shadow: none;
  transition: background 0.38s cubic-bezier(0.22, 0.61, 0.36, 1), border-color 0.38s ease;
}
.liquid-button-wrapper.hot .liquid-button-plate {
  background: var(--btn-bg-hot);
  border-color: var(--btn-border-hot, var(--btn-border, rgba(255, 255, 255, 0.25)));
  box-shadow: none;
}
.liquid-button-wrapper.press .liquid-button-plate {
  background: var(--btn-bg-press);
  border-color: var(--btn-border, rgba(255, 255, 255, 0.15));
  box-shadow: none;
  transition-duration: 0.1s;
}
.liquid-button-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
  border-radius: var(--br, 999px);
}
.liquid-button-btn {
  position: relative;
  width: 100%;
  min-width: var(--bw-default);
  height: 100%;
  border: 0;
  background: none;
  padding: var(--btn-padding, 0 var(--pad-x));
  border-radius: var(--br, 999px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  gap: calc(88 * var(--u));
  color: var(--text-color, #fff);
  font-family: inherit;
  font-weight: 500;
  font-size: calc(207 * var(--u));
  line-height: 1;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  outline: none;
  z-index: 2;
}
.liquid-button-btn:focus-visible {
  outline: calc(4 * var(--u)) solid rgba(255, 255, 255, 0.55);
  outline-offset: calc(10 * var(--u));
}
.liquid-button-icon {
  width: calc(115 * var(--u));
  height: calc(115 * var(--u));
  display: block;
  flex: none;
  overflow: visible;
}
.liquid-button-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--btn-gap, calc(88 * var(--u)));
  transform: translateY(calc(2 * var(--u)));
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  color: inherit;
}
.liquid-button-label svg,
.liquid-button-label ::slotted(svg) {
  flex-shrink: 0;
  vertical-align: middle;
}
`;

const VERT = `#version 300 es
in vec2 position; void main(){ gl_Position = vec4(position,0.,1.); }`;

const HEAD = `#version 300 es
precision highp float;
out vec4 o;

uniform vec2  uC;        // pill centre, device px
uniform vec2  uHalf;     // pill half-extent, device px
uniform float uRadius;   // corner radius, device px
uniform float uT;        // seconds
uniform float uHover;    // 0..1
uniform float uPress;    // 0..1, eased
uniform vec4  uRip[3];   // xy centre (button heights, +y down), z start, w live
uniform vec4  uRipK;     // speed, ring width, decay, amplitude
uniform vec4  uRipK2;    // facet depth, facet count, crest sharpness, emission
uniform vec4  uPtr;      // xy trailing cursor, z strength, w normalised speed
uniform vec4  uPtrK;     // radius, base amplitude, speed amplitude, rim lift

#define PI 3.14159265

float sdPill(vec2 p, vec2 b, float r){
  vec2 q = abs(p) - b + r;
  return min(max(q.x,q.y),0.) + length(max(q,0.)) - r;
}

/* Expanding ring from each press, in button-height units.  Three slots so a
   quick double-tap overlaps instead of cutting the first one off.

   Two things keep it from reading as a water ripple: the wavefront is
   faceted rather than circular — its radius is modulated by angle, and the
   facets rotate as it travels — and the crest profile is a cusp rather than
   a gaussian, so it lands as a crease in sheet metal instead of a soft swell. */
float ripple(vec2 p, float t){
  float sum = 0.;
  for(int i = 0; i < 3; i++){
    if(uRip[i].w < 0.5) continue;
    float age = t - uRip[i].z;
    if(age < 0. || age > 4.) continue;
    vec2  rp = p - uRip[i].xy;
    float facet = 1. + uRipK2.x * cos(uRipK2.y * atan(rp.y, rp.x) + age * 2.1 + float(i) * 2.4);
    float x = (length(rp) - age * uRipK.x * facet) / uRipK.y;
    sum += exp(-pow(abs(x) + 1e-4, uRipK2.z)) * exp(-age * uRipK.z);
  }
  return sum;
}

/* A soft well under the cursor.  It lags behind the real pointer and swells
   with speed, so moving across the button drags the metal rather than sliding
   a static blob over it. */
float pointerW(vec2 p){
  if(uPtr.z < 0.001) return 0.;
  float d = length(p - uPtr.xy) / uPtrK.x;
  return exp(-d*d) * uPtr.z;
}
/* Displacing the sample point, not the field value, is what makes this read as
   liquid: the bands bulge and stretch around the cursor like a lens instead of
   just getting brighter under it. */
vec2 pointerWarp(vec2 p){
  float w = pointerW(p);
  if(w <= 0.) return vec2(0.);
  return normalize(p - uPtr.xy + vec2(1e-5)) * w * (uPtrK.y + uPtrK.z * uPtr.w);
}
`;

/* ---- the travelling rim, in its own pass so the blur below never touches it */
const FRAG_RIM =
  HEAD +
  `
uniform float uBw;       // stroke half-width, device px
uniform vec3 uRimColor;
uniform float uE[8];     // base, hot, chroma-across, chroma-along, speed,
                         // topBias, press lift, ripple lift

/* Arc-length position around the rounded box, 0..1, starting at the right-hand
   extreme and running counter-clockwise. */
float perim(vec2 d, vec2 b, float r){
  vec2 c = max(b - r, vec2(0.));
  float arc = 0.5 * PI * r;
  float P = 4.*(c.x + c.y) + 2.*PI*r;
  if(P < 1e-3) return 0.;

  float s = 0.;
  if(d.x >= c.x && d.y >= c.y){
    float th = atan(max(d.y - c.y, 0.), max(d.x - c.x, 0.));
    s = c.y + r * clamp(th, 0., 0.5*PI);
  } else if(d.x <= -c.x && d.y >= c.y){
    float th = atan(max(d.y - c.y, 0.), d.x + c.x);
    s = c.y + arc + 2.*c.x + r * max(th - 0.5*PI, 0.);
  } else if(d.x <= -c.x && d.y <= -c.y){
    float th = atan(d.y + c.y, d.x + c.x);
    if(th < 0.) th += 2.*PI;
    s = c.y + 2.*arc + 2.*c.x + 2.*c.y + r * max(th - PI, 0.);
  } else if(d.x >= c.x && d.y <= -c.y){
    float th = atan(d.y + c.y, d.x - c.x);
    if(th < 0.) th += 2.*PI;
    s = c.y + 3.*arc + 4.*c.x + 2.*c.y + r * max(th - 1.5*PI, 0.);
  } else if(abs(d.x) < c.x && d.y > 0.){
    s = c.y + arc + (c.x - d.x);
  } else if(abs(d.x) < c.x && d.y <= 0.){
    s = c.y + 3.*arc + 2.*c.x + 2.*c.y + (d.x + c.x);
  } else if(abs(d.y) < c.y && d.x > 0.){
    s = (d.y >= 0.) ? d.y : (P + d.y);
  } else {
    s = c.y + 2.*arc + 2.*c.x + (c.y - d.y);
  }
  return fract(s / P);
}
// periodic bump, so a highlight wraps cleanly at s = 0
float pb(float u, float w){ u = fract(u); float x = min(u, 1.-u); return exp(-(x*x)/(w*w)); }

// travelling brightness around the rim — three lobes at different speeds and
// widths, which never quite re-align, so the light keeps re-pooling
float rimHot(float s, float t){
  float v = uE[0];
  v += 0.62 * pb(s - t*uE[4],             0.075);
  v += 0.44 * pb(s + t*uE[4]*0.63 + 0.41, 0.135);
  v += 0.30 * pb(s - t*uE[4]*0.34 + 0.73, 0.200);
  return v;
}
// soft band riding the pill edge, offset per channel to fringe across the stroke
float rimBand(float sd, float off){ return 1. - smoothstep(0., uBw*1.05, abs(sd + uBw*0.55 + off)); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uRadius);
  if(sd > uBw*2.5 || sd < -uBw*3.5){ o = vec4(0.); return; }

  /* Each channel is offset both *across* the stroke and *along* it, so the rim
     fringes red-outside / cyan-inside and its hue also drifts as a highlight
     slides past — the two together are what read as metal rather than as a
     moving white dot. */
  float s = perim(d, uHalf, uRadius);
  float top = mix(1., 0.5 + 0.5 * (d.y / uHalf.y), uE[5]);

  // pressing lifts the whole outline, and each ripple flares it again as the
  // ring sweeps past — so the rim reports the press twice, once as a step and
  // once as a wave running round the edge
  // …and the stretch of outline nearest the cursor picks up a little too
  vec2  p   = vec2(d.x, -d.y) / (uHalf.y * 2.);
  float lift = 1. + uPress * uE[6] + ripple(p, uT) * uE[7]
             + pointerW(p) * uPtrK.w;

  float band = rimBand(sd, 0.);
  float hot = rimHot(s, uT);
  float intensity = band * hot * uE[1] * top * lift;

  o = vec4(vec3(
    rimBand(sd,  uE[2]) * rimHot(s + uE[3], uT),
    band * hot,
    rimBand(sd, -uE[2]) * rimHot(s - uE[3], uT)
    ) * uRimColor * uE[1] * top * lift, intensity);
}`;

const FRAG_SCENE =
  HEAD +
  `
uniform float uP[21];    // tunables
uniform vec3 uFluid1;
uniform vec3 uFluid2;
uniform vec3 uRippleColor;

float h21(vec2 p){
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float vn(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f*f*(3.-2.*f);
  float a = h21(i), b = h21(i+vec2(1,0)), c = h21(i+vec2(0,1)), d = h21(i+vec2(1,1));
  return mix(mix(a,b,f.x), mix(c,d,f.x), f.y) * 2. - 1.;
}
// normalised to roughly -1..1; low gain keeps the first octave dominant, which
// is what keeps the ribbons big and smooth instead of turbulent
float fbm(vec2 p, float g){
  float s = 0., a = 1., n = 0.;
  for(int i=0;i<4;i++){ s += a*vn(p); n += a; p = p*2.03 + 11.7; a *= g; }
  return s / n;
}
float fbm(vec2 p){ return fbm(p, 0.5); }

/* p is in button-height units, +y down, origin at the pill centre.

   The bands in the reference are a *family of parallel curves*: one swooping
   valley repeated up the button, dense where the light is pinched and pulled
   wide open where it is not.  So the field is built that way explicitly —

       V = (y - valley(x)) * density(x)

   — rather than hoping 2-D noise happens to produce it.  Level sets of V are
   all vertical translates of the same valley curve, which is what makes the
   ribbons laminar and near-parallel; a density that varies along x is what makes
   them crowd into razor fringes at one end and open into a broad wash at the
   other.  A soft plateau over V then paints them, sampled once per
   wavelength at slightly offset heights, so every edge opens into a prism of
   width dispersion / |grad V|.                                             */

// smooth 1-D wiggle that drifts slowly with time
float wig(float x, float t, float seed){
  return vn(vec2(x,          t*0.150 + seed)) * 0.60
       + vn(vec2(x*2.07 + 4., t*0.105 + seed)) * 0.27
       + vn(vec2(x*4.30 - 7., t*0.080 + seed)) * 0.13;
}

float valleyAt(vec2 p, float t){ return wig(p.x*uP[0], t, 0.0) * uP[1]; }
float densAt  (vec2 p, float t){ return uP[2] * exp(uP[3] * wig(p.x*uP[4] + 9.0, t, 2.7)); }

float surface(vec2 p, float t){
  float V = (p.y - valleyAt(p,t)) * densAt(p,t);
  V += uP[5] * fbm(p*vec2(0.8, 1.7)*uP[6] + vec2(t*0.05, -t*0.03), uP[17]);
  return V - uP[7];
}
// One plateau per unit of V — so the density is literally bands per button height.
// A plateau rather than a step is what puts warm on the low edge and cool on
// the high edge of every ribbon.
float tone(float v){
  float u = fract(v);
  float e = uP[9], W = uP[10] * 0.5;
  return smoothstep(0.5-W-e, 0.5-W, u) * (1. - smoothstep(0.5+W, 0.5+W+e, u));
}
vec3 spec(float t){ return clamp(vec3(1.5) - abs(4.*t - vec3(3.,2.,1.)), 0., 1.); }

void main(){
  vec2  d  = gl_FragCoord.xy - uC;
  float sd = sdPill(d, uHalf, uRadius);
  float pill = 1. - smoothstep(-1., 1., sd);
  float S = uHalf.y * 2.;                 // button height, device px
  float t = uT;

  // rgb is premultiplied by the mask and alpha carries it, so the blur that
  // follows can normalise and keep a clean edge instead of a dark vignette
  if(uHover <= 0.0015 || pill <= 0.0015){ o = vec4(0., 0., 0., pill); return; }

  vec2  p = vec2(d.x, -d.y) / S;          // gl_FragCoord is y-up
  vec2  q = p + pointerWarp(p);           // the cursor drags the sheet

  // self-refraction: bend the lookup along the field's own slope, which piles
  // iso-lines up into folds instead of leaving them evenly spaced
  float h0 = surface(q, t);
  vec2  gp = vec2(dFdx(h0), -dFdy(h0)) * S;          // grad in p-units
  float V  = surface(q - gp * uP[8] / max(uP[2], .001), t);

  // gradient-aligned filaments: fast variation across the iso-lines, slow
  // along them, so the fine detail reads as drawn-out fibres of light
  vec2  gd = normalize(gp + vec2(1e-5));
  V += uP[13] * fbm(vec2(dot(q,gd)*uP[14], dot(q, vec2(-gd.y,gd.x))*uP[14]*0.04) + vec2(0., t*0.06));

  // press ripple: displacing the field rather than adding light means the
  // bands themselves bow outwards as the ring passes, which is what sells it
  // as a disturbance *in* the metal instead of a decal over it
  float rip  = ripple(p, t);
  float well = pointerW(p);
  V += rip * uRipK.w;

  // Real dispersion is not linear in wavelength — the blue end bends far more
  // than the red (Cauchy).  Skewing the sample offsets the same way is what
  // gives the reference its broad cool wash against a tight warm edge.
  const int N = 21;
  float mid = 1. - pow(0.5, uP[12]);
  vec3 col = vec3(0.);
  float totTone = 0.;
  for(int i=0;i<N;i++){
    float k = float(i)/float(N-1);
    vec3  w = mix(uFluid1, uFluid2, k);
    float t = tone(V + ((1. - pow(1. - k, uP[12])) - mid) * uP[11]);
    col  += w * t;
    totTone += t;
  }
  col /= max(totTone, 0.001);
  col = pow(col, vec3(uP[15]));

  // light envelope — the ribbons only exist where the sheet is lit, and the
  // dark upper region is bounded by the same valley curve the bands follow
  float lit = smoothstep(uP[18], uP[19], q.y - valleyAt(q, t));
  lit *= mix(1., lit, 0.55);                     // deepen the unlit crescent
  col *= uP[16] * lit;

  // the crest runs hotter, and carries a little light of its own so it stays
  // legible through the softening blur and across the unlit part of the pill
  col = col + uRippleColor * (rip * 1.15 + well * 0.60) * col;

  o = vec4(col * pill * uHover, pill);
}`;

/* Downsample; optionally adding a second source (used to fold the rim into
   the bloom input).  Alpha rides along so the metal's coverage mask survives
   the blur chain. */
const FRAG_DOWN = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex, uTex2;
uniform vec2 uDstTexel;   // 1 / destination size  (maps dest fragCoord -> uv)
uniform vec2 uSrcTexel;   // 1 / source size       (tap spacing)
uniform float uAdd;       // 1 to include uTex2
void main(){
  vec2 uv = gl_FragCoord.xy * uDstTexel;
  // Taps sit a quarter of a *destination* texel out, so for a 2x reduction
  // they land exactly on the four source texel centres.  Spacing them by a
  // whole source texel instead — as this did originally — skips every other
  // pixel, and any fine detail in the field folds down into low-frequency
  // moiré that no amount of subsequent blurring can remove.
  vec2 e = uDstTexel * 0.25;
  vec4 s = texture(uTex, uv + vec2(-e.x,-e.y)) + texture(uTex, uv + vec2( e.x,-e.y))
         + texture(uTex, uv + vec2(-e.x, e.y)) + texture(uTex, uv + vec2( e.x, e.y));
  s *= 0.25;
  if(uAdd > 0.5){
    vec4 r = texture(uTex2, uv + vec2(-e.x,-e.y)) + texture(uTex2, uv + vec2( e.x,-e.y))
           + texture(uTex2, uv + vec2(-e.x, e.y)) + texture(uTex2, uv + vec2( e.x, e.y));
    s.rgb += r.rgb * 0.25;
  }
  o = s;
}`;

const FRAG_BLUR = `#version 300 es
precision highp float;
out vec4 o;
uniform sampler2D uTex; uniform vec2 uTexel; uniform vec2 uDir; uniform float uR;
void main(){
  vec2 uv = gl_FragCoord.xy * uTexel;
  vec2 st = uTexel * uDir * uR;
  vec4 s = texture(uTex, uv) * 0.1964;
  s += (texture(uTex, uv + st*1.4118) + texture(uTex, uv - st*1.4118)) * 0.2969;
  s += (texture(uTex, uv + st*3.2941) + texture(uTex, uv - st*3.2941)) * 0.0944;
  s += (texture(uTex, uv + st*5.1765) + texture(uTex, uv - st*5.1765)) * 0.0104;
  o = s;
}`;

const FRAG_COMP =
  HEAD +
  `
uniform sampler2D uSoft, uRim, uGlow;
uniform vec2  uRes;
uniform float uGlowGain, uGlowIn, uOccl, uDim, uPunch;

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  vec3 glow = texture(uGlow, uv).rgb;

  vec2  d    = gl_FragCoord.xy - uC;
  float sd   = sdPill(d, uHalf, uRadius);
  float pill = 1. - smoothstep(-1., 1., sd);

  // normalised blur: dividing by the blurred coverage keeps the softened metal
  // full strength right up to the edge instead of fading into the mask
  vec4 m = texture(uSoft, uv);

  // Scrim, applied *after* the blur: knock the metal back through the middle
  // where the label sits, leaving the top and bottom at full brightness.  Doing
  // this before the blur would smear the protection away at high blur values.
  float veil = 1. - smoothstep(0.46, 0.88, abs(d.y) / uHalf.y);

  // Blurring flattens the tonal range into a wash; putting the contrast back
  // with a power curve — after the blur, so it costs no smoothness — is what
  // makes it read as poured metal rather than a soft glow.  Highlights keep
  // their level while the mid-tones drop away.
  vec3 metal = pow(max(m.rgb / max(m.a, 1e-3), 0.), vec3(uPunch));

  vec4 rimSample = texture(uRim, uv);
  vec3 core = metal * pill * mix(1., uDim, veil) + rimSample.rgb;

  // The ripple's own light is added here, after the blur, so the crease stays
  // a hard line.  Its displacement of the field still rides inside the
  // softened metal — the sheet bows, and the crest glints along the fold.
  float rip = ripple(vec2(d.x, -d.y) / (uHalf.y * 2.), uT);
  core += vec3(rip * rip) * uRipK2.w * pill * mix(1., 0.42, veil);

  // The button occludes its own bloom over the patch where its shadow falls,
  // so the drop shadow keeps its contrast even when the face is blown out.
  float sdSh = sdPill(d + vec2(0., uHalf.y * 0.62), uHalf * 0.94, uRadius * 0.94);
  float occl = uOccl * exp(-max(sdSh, 0.) / (uHalf.y * 0.75));

  // Bloom spills mostly outward; a little of it is allowed back inside so the
  // hot rim bleeds onto the face, as it does on the reference component.
  vec3 rgb = core + glow * uGlowGain * mix(1., uGlowIn, pill) * (1. - occl * (1. - pill));

  // premultiplied — the page's ambient pool and the button's drop shadow are
  // CSS underneath, and this layer adds light on top of them
  float lum = max(rgb.r, max(rgb.g, rgb.b));
  float a = clamp(max(lum, rimSample.a * 0.8), 0., 1.);
  o = vec4(min(rgb, vec3(1.)), a);
}`;

/* --------------------------------------------------------------- */

// the metal field — uP[0..20]
const P = {
  valFreq: 0.5, // 0  x-frequency of the valley curve
  valAmp: 0.55, // 1  valley depth, in button heights (bounded so the
  //    ribbon can never drift entirely off the pill)
  dens: 2.4, // 2  band density — bands per button height
  densVar: 2.2, // 3  how much the density swings along x (exponential)
  densFreq: 0.32, // 4  x-frequency of the density variation
  wobAmp: 0.12, // 5  organic 2-D wobble, in field units
  wobFreq: 1.6, // 6  its frequency
  lift: 0.05, // 7  phase offset of the band family
  refract: 0.18, // 8  self-refraction — folds the iso-lines
  edge: 0.04, // 9  softness of the plateau edges
  width: 0.46, // 10 plateau width, as a fraction of one band period
  disp: 0.3, // 11 spectral dispersion, in band periods
  skew: 1.5, // 12 dispersion skew — >1 spreads the blue end
  // The filaments were 20 cycles per button height — finer than the softening
  // buffer can carry, so they aliased into stripes instead of reading as
  // fibres.  At this blur they contribute nothing but that, so they are off.
  fineAmp: 0.0, // 13 filament amplitude
  fineFreq: 9.0, // 14 filament frequency across the iso-lines
  gamma: 1.0, // 15 tone gamma
  gain: 1.9, // 16 overall gain
  octGain: 0.32, // 17 fbm octave gain — low keeps the wobble big
  litLo: -0.26, // 18 distance below the valley where light begins
  litHi: 0.1, // 19 …and where it is full
  dim: 0.44, // 20 how far the metal is knocked back under the label
};
const PKEYS = Object.keys(P);

// the animated rim — uE[0..5]
const E = {
  base: 0.2, // 0 floor brightness, so the whole outline stays drawn
  hot: 0.82, // 1 gain on the travelling highlights
  chromA: 0.42, // 2 chromatic offset across the stroke, device px
  chromS: 0.03, // 3 chromatic offset along the perimeter, in laps
  speed: 0.07, // 4 laps per second of the leading highlight
  top: 0.35, // 5 how much the rim stays biased to the top edge
  press: 0.85, // 6 how far the outline brightens while held
  ripple: 1.6, // 7 extra flare as a ripple crest crosses the outline
};
const EKEYS = Object.keys(E);

// composite / JS-side only
const C = {
  glow: 1.95, // outer-glow gain
  glowR: 1.3, // outer-glow radius
  glowIn: 0.3, // how much bloom is allowed back inside the pill
  occl: 0.62, // how much the drop shadow eats the bloom beneath it
  soften: 0.24, // blur on the metal, in button heights — the "molten" knob
  punch: 1.5, // contrast curve on the softened metal; 1 = off
};

// disturbances — all distances in button heights, times in seconds
const R = {
  // press ripple
  speed: 1.85, // how fast the ring expands
  width: 0.2, // ring thickness
  decay: 1.35, // e-fold fade
  amp: 1.35, // how far it displaces the metal field
  facet: 0.18, // depth of the faceting on the wavefront
  lobes: 6.0, // how many facets
  sharp: 1.15, // crest profile: 2 = gaussian swell, ~1 = hard crease
  emit: 0.45, // light the crest carries of its own
  // cursor well
  ptrRad: 0.55, // radius of the well
  ptrAmp: 0.32, // how far the sheet is dragged when the cursor is still
  ptrFast: 0.4, // extra drag at full speed
  ptrRim: 0.8, // how much the nearest rim brightens
  ptrLag: 0.0016, // trail: fraction of the gap left after 1s (lower = snappier)
  ptrVref: 4.5, // cursor speed, in button heights/sec, that counts as "fast"
};

export class LiquidButtonCore {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      text: "Sign up",
      height: 52,
      fontFamily: "inherit",
      textColor: "#ffffff",
      borderRadius: "999px",
      borderColor: "rgba(255, 255, 255, 0.15)",
      btnBg: "#0b0c0e",
      btnBgHot: "#08090a",
      btnBgPress: "#070809",
      fluidColor1: "#251249", // Spectral default equivalent roughly
      fluidColor2: "#070212",
      rimColor: "#ffffff",
      rippleColor: "#ffffff",
      padding: undefined,
      paddingX: undefined,
      width: undefined,
      disabled: false,
      ...options,
    };
    this.initDOM();
    this.initGL();
  }

  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    if (this.stage) {
      this.stage.style.setProperty("--h", this.options.height + "px");
      this.stage.style.setProperty("--br", this.options.borderRadius);
      this.stage.style.setProperty("--text-color", this.options.textColor);
      this.stage.style.setProperty("--font-family", this.options.fontFamily);
      this.stage.style.setProperty("--btn-bg", this.options.btnBg);
      this.stage.style.setProperty("--btn-bg-hot", this.options.btnBgHot);
      this.stage.style.setProperty("--btn-bg-press", this.options.btnBgPress);
      if (this.options.borderColor !== undefined) {
        this.stage.style.setProperty("--btn-border", this.options.borderColor);
      }
      if (this.options.padding !== undefined) {
        this.stage.style.setProperty("--btn-padding", this.options.padding);
      }
      if (this.options.paddingX !== undefined) {
        const pxVal = typeof this.options.paddingX === "number" ? `${this.options.paddingX}px` : this.options.paddingX;
        this.stage.style.setProperty("--btn-padding-x", pxVal);
      }
      if (this.options.width !== undefined) {
        const wVal = typeof this.options.width === "number" ? `${this.options.width}px` : this.options.width;
        this.stage.style.setProperty("--btn-width", wVal);
      }
      if (this.options.fontSize !== undefined) {
        const fsVal = typeof this.options.fontSize === "number" ? `${this.options.fontSize}px` : this.options.fontSize;
        this.stage.style.setProperty("--font-size", fsVal);
      }
      if (this.options.fontWeight !== undefined) {
        this.stage.style.setProperty("--font-weight", String(this.options.fontWeight));
      }
      if (this.options.gap !== undefined) {
        const gVal = typeof this.options.gap === "number" ? `${this.options.gap}px` : this.options.gap;
        this.stage.style.setProperty("--btn-gap", gVal);
      }
      if (this.options.disabled !== undefined) {
        this.btn.disabled = !!this.options.disabled;
        this.stage.classList.toggle("disabled", !!this.options.disabled);
      }
      if (this.options.shadowMultiplier !== undefined) {
        this.stage.style.setProperty(
          "--shadow-mult",
          this.options.shadowMultiplier,
        );
      }
    }
    if (newOptions.content !== undefined) {
      this.setContent(newOptions.content);
    } else if (newOptions.text !== undefined) {
      this.setContent(newOptions.text);
    }
  }

  setContent(content) {
    if (!this.label) return;
    const slot = this.label.querySelector("slot");
    if (slot) {
      if (typeof content === "string") {
        slot.textContent = content;
      }
      return;
    }
    if (content === null || content === undefined) {
      this.label.textContent = "";
    } else if (typeof content === "string") {
      if (content.includes("<") && content.includes(">")) {
        this.label.innerHTML = content;
      } else {
        this.label.textContent = content;
      }
    } else if (content instanceof Node) {
      this.label.replaceChildren(content);
    } else if (Array.isArray(content)) {
      this.label.replaceChildren(...content);
    }
  }

  initDOM() {
    this.stage = document.createElement("div");
    this.stage.className = "liquid-button-wrapper";

    const style = document.createElement("style");
    style.textContent = LIQUID_BUTTON_CSS;
    this.stage.appendChild(style);

    this.plate = document.createElement("div");
    this.plate.className = "liquid-button-plate";
    this.plate.setAttribute("aria-hidden", "true");

    this.cv = document.createElement("canvas");
    this.cv.className = "liquid-button-canvas";

    this.btn = document.createElement("button");
    this.btn.className = "liquid-button-btn";
    this.btn.type = "button";

    this.label = document.createElement("span");
    this.label.className = "liquid-button-label";

    const isShadow = (typeof ShadowRoot !== "undefined" && this.container instanceof ShadowRoot) || this.options.useSlot;
    if (isShadow) {
      const slot = document.createElement("slot");
      slot.textContent = this.options.text || "Sign up";
      this.label.appendChild(slot);
    } else {
      this.setContent(this.options.content !== undefined ? this.options.content : this.options.text);
    }

    this.btn.appendChild(this.label);

    this.stage.appendChild(this.plate);
    this.stage.appendChild(this.cv);
    this.stage.appendChild(this.btn);
    this.container.appendChild(this.stage);

    this.updateOptions(this.options);
  }

  destroy() {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.container && this.stage) this.container.removeChild(this.stage);
  }

  initGL() {
    const self = this;
    const gl = this.cv.getContext("webgl2", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: true,
      powerPreference: "high-performance",
    });
    if (!gl) {
      console.warn("WebGL2 is required for Liquid Metal Button");
      return;
    }
    this.gl = gl;

    function hexToRgb(hex) {
      if (!hex) return [1, 1, 1];
      hex = hex.replace("#", "");
      if (hex.length === 3)
        hex = hex
          .split("")
          .map((c) => c + c)
          .join("");
      const bigint = parseInt(hex, 16);
      return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255,
      ];
    }

    // We alias local variables to make the existing logic work smoothly
    const cv = this.cv;
    const stage = this.stage;
    const btn = this.btn;
    const plate = this.plate;
    let requestAnimationFrame = window.requestAnimationFrame.bind(window);

    function sh(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(s) + "\n" + src);
      return s;
    }
    function prog(fs) {
      const p = gl.createProgram();
      gl.attachShader(p, sh(gl.VERTEX_SHADER, VERT));
      gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, "position");
      gl.linkProgram(p);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS))
        throw new Error(gl.getProgramInfoLog(p));
      const u = {};
      const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) {
        const info = gl.getActiveUniform(p, i);
        u[info.name.replace("[0]", "")] = gl.getUniformLocation(p, info.name);
      }
      return { p, u };
    }
    const pScene = prog(FRAG_SCENE),
      pRim = prog(FRAG_RIM),
      pDown = prog(FRAG_DOWN),
      pBlur = prog(FRAG_BLUR),
      pComp = prog(FRAG_COMP);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW,
    );
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const hasFloat = !!gl.getExtension("EXT_color_buffer_half_float");
    function makeTarget() {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        tex,
        0,
      );
      return { tex, fbo, w: 0, h: 0 };
    }
    function sizeTarget(t, w, h) {
      if (t.w === w && t.h === h) return;
      t.w = w;
      t.h = h;
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      if (hasFloat)
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA16F,
          w,
          h,
          0,
          gl.RGBA,
          gl.HALF_FLOAT,
          null,
        );
      else
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA8,
          w,
          h,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          null,
        );
    }
    const T_core = makeTarget(),
      T_rim = makeTarget(), // full res
      T_s1 = makeTarget(),
      T_s2 = makeTarget(), // half res: metal softening
      T_a = makeTarget(),
      T_b = makeTarget(); // 1/DOWN: bloom

    let W = 0,
      H = 0,
      DPR = 1,
      BW = 0,
      BH = 0,
      CX = 0,
      CY = 0;
    // The bloom buffer is downsampled to keep the button ~129 texels tall at any
    // size, so one set of blur radii gives a glow of the same *relative* extent
    // whether this renders at 52px or as a hero.
    let DOWN = 4;
    const GLOW_TEX = 129;
    let needResize = true;

    function resize() {
      const r = stage.getBoundingClientRect();
      const br = btn.getBoundingClientRect();
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(2, Math.round(r.width * DPR));
      const h = Math.max(2, Math.round(r.height * DPR));
      if (w !== W || h !== H) {
        W = w;
        H = h;
        cv.width = W;
        cv.height = H;
      }
      BW = br.width * DPR;
      BH = br.height * DPR;
      CX = (br.left - r.left) * DPR + BW / 2;
      CY = H - ((br.top - r.top) * DPR + BH / 2); // gl_FragCoord is y-up
      sizeTarget(T_core, W, H);
      sizeTarget(T_rim, W, H);
      const hw = Math.max(2, Math.ceil(W / 2)),
        hh = Math.max(2, Math.ceil(H / 2));
      sizeTarget(T_s1, hw, hh);
      sizeTarget(T_s2, hw, hh);
      DOWN = Math.max(1, Math.min(4, Math.round(BH / GLOW_TEX)));
      const dw = Math.max(2, Math.ceil(W / DOWN)),
        dh = Math.max(2, Math.ceil(H / DOWN));
      sizeTarget(T_a, dw, dh);
      sizeTarget(T_b, dw, dh);
      needResize = false;
    }
    self.resizeObserver = new ResizeObserver(() => {
      needResize = true;
    }).observe(stage);

    function drawTo(t) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, t ? t.fbo : null);
      gl.viewport(0, 0, t ? t.w : W, t ? t.h : H);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const uArr = new Float32Array(PKEYS.length);
    const eArr = new Float32Array(EKEYS.length);
    let hover = 0,
      hoverTarget = 0,
      clock = 0,
      last = performance.now();

    // three ripple slots, reused round-robin so rapid taps overlap
    const RIP = [0, 1, 2].map(() => ({ x: 0, y: 0, t: -99, on: 0 }));
    const ripArr = new Float32Array(12);
    let ripNext = 0,
      press = 0,
      pressTarget = 0;

    // the cursor well: a target the metal chases, plus how fast it is being moved
    const ptr = { x: 0, y: 0 },
      ptrS = { x: 0, y: 0 };
    let ptrAmt = 0,
      ptrSpeed = 0;

    function addRipple(x, y) {
      const r = RIP[ripNext];
      ripNext = (ripNext + 1) % RIP.length;
      r.x = x;
      r.y = y;
      r.t = clock;
      r.on = 1;
    }
    // pointer position -> button-height units from the pill centre, +y down
    function localPt(e) {
      const b = btn.getBoundingClientRect(),
        s = b.height;
      return [
        (e.clientX - (b.left + b.width / 2)) / s,
        (e.clientY - (b.top + b.height / 2)) / s,
      ];
    }

    const calm = matchMedia("(prefers-reduced-motion: reduce)");
    let drawn = null; // signature of the last frame actually drawn

    function frame(now) {
      const dtRaw = (now - last) / 1000;
      last = now;
      const dt = Math.min(dtRaw, 1 / 20);
      if (!calm.matches) clock += dt;

      // asymmetric ease: quick to bloom, a touch quicker to die
      const k =
        hoverTarget > hover
          ? 1 - Math.pow(0.0012, dt)
          : 1 - Math.pow(0.00012, dt);
      hover += (hoverTarget - hover) * k;
      if (Math.abs(hoverTarget - hover) < 0.0008) hover = hoverTarget;

      // press snaps on and lets go slowly
      const pk =
        pressTarget > press ? 1 - Math.pow(1e-9, dt) : 1 - Math.pow(0.004, dt);
      press += (pressTarget - press) * pk;
      if (Math.abs(pressTarget - press) < 0.002) press = pressTarget;

      for (let i = 0; i < RIP.length; i++) {
        const r = RIP[i];
        if (r.on && clock - r.t > 4) r.on = 0;
        ripArr[i * 4] = r.x;
        ripArr[i * 4 + 1] = r.y;
        ripArr[i * 4 + 2] = r.t;
        ripArr[i * 4 + 3] = r.on;
      }
      const ripLive = RIP.some((r) => r.on);

      // the well trails the cursor and swells with how fast it is being dragged
      const lag = 1 - Math.pow(R.ptrLag, dt);
      const dx = (ptr.x - ptrS.x) * lag,
        dy = (ptr.y - ptrS.y) * lag;
      ptrS.x += dx;
      ptrS.y += dy;
      const inst = Math.min(
        Math.hypot(dx, dy) / Math.max(dt, 1e-3) / R.ptrVref,
        1,
      );
      ptrSpeed +=
        (inst - ptrSpeed) * (1 - Math.pow(inst > ptrSpeed ? 0.001 : 0.02, dt));
      const wantWell = on.over || on.press ? 1 : 0;
      ptrAmt += (wantWell - ptrAmt) * (1 - Math.pow(0.004, dt));
      if (Math.abs(wantWell - ptrAmt) < 0.002) ptrAmt = wantWell;

      if (needResize) resize();

      // The rim keeps travelling even at rest, so the only truly static case is
      // reduced motion with nothing in flight.
      const sig =
        calm.matches && !ripLive && ptrAmt < 0.002
          ? `${hover}|${press}|${W}|${H}`
          : null;
      if (sig !== null && sig === drawn) {
        self.animationId = requestAnimationFrame(frame);
        return;
      }
      drawn = sig;

      for (let i = 0; i < uArr.length; i++) uArr[i] = P[PKEYS[i]];
      for (let i = 0; i < eArr.length; i++) eArr[i] = E[EKEYS[i]];
      const bw = Math.max(1.5, 3.2 * (BH / 516)); // stroke half-width, device px

      let rad = parseFloat(self.options.borderRadius);
      let radiusDevicePx;
      if (
        isNaN(rad) ||
        String(self.options.borderRadius).includes("999") ||
        rad >= BH / (2 * DPR)
      ) {
        radiusDevicePx = BH / 2;
      } else {
        radiusDevicePx = Math.min(Math.max(rad * DPR, 0), BH / 2);
      }

      // 1. metal + travelling rim, masked to the pill
      gl.useProgram(pScene.p);
      gl.uniform2f(pScene.u.uC, CX, CY);
      gl.uniform2f(pScene.u.uHalf, BW / 2, BH / 2);
      gl.uniform1f(pScene.u.uRadius, radiusDevicePx);
      gl.uniform1f(pScene.u.uT, clock);
      gl.uniform1f(pScene.u.uHover, hover);
      gl.uniform1f(pScene.u.uPress, press);
      gl.uniform3fv(pScene.u.uFluid1, hexToRgb(self.options.fluidColor1));
      gl.uniform3fv(pScene.u.uFluid2, hexToRgb(self.options.fluidColor2));
      gl.uniform3fv(pScene.u.uRippleColor, hexToRgb(self.options.rippleColor));
      gl.uniform4fv(pScene.u.uRip, ripArr);
      gl.uniform4f(pScene.u.uRipK, R.speed, R.width, R.decay, R.amp);
      gl.uniform4f(pScene.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
      gl.uniform4f(pScene.u.uPtr, ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
      gl.uniform4f(pScene.u.uPtrK, R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
      gl.uniform1fv(pScene.u.uP, uArr);
      drawTo(T_core);

      // 2. rim, kept out of the softening blur so the outline stays razor thin
      gl.useProgram(pRim.p);
      gl.uniform2f(pRim.u.uC, CX, CY);
      gl.uniform2f(pRim.u.uHalf, BW / 2, BH / 2);
      gl.uniform1f(pRim.u.uRadius, radiusDevicePx);
      gl.uniform1f(pRim.u.uT, clock);
      gl.uniform3fv(pRim.u.uRimColor, hexToRgb(self.options.rimColor));
      gl.uniform1f(pRim.u.uBw, bw);
      gl.uniform1f(pRim.u.uPress, press);
      gl.uniform4fv(pRim.u.uRip, ripArr);
      gl.uniform4f(pRim.u.uRipK, R.speed, R.width, R.decay, R.amp);
      gl.uniform4f(pRim.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
      gl.uniform4f(pRim.u.uPtr, ptrS.x, ptrS.y, ptrAmt, ptrSpeed);
      gl.uniform4f(pRim.u.uPtrK, R.ptrRad, R.ptrAmp, R.ptrFast, R.ptrRim);
      gl.uniform1fv(pRim.u.uE, eArr);
      drawTo(T_rim);

      // 3. soften the metal — half-res box down, then a separable gaussian.  This
      //    is what turns the prismatic ribbons molten rather than etched.
      gl.useProgram(pDown.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, T_core.tex);
      gl.uniform1i(pDown.u.uTex, 0);
      gl.uniform1f(pDown.u.uAdd, 0);
      gl.uniform2f(pDown.u.uDstTexel, 1 / T_s1.w, 1 / T_s1.h);
      gl.uniform2f(pDown.u.uSrcTexel, 1 / W, 1 / H);
      drawTo(T_s1);

      gl.useProgram(pBlur.p);
      gl.uniform1i(pBlur.u.uTex, 0);
      gl.uniform2f(pBlur.u.uTexel, 1 / T_s1.w, 1 / T_s1.h);
      // Target sigma in half-res texels, tied to the button so it scales with any
      // size.  One very wide 9-tap pass leaves visible comb ghosts — the taps end
      // up further apart than the sigma they are meant to describe — so the blur
      // is split into passes whose radii add in quadrature.
      const sigTex = C.soften * (BH * 0.5) * 0.95;
      if (sigTex > 0.1) {
        const iters = Math.min(4, Math.max(1, Math.ceil(sigTex / 3.0)));
        gl.uniform1f(pBlur.u.uR, sigTex / Math.sqrt(iters) / 1.95);
        for (let i = 0; i < iters; i++) {
          gl.bindTexture(gl.TEXTURE_2D, T_s1.tex);
          gl.uniform2f(pBlur.u.uDir, 1, 0);
          drawTo(T_s2);
          gl.bindTexture(gl.TEXTURE_2D, T_s2.tex);
          gl.uniform2f(pBlur.u.uDir, 0, 1);
          drawTo(T_s1);
        }
      }

      // 4. bloom, fed by the softened metal plus the crisp rim
      gl.useProgram(pDown.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, T_s1.tex);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, T_rim.tex);
      gl.uniform1i(pDown.u.uTex, 0);
      gl.uniform1i(pDown.u.uTex2, 1);
      gl.uniform1f(pDown.u.uAdd, 1);
      gl.uniform2f(pDown.u.uDstTexel, 1 / T_a.w, 1 / T_a.h);
      gl.uniform2f(pDown.u.uSrcTexel, 1 / T_s1.w, 1 / T_s1.h);
      drawTo(T_a);

      gl.useProgram(pBlur.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform1i(pBlur.u.uTex, 0);
      gl.uniform2f(pBlur.u.uTexel, 1 / T_a.w, 1 / T_a.h);
      const rs = (C.glowR * (BH / DOWN)) / GLOW_TEX;
      for (const r of [1.0, 2.3, 5.2, 9.0].map((v) => v * rs)) {
        gl.uniform1f(pBlur.u.uR, r);
        gl.bindTexture(gl.TEXTURE_2D, T_a.tex);
        gl.uniform2f(pBlur.u.uDir, 1, 0);
        drawTo(T_b);
        gl.bindTexture(gl.TEXTURE_2D, T_b.tex);
        gl.uniform2f(pBlur.u.uDir, 0, 1);
        drawTo(T_a);
      }

      // 5. composite
      gl.useProgram(pComp.p);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, T_s1.tex);
      gl.uniform1i(pComp.u.uSoft, 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, T_rim.tex);
      gl.uniform1i(pComp.u.uRim, 1);
      gl.activeTexture(gl.TEXTURE2);
      gl.bindTexture(gl.TEXTURE_2D, T_a.tex);
      gl.uniform1i(pComp.u.uGlow, 2);
      gl.uniform2f(pComp.u.uRes, W, H);
      gl.uniform2f(pComp.u.uC, CX, CY);
      gl.uniform2f(pComp.u.uHalf, BW / 2, BH / 2);
      gl.uniform1f(pComp.u.uRadius, radiusDevicePx);
      gl.uniform1f(pComp.u.uT, clock);
      gl.uniform4fv(pComp.u.uRip, ripArr);
      gl.uniform4f(pComp.u.uRipK, R.speed, R.width, R.decay, R.amp);
      gl.uniform4f(pComp.u.uRipK2, R.facet, R.lobes, R.sharp, R.emit);
      gl.uniform1f(pComp.u.uGlowGain, C.glow);
      gl.uniform1f(pComp.u.uGlowIn, C.glowIn);
      gl.uniform1f(pComp.u.uOccl, C.occl);
      gl.uniform1f(pComp.u.uDim, P.dim);
      gl.uniform1f(pComp.u.uPunch, C.punch);
      drawTo(null);

      self.animationId = requestAnimationFrame(frame);
    }

    /* ---------------- interaction ----------------
   Hover, press and focus all light the metal; press additionally throws a
   ripple from wherever it landed.  Works for mouse, touch and keyboard. */
    const on = { over: false, press: false, focus: false };
    const sync = () => {
      hoverTarget = on.over || on.press || on.focus ? 1 : 0;
      pressTarget = on.press ? 1 : 0;
      stage.classList.toggle("hot", hoverTarget > 0.5);
      stage.classList.toggle("press", on.press);
    };

    btn.addEventListener("pointerenter", (e) => {
      if (e.pointerType !== "mouse") return;
      // land the well where the cursor actually entered, not where it last was
      [ptr.x, ptr.y] = localPt(e);
      ptrS.x = ptr.x;
      ptrS.y = ptr.y;
      ptrSpeed = 0;
      on.over = true;
      sync();
    });
    btn.addEventListener("pointerleave", (e) => {
      if (e.pointerType === "mouse") {
        on.over = false;
        sync();
      }
    });

    // the cursor drags the metal; tracked on the window so a press can slide off
    // the button, but only measured while the button is actually engaged
    window.addEventListener(
      "pointermove",
      (e) => {
        if (!on.over && !on.press) return;
        [ptr.x, ptr.y] = localPt(e);
      },
      { passive: true },
    );

    btn.addEventListener("pointerdown", (e) => {
      [ptr.x, ptr.y] = localPt(e);
      on.press = true;
      sync();
      addRipple(ptr.x, ptr.y);
    });
    window.addEventListener("pointerup", () => {
      on.press = false;
      sync();
    });
    window.addEventListener("pointercancel", () => {
      on.press = false;
      sync();
    });
    // only keyboard focus keeps it lit — a mouse click shouldn't leave the button
    // glowing after the pointer has moved away
    btn.addEventListener("focus", () => {
      on.focus = btn.matches(":focus-visible");
      sync();
    });
    btn.addEventListener("blur", () => {
      on.focus = false;
      sync();
    });

    // keyboard activation gets the same treatment, rippling from the centre
    btn.addEventListener("keydown", (e) => {
      if ((e.key !== "Enter" && e.key !== " ") || e.repeat) return;
      on.press = true;
      sync();
      addRipple(0, 0);
    });
    btn.addEventListener("keyup", (e) => {
      if (e.key !== "Enter" && e.key !== " ") return;
      on.press = false;
      sync();
    });

    resize();
    self.animationId = requestAnimationFrame(frame);
  }
}
