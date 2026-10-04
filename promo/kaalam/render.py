"""KAALAM — a 46-second cinematic teaser for the Telugu Panchangam new-tab extension.

Three AI stills (ElevenLabs / Seedream), two motion-graphic dials drawn from the app's own
tithi/nakshatra tables, and a screenshot of the real extension, animated here into film:
virtual camera moves, flame flicker, rising embers, a dawn that breaks over the gopuram,
light-flash transitions, bloom, grain, vignette and a 2.39:1 letterbox.

usage: python3 render.py [start_frame end_frame out.mp4]   (no args = render all in 4 workers)
"""
import math, os, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
A = lambda n: os.path.join(HERE, 'assets', n)
W, H, FPS, DUR = 1920, 1080, 24, 46.0
NFRAMES = int(DUR * FPS)
BAR = 138  # 2.39:1 letterbox

# ---------- helpers ----------
def load(p, mode='RGB'):
    """Open an image at p and convert it to the requested Pillow color mode."""
    return Image.open(p).convert(mode)
def f32(im):
    """Convert an 8-bit image to a float32 array with values in [0, 1]."""
    return np.asarray(im, dtype=np.float32) / 255.0
def clamp01(x):
    """Clamp a scalar to the inclusive interval [0, 1]."""
    return min(1.0, max(0.0, x))
def ramp(t, a, b):
    """Map t from [a, b] to [0, 1], using a step at a when b <= a."""
    return clamp01((t - a) / (b - a)) if b > a else float(t >= a)
def smooth(x):
    """Apply cubic smoothstep to x after clamping it to [0, 1]."""
    x = clamp01(x); return x * x * (3 - 2 * x)
def ease_io(x):
    """Apply cosine ease-in/ease-out to x clamped to [0, 1]."""
    x = clamp01(x); return 0.5 - 0.5 * math.cos(math.pi * x)
def ease_out(x):
    """Apply cubic ease-out to x clamped to [0, 1]."""
    x = clamp01(x); return 1 - (1 - x) ** 3
def lerp(a, b, x):
    """Linearly interpolate from a to b using the unclamped factor x."""
    return a + (b - a) * x
def window(t, a, b, fi=0.6, fo=0.6):
    """Return a smooth fade envelope over [a, b] with fade lengths fi and fo."""
    return smooth(ramp(t, a, a + fi)) * (1 - smooth(ramp(t, b - fo, b)))

def camera(img, s, cx, cy):
    """Virtual camera on a still: zoom s (1 = fill frame width), centre (cx, cy) normalised."""
    sw, sh = img.size
    k = (sw / W) / s
    hx, hy = k * W / 2, k * H / 2
    x0 = min(max(cx * sw, hx), sw - hx) - hx
    y0 = min(max(cy * sh, hy), sh - hy) - hy
    return img.transform((W, H), Image.AFFINE, (k, 0, x0, 0, k, y0), resample=Image.BICUBIC)

def rot_scale(img, theta_deg, s, ox, oy, squash=1.0):
    """Place a square RGBA dial at (ox, oy), rotated clockwise by theta, scaled s, y-squashed."""
    th = math.radians(theta_deg); c, si = math.cos(th), math.sin(th)
    sw, sh = img.size
    a, b = c / s, si / (s * squash)
    d, e = -si / s, c / (s * squash)
    return img.transform((W, H), Image.AFFINE,
                         (a, b, sw / 2 - (a * ox + b * oy), d, e, sh / 2 - (d * ox + e * oy)),
                         resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0))

def persp_coeffs(dst, src):
    """Solve Pillow perspective coefficients mapping four dst points to src points."""
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y]); m.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    return np.linalg.solve(np.array(m, float), np.array(src, float).reshape(8)).tolist()

def over(base, rgba, opacity=1.0, x=0, y=0):
    """Alpha-composite an RGBA float layer onto base at (x, y), clipped."""
    if opacity <= 0.001: return
    h, w = rgba.shape[:2]
    x0, y0, x1, y1 = max(x, 0), max(y, 0), min(x + w, W), min(y + h, H)
    if x1 <= x0 or y1 <= y0: return
    l = rgba[y0 - y:y1 - y, x0 - x:x1 - x]
    a = l[..., 3:4] * opacity
    base[y0:y1, x0:x1] = base[y0:y1, x0:x1] * (1 - a) + l[..., :3] * a

def screen(base, rgb, opacity=1.0):
    """Screen-blend rgb onto base in place, scaling the layer by opacity."""
    base[:] = 1 - (1 - base) * (1 - np.clip(rgb * opacity, 0, 1))

# ---------- assets ----------
DIYA = load(os.path.join(HERE, 'src', 'diya.jpg'))
GOP = load(os.path.join(HERE, 'src', 'gopuram.jpg'))
GOD = load(os.path.join(HERE, 'src', 'godavari.jpg'))
UI = load(os.path.join(HERE, 'src', 'ui.png'), 'RGBA')
_m = Image.new('L', UI.size, 0); ImageDraw.Draw(_m).rounded_rectangle([0, 0, UI.size[0] - 1, UI.size[1] - 1], 48, fill=255)
UI.putalpha(_m)
WHEEL, WHEEL_HI = load(A('tithi_wheel.png'), 'RGBA'), load(A('tithi_wheel_hi.png'), 'RGBA')
RING, RING_HI = load(A('nak_ring.png'), 'RGBA'), load(A('nak_ring_hi.png'), 'RGBA')
TXT = {n: f32(load(A(n + '.png'), 'RGBA')) for n in
       ['title_kaalam', 'tithi_center', 'chapter_tithi', 'chapter_nak', 'nak_today', 'endcard', 'endcard_cta']
       + ['sub_%d' % i for i in range(1, 8)]}
SANK = f32(load(A('sankalpam.png'), 'RGBA'))
_tc = load(A('tithi_center.png'), 'RGBA'); TXT['tithi_center'] = f32(_tc.resize((int(_tc.width * 0.56), int(_tc.height * 0.56)), Image.LANCZOS))
NAK = [load(A('nak/%d.png' % k), 'RGBA') for k in range(27)]
NAK_HI = load(A('nak/6_hi.png'), 'RGBA')

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
VIGNETTE = (1 - 0.42 * (((xx - W / 2) / (W * 0.62)) ** 2 + ((yy - H / 2) / (H * 0.78)) ** 2)).clip(0.35, 1)[..., None]
rng = np.random.default_rng(7)
GRAIN = [rng.normal(0, 1, (H // 2, W // 2)).astype(np.float32) for _ in range(6)]

def radial(cx, cy, r, color, power=2.0):
    """Return a full-frame RGB glow centered at (cx, cy) with radius r in pixels."""
    g = np.exp(-(((xx - cx) ** 2 + (yy - cy) ** 2) / (r * r)) ** (power / 2))
    return g[..., None] * np.array(color, np.float32)

def flare(cx, cy, k):
    """Anamorphic light flash: hot core + long horizontal streak, saffron-gold."""
    if k <= 0.002: return 0
    core = np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * 260 ** 2))
    streak = np.exp(-((yy - cy) / 9) ** 2) * np.exp(-np.abs(xx - cx) / 700)
    wash = np.exp(-((xx - cx) ** 2 + (yy - cy) ** 2) / (2 * 900 ** 2))
    return (core[..., None] * np.array([1.0, 0.8, 0.5]) + streak[..., None] * np.array([1.0, 0.62, 0.25]) * 1.4
            + wash[..., None] * np.array([1.0, 0.55, 0.2]) * 0.6) * k

# soft particle sprites
def sprite(r):
    """Return a float32 Gaussian particle mask with standard deviation r pixels."""
    n = int(r * 4) | 1; c = n // 2
    g = np.exp(-(((np.arange(n) - c)[:, None]) ** 2 + ((np.arange(n) - c)[None, :]) ** 2) / (2 * r * r))
    return g.astype(np.float32)
SPRITES = [sprite(r) for r in (1.2, 2.0, 3.2, 6.0, 10.0)]
def add_sprite(buf, x, y, si, col, k):
    """Add the tinted SPRITES[si] to buf in place at (x, y), clipped to the frame."""
    sp = SPRITES[si]; n = sp.shape[0]; x0, y0 = int(x) - n // 2, int(y) - n // 2
    xa, ya, xb, yb = max(x0, 0), max(y0, 0), min(x0 + n, W), min(y0 + n, H)
    if xb <= xa or yb <= ya: return
    buf[ya:yb, xa:xb] += sp[ya - y0:yb - y0, xa - x0:xb - x0, None] * (np.array(col, np.float32) * k)

prng = np.random.default_rng(11)
EMBERS = [dict(x0=prng.uniform(-60, 60), sp=prng.uniform(40, 120), ph=prng.uniform(0, 7), sw=prng.uniform(10, 50),
               w=prng.uniform(0.8, 2.2), life=prng.uniform(2.5, 5), off=prng.uniform(0, 5), si=int(prng.integers(0, 3))) for _ in range(34)]
MOTES = [dict(x=prng.uniform(0, W), y=prng.uniform(0, H), vx=prng.uniform(-12, 12), vy=prng.uniform(-22, -4),
              ph=prng.uniform(0, 7), si=int(prng.integers(1, 5)), k=prng.uniform(0.05, 0.22)) for _ in range(46)]

def embers(buf, t, ox, oy, k):
    """Add rising ember particles to buf at time t in seconds, with intensity k."""
    for e in EMBERS:
        age = (t + e['off']) % e['life']
        x = ox + e['x0'] + e['sw'] * math.sin(e['w'] * t + e['ph'])
        y = oy - e['sp'] * age
        fade = math.sin(math.pi * age / e['life']) * (0.6 + 0.4 * math.sin(9 * t + e['ph']))
        add_sprite(buf, x, y, e['si'], (1.0, 0.55, 0.15), 0.9 * k * max(fade, 0))

def motes(buf, t, k, col=(1.0, 0.75, 0.35)):
    """Add drifting, twinkling motes to buf at time t in seconds, tinted by col."""
    for m in MOTES:
        x = (m['x'] + m['vx'] * t) % W
        y = (m['y'] + m['vy'] * t) % H
        tw = 0.65 + 0.35 * math.sin(1.7 * t + m['ph'])
        add_sprite(buf, x, y, m['si'], col, m['k'] * tw * k)

# ---------- shots (each returns an RGB float frame) ----------
FLAME = (0.664, 0.585)  # flame position in the diya still (normalised)

def shot_diya(t):
    """Return an RGB float frame of the diya and embers at timeline time t in seconds."""
    u = ease_io(ramp(t, 2.0, 9.4))
    s, cx, cy = lerp(1.0, 1.22, u), lerp(0.56, 0.63, u), lerp(0.55, 0.57, u)
    f = f32(camera(DIYA, s, cx, cy))
    k = (DIYA.size[0] / W) / s  # where the flame lands on screen
    x0 = min(max(cx * DIYA.size[0], k * W / 2), DIYA.size[0] - k * W / 2) - k * W / 2
    y0 = min(max(cy * DIYA.size[1], k * H / 2), DIYA.size[1] - k * H / 2) - k * H / 2
    fx, fy = (FLAME[0] * DIYA.size[0] - x0) / k, (FLAME[1] * DIYA.size[1] - y0) / k
    flick = 1 + 0.06 * math.sin(13 * t) * math.sin(5.3 * t + 1) + 0.03 * math.sin(31 * t)
    f *= flick
    f += radial(fx, fy + 30, 420 * s, (0.30, 0.13, 0.03)) * (flick - 0.9) * 2.2
    buf = np.zeros_like(f); embers(buf, t, fx, fy - 40, ramp(t, 3.0, 4.5)); f += buf
    return f

MOON = (0.508, 0.226)
def shot_gopuram(t):
    """Return an RGB float frame of the moon and gopuram at timeline time t in seconds."""
    u = ease_io(ramp(t, 7.4, 14.4))
    s = lerp(1.75, 1.06, u)
    cx, cy = lerp(MOON[0], 0.5, u), lerp(MOON[1] + 0.06, 0.5, u)
    f = f32(camera(GOP, s, cx, cy))
    f *= np.array([0.96, 1.0, 1.06], np.float32)  # keep the night cool
    return f

def wheel_bg():
    """Return the dim, blurred gopuram background for the tithi wheel as RGB floats."""
    b = camera(GOP, 1.9, 0.5, 0.2).filter(ImageFilter.GaussianBlur(14))
    return f32(b) * np.array([0.32, 0.30, 0.30], np.float32)
WHEEL_BG = None
def shot_wheel(t):
    """Return an RGB float frame of the tithi dial at timeline time t in seconds."""
    global WHEEL_BG
    if WHEEL_BG is None: WHEEL_BG = wheel_bg()
    f = WHEEL_BG.copy()
    f += radial(W / 2, H / 2, 520, (0.16, 0.08, 0.02))
    u = ease_out(ramp(t, 13.6, 20.6))
    s = lerp(0.66, 0.37, u)
    theta = lerp(62, -12, u)  # ends with today's tithi at 6 o'clock, labels upright
    w = f32(rot_scale(WHEEL, theta, s, W / 2, H / 2 + 4))
    over(f, w, 0.95)
    hi = ramp(t, 16.4, 17.2) * (0.75 + 0.25 * math.sin(4 * t))
    if hi > 0:
        wh = f32(rot_scale(WHEEL_HI, theta, s, W / 2, H / 2 + 4)); over(f, wh, hi)
    c = TXT['tithi_center']; over(f, c, smooth(ramp(t, 17.0, 18.0)), W // 2 - c.shape[1] // 2, H // 2 - c.shape[0] // 2 + 4)
    ch = TXT['chapter_tithi']; over(f, ch, window(t, 14.6, 21.2, 0.8, 0.6), 120, BAR + 24)
    buf = np.zeros_like(f); motes(buf, t, 0.7); f += buf
    return f

def shot_godavari(t):
    """Return an RGB float frame of the nakshatra carousel at timeline time t in seconds."""
    u = ease_io(ramp(t, 20.2, 28.4))
    f = f32(camera(GOD, lerp(1.06, 1.2, u), lerp(0.47, 0.53, u), lerp(0.46, 0.52, u)))
    ring_k = window(t, 21.0, 28.6, 1.6, 0.8)
    hk = ramp(t, 23.8, 24.8) * ring_k
    phi0 = 10 + 5.0 * (t - 25.6)
    screen(f, ELLIPSE, ring_k * 0.9)
    items = []
    for k in range(27):
        ph = math.radians(phi0 + k * 360 / 27)
        d = (math.sin(ph) + 1) / 2
        items.append((d, k, CX_R + RX * math.cos(ph), CY_R + RY * math.sin(ph)))
    for d, k, x, y in sorted(items):
        sc = 0.36 + 0.46 * d
        im = NAK[k]; w, h = int(im.width * sc), int(im.height * sc)
        spr = f32(im.resize((w, h), Image.BILINEAR))
        a = ring_k * (0.18 + 0.82 * d ** 1.5) * (1 - hk if k == 6 else 1)
        over(f, spr, a, int(x - w / 2), int(y - 35 * sc))
        if k == 6 and hk > 0:
            hi = NAK_HI; w2, h2 = int(hi.width * sc), int(hi.height * sc)
            over(f, f32(hi.resize((w2, h2), Image.BILINEAR)), hk * (0.4 + 0.6 * d), int(x - w2 / 2), int(y - 38 * sc))
    nt = TXT['nak_today']; over(f, nt, window(t, 24.6, 28.4, 0.8, 0.6), W // 2 - nt.shape[1] // 2, BAR + 30)
    ch = TXT['chapter_nak']; over(f, ch, window(t, 21.4, 28.4, 0.8, 0.6), 120, BAR + 24)
    return f

CX_R, CY_R, RX, RY = 960, 520, 900, 225
_el = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(_el).ellipse([CX_R - RX, CY_R - RY, CX_R + RX, CY_R + RY], outline=(170, 205, 255, 255), width=2)
_el = f32(_el.filter(ImageFilter.GaussianBlur(1.2)))
ELLIPSE = _el[..., :3] * _el[..., 3:4] * np.clip((yy - CY_R) / RY * 0.5 + 0.55, 0.15, 1)[..., None]
GOP_X = 0.505
def shot_dawn(t):
    """Return an RGB float frame of dawn and Sankalpam at timeline time t in seconds."""
    u = ease_io(ramp(t, 27.2, 34.0))
    s, cx, cy = lerp(1.02, 1.12, u), 0.5, lerp(0.55, 0.5, u)
    f = f32(camera(GOP, s, cx, cy))
    lum = f.mean(axis=2, keepdims=True)
    sky = np.clip((lum - 0.07) / 0.2, 0, 1)
    d = ease_io(ramp(t, 27.4, 33.4))
    warm = f * np.array([1.35, 0.92, 0.62], np.float32)
    f = f * (1 - d * 0.85) + warm * d * 0.85
    k = (GOP.size[0] / W) / s
    gx = (GOP_X * GOP.size[0] - (cx * GOP.size[0] - k * W / 2)) / k
    gy0 = (0.80 * GOP.size[1] - (min(max(cy * GOP.size[1], k * H / 2), GOP.size[1] - k * H / 2) - k * H / 2)) / k
    gy = gy0 - 140 * d
    glow = radial(gx, gy, 520 + 260 * d, (1.0, 0.52, 0.16), 1.6) * (0.25 + 0.95 * d)
    f += glow * sky
    sk_y = int(BAR + 40 - (t - 27.2) * 46)
    lay = np.zeros((H, W, 4), np.float32); over(lay[..., :3], SANK, 1.0, 0, sk_y)
    a = np.zeros((H, W, 1), np.float32)
    hh = SANK.shape[0]; y0, y1 = max(sk_y, 0), min(sk_y + hh, H)
    if y1 > y0: a[y0:y1] = SANK[y0 - sk_y:y1 - sk_y, :W, 3:4]
    screen(f, lay[..., :3] * a * sky, 0.22 * window(t, 27.6, 34.0, 1.2, 1.0))
    return f

UI_BG = None
def ui_bg():
    """Return the warm, blurred backdrop for the UI reveal as RGB floats."""
    b = camera(GOP, 1.3, 0.5, 0.55).filter(ImageFilter.GaussianBlur(22))
    f = f32(b) * np.array([0.55, 0.30, 0.14], np.float32)
    return f + radial(W / 2, H / 2 + 60, 900, (0.10, 0.04, 0.0))

UI_FOCUS = (0.484, 0.255)
def ui_transform(t):
    """Return UI corner points, scale, center x/y, and tilt in radians at time t in seconds."""
    a = ease_out(ramp(t, 33.0, 35.8))
    p = ease_io(ramp(t, 35.6, 40.8))
    sc = lerp(lerp(0.62, 0.80, a), 1.30, p)
    phi = math.radians(lerp(24, 0, a))
    fx, fy = lerp(0.5, UI_FOCUS[0], p), lerp(0.5, UI_FOCUS[1], p)
    sx, sy = 960, lerp(lerp(600, 540, a), 515, p)
    cx, cy = sx - (fx - 0.5) * W * sc, sy - (fy - 0.5) * H * sc
    hw, hh = W * sc / 2, H * sc / 2 * math.cos(phi)
    kt, kb = 1 - 0.32 * math.sin(phi), 1 + 0.08 * math.sin(phi)
    dst = [(cx - hw * kt, cy - hh), (cx + hw * kt, cy - hh), (cx + hw * kb, cy + hh), (cx - hw * kb, cy + hh)]
    return dst, sc, cx, cy, phi

def shot_ui(t):
    """Return an RGB float frame of the UI reveal at timeline time t in seconds."""
    global UI_BG
    if UI_BG is None: UI_BG = ui_bg()
    f = UI_BG.copy()
    dst, sc, cx, cy, phi = ui_transform(t)
    sw, sh = UI.size
    coeffs = persp_coeffs(dst, [(0, 0), (sw, 0), (sw, sh), (0, sh)])
    # screen glow behind the panel
    xs, ys = [p[0] for p in dst], [p[1] for p in dst]
    gl = radial((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, (max(xs) - min(xs)) * 0.62, (0.55, 0.22, 0.03), 4)
    f += gl * 0.55
    ui = f32(UI.transform((W, H), Image.PERSPECTIVE, coeffs, resample=Image.BICUBIC, fillcolor=(0, 0, 0, 0)))
    over(f, ui, smooth(ramp(t, 33.15, 33.9)))
    # the payoff: ring the very tithi and nakshatra the dials just showed
    for (u0, v0, u1, v1), (a0, a1) in (((0.2635, 0.194, 0.4815, 0.302), (37.4, 41.2)), ((0.492, 0.194, 0.710, 0.302), (38.3, 41.2))):
        k = window(t, a0, a1, 0.5, 0.6) * (0.8 + 0.2 * math.sin(6 * t))
        if k <= 0: continue
        X0, Y0 = cx + (u0 - 0.5) * W * sc, cy + (v0 - 0.5) * H * sc
        X1, Y1 = cx + (u1 - 0.5) * W * sc, cy + (v1 - 0.5) * H * sc
        lay = Image.new('RGBA', (W, H), (0, 0, 0, 0))
        ImageDraw.Draw(lay).rounded_rectangle([X0 - 6, Y0 - 6, X1 + 6, Y1 + 6], int(18 * sc + 6), outline=(255, 150, 40, 255), width=4)
        g = f32(lay.filter(ImageFilter.GaussianBlur(10)))
        screen(f, g[..., :3] * g[..., 3:4], 1.6 * k)
        g2 = f32(lay); over(f, g2, k)
    buf = np.zeros_like(f); motes(buf, t, 0.8); f += buf
    return f

def shot_end(t):
    """Return an RGB float frame of the end card at timeline time t in seconds."""
    f = np.zeros((H, W, 3), np.float32) + np.array([0.03, 0.02, 0.015], np.float32)
    f += radial(W / 2, H / 2 - 40, 760, (0.20, 0.08, 0.015))
    e = TXT['endcard']
    s = lerp(1.06, 1.0, ease_out(ramp(t, 40.6, 46.0)))
    if abs(s - 1) > 1e-3:
        im = Image.fromarray((e * 255).astype(np.uint8), 'RGBA')
        im = im.resize((int(W * s), int(H * s)), Image.BICUBIC)
        e = f32(im); over(f, e, 1.0, (W - e.shape[1]) // 2, (H - e.shape[0]) // 2)
    else:
        over(f, e, 1.0)
    cta = TXT['endcard_cta']; over(f, cta, smooth(ramp(t, 43.2, 44.2)), 0, H - BAR - 130)
    buf = np.zeros_like(f); motes(buf, t, 1.0); embers(buf, t, W / 2, H - BAR + 10, 0.5); f += buf
    return f

# timeline: (shot, in, out) — overlaps are cross-dissolves
SHOTS = [(shot_diya, 2.0, 8.6), (shot_gopuram, 7.4, 14.2), (shot_wheel, 13.7, 21.4),
         (shot_godavari, 20.2, 28.4), (shot_dawn, 27.2, 33.6), (shot_ui, 33.0, 41.4), (shot_end, 40.6, 46.0)]
FADES = {shot_diya: (1.8, 1.2), shot_gopuram: (1.2, 0.5), shot_wheel: (0.4, 1.2), shot_godavari: (1.2, 1.2),
         shot_dawn: (1.2, 0.6), shot_ui: (0.6, 0.8), shot_end: (0.8, 1.0)}
SUBS = [(6.0, 9.6), (10.6, 11.9), (22.2, 25.0), (28.4, 32.8), (34.4, 37.8), (41.8, 43.2), (43.3, 45.2)]

def frame(i):
    """Compose frame index i with transitions, grading, and subtitles as uint8 RGB."""
    t = i / FPS
    f = np.zeros((H, W, 3), np.float32)
    total = 0.0
    for fn, a, b in SHOTS:
        if a <= t <= b:
            fi, fo = FADES[fn]
            w = window(t, a, b, fi, fo) if fn is not shot_wheel else smooth(ramp(t, a, a + fi)) * (1 - smooth(ramp(t, b - fo, b)))
            if fn is shot_end and t > 45.0: w *= 1 - smooth(ramp(t, 45.0, 46.0))
            if w > 0.001:
                f += fn(t) * w; total += w
    # title card over black
    tk = window(t, 0.4, 3.2, 1.0, 0.9)
    if tk > 0:
        T = TXT['title_kaalam']
        s = 1 + 0.035 * ramp(t, 0.4, 3.2)
        im = Image.fromarray((T * 255).astype(np.uint8), 'RGBA').resize((int(W * s), int(H * s)), Image.BICUBIC)
        T = f32(im); over(f, T, tk, (W - T.shape[1]) // 2, (H - T.shape[0]) // 2)
    # light-flash transitions on the two big music hits, and a soft one into dawn
    f += flare(W / 2, H / 2, 1.3 * math.exp(-((t - 13.85) / 0.22) ** 2))
    f += flare(W / 2, H * 0.47, 1.5 * math.exp(-((t - 33.05) / 0.25) ** 2))
    f += flare(W * 0.5, H * 0.75, 0.5 * math.exp(-((t - 27.6) / 0.35) ** 2))
    # bloom
    small = Image.fromarray((np.clip(f, 0, 1) * 255).astype(np.uint8)).resize((W // 4, H // 4), Image.BILINEAR)
    sm = f32(small); sm = np.clip(sm - 0.55, 0, 1) * 2.2
    bl = Image.fromarray((np.clip(sm, 0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(9)).resize((W, H), Image.BILINEAR)
    f += f32(bl) * np.array([1.0, 0.8, 0.6], np.float32) * 0.42
    # grade: gentle filmic shoulder + warm highlights / cool shadows
    f = f / (1 + 0.22 * f)
    f = f * 1.12
    lum = f.mean(axis=2, keepdims=True)
    f += (lum - 0.35) * np.array([0.035, 0.0, -0.035], np.float32)
    f *= VIGNETTE
    # grain
    g = GRAIN[i % 6]
    g = np.repeat(np.repeat(np.roll(g, (i * 37) % 300, axis=(i % 2)), 2, 0), 2, 1)[..., None]
    f += g * 0.022 * (0.5 + 0.5 * np.sqrt(np.clip(lum, 0, 1)))
    # letterbox + subtitles in the lower bar
    f[:BAR] = 0; f[H - BAR:] = 0
    for k, (a, b) in enumerate(SUBS):
        sk = window(t, a, b, 0.25, 0.35)
        if sk > 0: over(f, TXT['sub_%d' % (k + 1)], sk * 0.92, 0, H - BAR + 6)
    return (np.clip(f, 0, 1) * 255 + 0.5).astype(np.uint8)

def render(a, b, out):
    """Encode frames [a, b) to out with ffmpeg, exiting on encoder failure."""
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS),
                          '-i', '-', '-c:v', 'libx264', '-preset', 'slow', '-crf', '15', '-pix_fmt', 'yuv420p', out], stdin=subprocess.PIPE)
    for i in range(a, b):
        p.stdin.write(frame(i).tobytes())
    p.stdin.close()
    if p.wait() != 0:
        sys.exit('ffmpeg failed for frames %d-%d' % (a, b))

if __name__ == '__main__':
    if len(sys.argv) == 4:
        render(int(sys.argv[1]), int(sys.argv[2]), sys.argv[3])
    elif len(sys.argv) == 3 and sys.argv[1] == 'still':
        Image.fromarray(frame(int(float(sys.argv[2]) * FPS))).save(os.path.join(HERE, 'still_%s.jpg' % sys.argv[2]), quality=88)
    else:
        n = 4; step = math.ceil(NFRAMES / n)
        procs = [subprocess.Popen([sys.executable, __file__, str(k * step), str(min(NFRAMES, (k + 1) * step)), os.path.join(HERE, f'part{k}.mp4')]) for k in range(n)]
        if any(p.wait() != 0 for p in procs):
            sys.exit('a render worker failed')
        with open(os.path.join(HERE, 'parts.txt'), 'w') as fh:
            fh.writelines(f"file 'part{k}.mp4'\n" for k in range(n))
        print('rendered', NFRAMES, 'frames')
