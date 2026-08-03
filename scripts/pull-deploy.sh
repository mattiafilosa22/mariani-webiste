#!/bin/bash
#
# Deploy in "pull": il server scarica l'export statico pubblicato da GitHub
# Actions e lo installa nella document root.
#
# Perche in pull e non in push: il firewall di VHosting blocca in modo
# intermittente le connessioni SSH in ingresso dai runner GitHub, facendo
# fallire rsync. Qui e il server a uscire verso GitHub, quindi il problema non
# si pone. Va eseguito da un'attivita pianificata (vedi docs/deploy-setup.md).
#
# Idempotente: se il pacchetto non e cambiato non tocca nulla.

set -euo pipefail

REPO="${MARIANI_REPO:-mattiafilosa22/mariani-webiste}"
TAG="${MARIANI_RELEASE_TAG:-site-latest}"
TARGET="${MARIANI_TARGET:-$HOME/preview.mariani-auto.it}"
STATE_DIR="${MARIANI_STATE_DIR:-$HOME/.mariani-deploy}"
LOG="${MARIANI_LOG:-$STATE_DIR/pull-deploy.log}"

# Configurazione locale opzionale: token GitHub (se il repo diventa privato) e
# credenziali Cloudflare per il purge. File non versionato, permessi 600.
CONF="$HOME/.mariani-deploy.conf"
# shellcheck source=/dev/null
[ -f "$CONF" ] && . "$CONF"

BASE="https://github.com/${REPO}/releases/download/${TAG}"
mkdir -p "$STATE_DIR"

log() {
	printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$1" >> "$LOG"
}

# Una sola esecuzione per volta: le attivita pianificate possono sovrapporsi
# se un deploy e piu lento dell'intervallo.
exec 9> "$STATE_DIR/lock"
if ! flock -n 9; then
	log "già in esecuzione, esco"
	exit 0
fi

auth_header=()
[ -n "${GITHUB_TOKEN:-}" ] && auth_header=(-H "Authorization: Bearer ${GITHUB_TOKEN}")

# 1. L'impronta del pacchetto pubblicato. Poche centinaia di byte: si puo
#    interrogare spesso senza scaricare 20 MB ogni volta.
remote_sha=$(curl -fsSL --max-time 30 "${auth_header[@]}" "${BASE}/site.tar.gz.sha256" 2>/dev/null | tr -d '[:space:]') || {
	log "ERRORE: impossibile leggere l'impronta del pacchetto"
	exit 1
}

if [ -z "$remote_sha" ]; then
	log "ERRORE: impronta remota vuota"
	exit 1
fi

local_sha=$(cat "$STATE_DIR/current.sha256" 2>/dev/null || echo "")

if [ "$remote_sha" = "$local_sha" ]; then
	exit 0
fi

prev="${local_sha:-nessuno}"
log "nuovo pacchetto: ${remote_sha:0:12} (precedente: ${prev:0:12})"

# 2. Scarico e verifico l'integrità PRIMA di toccare la document root.
work=$(mktemp -d "$STATE_DIR/work.XXXXXX")
trap 'rm -rf "$work"' EXIT

curl -fsSL --max-time 300 "${auth_header[@]}" -o "$work/site.tar.gz" "${BASE}/site.tar.gz" || {
	log "ERRORE: download fallito"
	exit 1
}

actual_sha=$(sha256sum "$work/site.tar.gz" | cut -d' ' -f1)
if [ "$actual_sha" != "$remote_sha" ]; then
	log "ERRORE: impronta non corrispondente (attesa $remote_sha, ottenuta $actual_sha)"
	exit 1
fi

mkdir -p "$work/out"
tar -xzf "$work/site.tar.gz" -C "$work/out"

# Sanita minima: senza le due home il pacchetto e rotto e non va installato.
if [ ! -f "$work/out/it/index.html" ] || [ ! -f "$work/out/en/index.html" ]; then
	log "ERRORE: pacchetto incompleto, installazione annullata"
	exit 1
fi

# 3. Installazione. --delete allinea la document root all'export; le esclusioni
#    proteggono cio che non nasce dalla build: challenge ACME e protezione
#    directory.
rsync -a --delete \
	--exclude='.well-known' \
	--exclude='.htaccess' \
	--exclude='.htpasswd' \
	"$work/out/" "$TARGET/"

echo "$remote_sha" > "$STATE_DIR/current.sha256"
log "installato in $TARGET ($(find "$TARGET" -type f | wc -l) file)"

# 4. Purge della cache Cloudflare, ora che il sito servito e quello nuovo.
if [ -n "${CF_ZONE_ID:-}" ] && [ -n "${CF_API_TOKEN:-}" ]; then
	code=$(curl -sS -o /dev/null -w '%{http_code}' --max-time 30 -X POST \
		"https://api.cloudflare.com/client/v4/zones/${CF_ZONE_ID}/purge_cache" \
		-H "Authorization: Bearer ${CF_API_TOKEN}" \
		-H "Content-Type: application/json" \
		--data '{"purge_everything":true}')
	log "purge Cloudflare: HTTP $code"
fi

# 5. Log limitato: e un file su un hosting condiviso, non deve crescere senza fine.
tail -n 500 "$LOG" > "$LOG.tmp" && mv "$LOG.tmp" "$LOG"
