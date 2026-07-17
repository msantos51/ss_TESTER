"""Gera uma textura fotorrealista de oceano turquesa (vista aérea).

Técnica: fBm (soma de octavas de ruído suave) + domain warping para as
ondulações, ruído "ridged" fino para o brilho do sol, ripples direcionais
de vento, banda diagonal de luz e vinheta. Paleta amostrada do print.
Renderiza com margem extra e recorta, para evitar artefactos nas bordas.

Uso (a partir da raiz do repositório):
    pip install numpy pillow
    python scripts/generate_ocean_bg.py

Escreve sunny_sales_web/public/ocean-bg.webp (2400px) e
ocean-bg-mobile.webp (1200px).
"""
import numpy as np
from PIL import Image, ImageEnhance

rng = np.random.default_rng(51)
W, H = 2400, 1500
PAD = 96
RW, RH = W + PAD * 2, H + PAD * 2


def smooth_noise(w, h, cell_w, cell_h=None):
    """Ruído suave: grelha aleatória pequena reescalada com bicúbica."""
    if cell_h is None:
        cell_h = cell_w
    gw = max(2, int(round(w / cell_w)))
    gh = max(2, int(round(h / cell_h)))
    g = rng.random((gh, gw)).astype(np.float32)
    img = Image.fromarray(np.uint8(g * 255), 'L').resize((w, h), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def fbm(w, h, base_cell, octaves, gain=0.55, stretch_x=1.0):
    total = np.zeros((h, w), np.float32)
    amp, cell, norm = 1.0, float(base_cell), 0.0
    for _ in range(octaves):
        total += amp * smooth_noise(w, h, cell * stretch_x, cell)
        norm += amp
        amp *= gain
        cell = max(2.0, cell / 2.0)
    return total / norm


def bilinear_sample(field, xs, ys):
    h, w = field.shape
    xs = np.clip(xs, 0, w - 1.001)
    ys = np.clip(ys, 0, h - 1.001)
    x0 = xs.astype(np.int32); y0 = ys.astype(np.int32)
    fx = xs - x0; fy = ys - y0
    f00 = field[y0, x0]; f10 = field[y0, x0 + 1]
    f01 = field[y0 + 1, x0]; f11 = field[y0 + 1, x0 + 1]
    return (f00 * (1 - fx) * (1 - fy) + f10 * fx * (1 - fy)
            + f01 * (1 - fx) * fy + f11 * fx * fy)


yy, xx = np.mgrid[0:RH, 0:RW].astype(np.float32)

# Domain warp: coordenadas deformadas por dois campos de ruído
warp_x = (fbm(RW, RH, 460, 4) - 0.5) * 2.0
warp_y = (fbm(RW, RH, 460, 4) - 0.5) * 2.0

# Ondulação média (anisotrópica) + warp — superfície geral
base = fbm(RW, RH, 300, 6, gain=0.52, stretch_x=2.0)
waves = bilinear_sample(base, xx + warp_x * 70, yy + warp_y * 70)

# Profundidade: bandas largas escuras/claras (como no print)
depth = fbm(RW, RH, 1050, 3, gain=0.62)
depth = bilinear_sample(depth, xx + warp_x * 150, yy + warp_y * 150)

# Ripples de vento: ondulação fina anisotrópica, modulada por "zonas de
# vento" (envelope) para não formar linhas contínuas tipo metal escovado
rip = fbm(RW, RH, 56, 3, gain=0.5, stretch_x=3.4)
wind = fbm(RW, RH, 700, 2, gain=0.6)
ripple = rip * (0.35 + 0.65 * wind)

# Textura granular fina
fine = fbm(RW, RH, 14, 2, gain=0.5, stretch_x=1.6)

# Brilho do sol: speckle esparso (ridged com limiar alto, granulado)
mid = bilinear_sample(fbm(RW, RH, 48, 4, gain=0.5, stretch_x=2.4),
                      xx + warp_x * 40, yy + warp_y * 40)
ridge = 1.0 - np.abs(mid * 2.0 - 1.0)
glint = np.clip(ridge - 0.80, 0, None) / 0.20
glint = glint ** 3.0
# Granula os filamentos em pequenos brilhos individuais
speckle = np.clip((smooth_noise(RW, RH, 7) - 0.42) * 2.4, 0, 1)
glint *= speckle

# ── Composição tonal ────────────────────────────────────────
t = 0.36 * waves + 0.36 * depth + 0.19 * ripple + 0.09 * fine
t = (t - t.min()) / (t.max() - t.min())
# Curva suave: escurece médios ligeiramente (água mais densa)
t = t ** 1.18

# Feixes diagonais de luz (topo-esquerda → fundo, como no print)
d = (xx / RW) * 0.55 - (yy / RH) * 0.83
band = np.exp(-((d - 0.02) ** 2) / (2 * 0.15 ** 2))
band2 = np.exp(-((d + 0.34) ** 2) / (2 * 0.055 ** 2))
t = np.clip(t + band * 0.07 + band2 * 0.05, 0, 1)

# Gradiente vertical: fundo ligeiramente mais escuro (contraste do rodapé)
t = np.clip(t - (yy / RH) * 0.06, 0, 1)

# ── Paleta teal (amostrada do print) ────────────────────────
stops = np.array([
    [8, 62, 76],      # profundo
    [11, 82, 98],     # teal escuro
    [15, 105, 122],   # teal médio
    [22, 130, 147],   # turquesa
    [38, 156, 170],   # turquesa clara
    [82, 196, 205],   # zonas iluminadas
], dtype=np.float32)
pos = np.array([0.0, 0.24, 0.48, 0.70, 0.88, 1.0], dtype=np.float32)

r = np.interp(t, pos, stops[:, 0])
g = np.interp(t, pos, stops[:, 1])
b = np.interp(t, pos, stops[:, 2])
img = np.stack([r, g, b], axis=-1)

# Brilhos de sol quase brancos, subtis
foam = np.array([228, 248, 248], np.float32)
img += glint[..., None] * (foam - img) * 0.42

# Reforço suave dos feixes de luz
img += ((band * 14) + (band2 * 12))[..., None] * np.array([0.72, 1.0, 1.0], np.float32)

# Vinheta subtil (cantos mais escuros → contraste para texto branco)
cx, cy = RW / 2, RH / 2
dist = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
img *= (1.0 - 0.14 * np.clip(dist - 0.5, 0, None) ** 1.6)[..., None]

img = np.clip(img, 0, 255).astype(np.uint8)
out = Image.fromarray(img, 'RGB').crop((PAD, PAD, PAD + W, PAD + H))
out = ImageEnhance.Color(out).enhance(1.05)

OUT_DESKTOP = 'sunny_sales_web/public/ocean-bg.webp'
OUT_MOBILE = 'sunny_sales_web/public/ocean-bg-mobile.webp'
out.save(OUT_DESKTOP, quality=68, method=6)
out.resize((1200, 750), Image.LANCZOS).save(OUT_MOBILE, quality=68, method=6)
print('ok:', OUT_DESKTOP, 'e', OUT_MOBILE)
