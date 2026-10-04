#!/usr/bin/env bash
# Rebuilds kaalam-teaser.mp4 from src/ and the store screenshot: text/dial layers, frames, audio mix, mux.
# Needs node + Playwright (Chromium), python3 with numpy + pillow, ffmpeg.
set -euo pipefail
cd "$(dirname "$0")"
node assets.cjs && node assets2.cjs && node assets3.cjs
python3 render.py
python3 hits.py
CUTS=(0 3.21 4.23 6.57 10.42 13.26 14.35 15.6); AT=(6000 10600 22200 28400 34400 41800 43300)
FC=""
for k in 0 1 2 3 4 5 6; do
  len=$(python3 -c "print(round(${CUTS[$((k+1))]}-${CUTS[$k]}-0.06,3))")
  FC+="[1:a]atrim=${CUTS[$k]}:${CUTS[$((k+1))]},asetpts=PTS-STARTPTS,aformat=sample_rates=48000:channel_layouts=stereo,afade=t=in:d=0.04,afade=t=out:st=${len}:d=0.06,atempo=0.93,adelay=${AT[$k]}|${AT[$k]}[v$k];"
done
FC+="[v0][v1][v2][v3][v4][v5][v6]amix=inputs=7:normalize=0,highpass=f=75,equalizer=f=180:t=q:w=1:g=2,acompressor=threshold=0.12:ratio=3:attack=5:release=120,aecho=0.85:0.9:45|95:0.16|0.09,volume=2.2,asplit[vo][vosc];"
FC+="[0:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.9[mus];[mus][vosc]sidechaincompress=threshold=0.04:ratio=5:attack=25:release=450[duck];"
FC+="[2:a]volume=1.0[hit];[duck][vo][hit]amix=inputs=3:normalize=0,afade=t=out:st=44.6:d=1.4,loudnorm=I=-15:TP=-1.5:LRA=11[out]"
ffmpeg -v error -y -i src/score.mp3 -i src/vo.mp3 -i hits.wav -filter_complex "$FC" -map "[out]" -ar 48000 -t 46 mix.wav
ffmpeg -v error -y -f concat -safe 0 -i parts.txt -i mix.wav -map 0:v -map 1:a -c:v libx264 -preset slow -crf 24 \
  -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart -t 46 kaalam-teaser.mp4
echo "wrote $(pwd)/kaalam-teaser.mp4"
