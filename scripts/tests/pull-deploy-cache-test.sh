#!/bin/bash

set -euo pipefail

script="$(cd "$(dirname "$0")/.." && pwd)/pull-deploy.sh"

count=$(grep -c 'cache_bust=' "$script" || true)
if [ "$count" -lt 2 ]; then
	echo "FAIL: hash e archivio devono usare un cache-buster (trovati: $count)." >&2
	exit 1
fi

echo "PASS: download release protetti dalla cache CDN."
