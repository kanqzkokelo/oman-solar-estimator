#!/usr/bin/env bash
# Start the Oman Solar Estimator dev server and open it in the browser.
set -eo pipefail

APP_DIR="/home/mitesh/Downloads/oman-solar-estimator"
URL="http://localhost:3000"
LOG="$APP_DIR/.dev-server.log"
PID_FILE="$APP_DIR/.dev-server.pid"

# Load NVM / Node environment if not in PATH
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  \. "$NVM_DIR/nvm.sh"
fi

# Also check common Node installation paths
if ! command -v npm >/dev/null 2>&1; then
  for p in "$HOME"/.nvm/versions/node/*/bin "$HOME"/.local/bin /usr/local/bin; do
    if [ -x "$p/npm" ]; then
      export PATH="$p:$PATH"
      break
    fi
  done
fi

# Fallback: if npm is still not found, check ~/.bashrc
if ! command -v npm >/dev/null 2>&1 && [ -f "$HOME/.bashrc" ]; then
  source "$HOME/.bashrc" 2>/dev/null || true
fi

# If server is already running and responding, just open browser and exit
if curl -s -m 2 "$URL" >/dev/null 2>&1; then
  (xdg-open "$URL" >/dev/null 2>&1 &)
  exit 0
fi

cd "$APP_DIR"

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm command not found in PATH" > "$LOG"
  exit 1
fi

# Start dev server detached in its own session
nohup setsid npm run dev > "$LOG" 2>&1 < /dev/null &
SERVER_PID=$!
echo "$SERVER_PID" > "$PID_FILE"
disown "$SERVER_PID" 2>/dev/null || true

# Wait for server to become responsive (up to 30s)
for _ in $(seq 1 60); do
  if curl -s -m 2 "$URL" >/dev/null 2>&1; then
    break
  fi
  if ! kill -0 "$SERVER_PID" 2>/dev/null; then
    break
  fi
  sleep 0.5
done

# Open in browser
(xdg-open "$URL" >/dev/null 2>&1 &)
