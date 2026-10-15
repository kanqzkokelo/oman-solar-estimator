#!/usr/bin/env bash
# End-to-end Screen Studio-style showcase runner for Oman Rooftop Solar Estimator
set -eo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=== 1. Synthesizing UI SFX & Ambient Audio Bed ==="
bash make_sfx.sh

echo "=== 2. Validating HyperFrames Composition ==="
npx hyperframes check

echo "=== 3. Rendering Showcase MP4 (High Quality, 1080p) ==="
npx hyperframes render --quality high --output renders/video.mp4

echo "=== 4. Verifying Render Deliverable ==="
ffprobe -hide_banner renders/video.mp4

echo "=== Showcase Video Pipeline Ready: renders/video.mp4 ==="
