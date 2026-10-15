#!/usr/bin/env bash
# Synthesize UI sound effects for the showcase video with ffmpeg (deterministic, local).
set -e
cd "$(dirname "$0")"
mkdir -p audio
F="ffmpeg -y -loglevel error"

# click: short filtered noise burst, tight decay
$F -f lavfi -i "anoisesrc=d=0.06:c=pink:a=0.9" \
  -af "highpass=f=1800,lowpass=f=7000,volume=1.2,afade=t=in:d=0.004,afade=t=out:st=0.015:d=0.045" \
  audio/click.wav

# click-soft: quieter, warmer tap for corner pins
$F -f lavfi -i "anoisesrc=d=0.05:c=pink:a=0.6" \
  -af "highpass=f=900,lowpass=f=4500,afade=t=in:d=0.004,afade=t=out:st=0.012:d=0.038" \
  audio/click-soft.wav

# pop: tiny sine blip for toggles/typing
$F -f lavfi -i "sine=frequency=880:duration=0.07" \
  -af "afade=t=in:d=0.005,afade=t=out:st=0.02:d=0.05,volume=0.5" \
  audio/pop.wav

# whoosh-in: noise sweep with rising band + fade (scene transitions)
$F -f lavfi -i "anoisesrc=d=0.7:c=brown:a=0.8" \
  -af "lowpass=f=900,highpass=f=120,volume=1.1,afade=t=in:d=0.35,afade=t=out:st=0.45:d=0.25" \
  audio/whoosh.wav

# swoosh-short: quick 0.25s transition tick between close states
$F -f lavfi -i "anoisesrc=d=0.25:c=brown:a=0.7" \
  -af "lowpass=f=1400,highpass=f=200,afade=t=in:d=0.1,afade=t=out:st=0.13:d=0.12" \
  audio/swoosh-short.wav

# success: two-note marimba-ish hit for results reveal
$F -f lavfi -i "sine=frequency=523.25:duration=0.5" -f lavfi -i "sine=frequency=784:duration=0.6" \
  -filter_complex "[0][1]amix=inputs=2:duration=longest,adelay=0|180,afade=t=in:d=0.01,afade=t=out:st=0.35:d=0.25,volume=0.45" \
  audio/success.wav

# ambient bed: warm pad — detuned sines + slow LFO, very quiet under SFX across full video
$F -f lavfi -i "sine=frequency=110:duration=49" \
   -f lavfi -i "sine=frequency=164.81:duration=49" \
   -f lavfi -i "sine=frequency=220:duration=49" \
   -f lavfi -i "anoisesrc=d=49:c=brown:a=0.05" \
  -filter_complex "[0][1][2][3]amix=inputs=4:duration=longest,tremolo=f=0.15:d=0.35,lowpass=f=520,volume=0.16,afade=t=in:d=2,afade=t=out:st=44:d=5" \
  audio/bed.wav

ls -la audio/
