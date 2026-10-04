# Cinematic hits under the two big reveals: a reversed-cymbal style riser into a sub "boom".
import numpy as np, wave
sr, dur = 48000, 46.0
n = int(sr * dur); out = np.zeros((n, 2), np.float32)
rng = np.random.default_rng(3)
def hit(t0, gain):
    L = int(1.3 * sr); noise = rng.normal(0, 1, (L, 2)).astype(np.float32)
    for c in range(2): noise[:, c] = np.convolve(noise[:, c], np.ones(24) / 24, 'same') - np.convolve(noise[:, c], np.ones(400) / 400, 'same')
    s = int((t0 - 1.3) * sr); out[s:s + L] += noise * (np.linspace(0, 1, L) ** 3.2)[:, None] * 0.22 * gain
    L2 = int(3.0 * sr); t = np.arange(L2) / sr
    ph = 2 * np.pi * np.cumsum(32 + 34 * np.exp(-t * 3.5)) / sr
    boom = (np.sin(ph) + 0.35 * np.sin(2 * ph)) * np.exp(-t * 1.6) * (1 - np.exp(-t * 400))
    s2 = int(t0 * sr); out[s2:s2 + L2] += ((boom + rng.normal(0, 1, L2) * np.exp(-t * 60) * 0.25) * gain)[:, None]
hit(13.85, 0.55); hit(33.05, 0.7)
with wave.open('hits.wav', 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(sr); w.writeframes((np.clip(out, -1, 1) * 32767).astype('<i2').tobytes())
