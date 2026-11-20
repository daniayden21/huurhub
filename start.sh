#!/bin/sh
# Start Huurhub. Eerste keer: installeert de benodigdheden.
cd "$(dirname "$0")"
if [ ! -x .venv/bin/python ]; then
  python3 -m venv .venv && .venv/bin/pip install -q -r requirements.txt && .venv/bin/playwright install chromium-headless-shell
fi
( sleep 3; open http://localhost:8765/ ) &
exec .venv/bin/python -u server.py
