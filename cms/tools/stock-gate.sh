#!/bin/bash
# Comando forzato della chiave SSH di Jarvis (authorized_keys: command="…/stock-gate.sh",restrict).
# La chiave può fare solo questo: anteprima o import dello stock, col CSV su stdin. Niente shell,
# niente altri comandi: quello chiesto dal client arriva in SSH_ORIGINAL_COMMAND e si accetta
# solo «preview» o «apply». Prima di ogni apply c'è un backup del database (ne restano 10).
set -euo pipefail

readonly DIR="$(cd "$(dirname "$0")" && pwd)"
readonly WP=(/opt/plesk/php/8.4/bin/php /usr/local/bin/wp --path="$HOME/cms.mariani-auto.it")
readonly BACKUPS="$HOME/backups/stock"
readonly MAX_CSV_BYTES=200000

mode="${SSH_ORIGINAL_COMMAND:-}"
case "$mode" in
	preview | apply) ;;
	*)
		echo "comando non permesso: usare «preview» o «apply» col CSV su stdin" >&2
		exit 2
		;;
esac

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
head -c "$((MAX_CSV_BYTES + 1))" > "$work/stock.csv"
if [ "$(wc -c < "$work/stock.csv")" -gt "$MAX_CSV_BYTES" ]; then
	echo "CSV troppo grande (oltre $MAX_CSV_BYTES byte)" >&2
	exit 2
fi

if [ "$mode" = apply ]; then
	mkdir -p "$BACKUPS"
	backup="$BACKUPS/pre-stock-$(date +%Y%m%d-%H%M%S).sql"
	"${WP[@]}" db export "$backup" --quiet
	echo "BACKUP $backup"
	ls -1t "$BACKUPS"/pre-stock-*.sql | tail -n +11 | xargs -r rm -f
	"${WP[@]}" eval-file "$DIR/import-stock.php" "$work/stock.csv" apply
else
	"${WP[@]}" eval-file "$DIR/import-stock.php" "$work/stock.csv"
fi
