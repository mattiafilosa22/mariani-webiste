#!/usr/bin/env bash
# Rebuild + deploy del frontend statico sul sito di test Pantheon.
# Builda l'export dai contenuti WordPress (API Pantheon, dietro Basic Auth) e
# lo pubblica nella webroot Pantheon via git. Lanciare dopo aver modificato
# contenuti in wp-admin per vederli sul sito statico.
#
# Uso:  ./scripts/deploy-pantheon.sh
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
# Carica la config locale NON tracciata (contiene il segreto basic-auth).
# Copia scripts/.pantheon.env.example in scripts/.pantheon.env e compilalo.
# shellcheck disable=SC1091
[ -f "$SCRIPT_DIR/.pantheon.env" ] && source "$SCRIPT_DIR/.pantheon.env"
cd "$SCRIPT_DIR/.."

# --- Config (ambiente di test) ---
# URL non segreti: hanno un default. Il SEGRETO (basic auth) va fornito via env/file.
BASE_URL="${PANTHEON_SITE_URL:-https://dev-mariani-test-webiste.pantheonsite.io}"
BASIC_AUTH="${PANTHEON_BASIC_AUTH:?Imposta PANTHEON_BASIC_AUTH (formato utente:password), es. in scripts/.pantheon.env}"
PANTHEON_GIT_URL="${PANTHEON_GIT_URL:-ssh://codeserver.dev.4114d6cb-50a9-4be9-b29b-252616815dd6@codeserver.dev.4114d6cb-50a9-4be9-b29b-252616815dd6.drush.in:2222/~/repository.git}"
SSH_KEY="${PANTHEON_SSH_KEY_FILE:-$HOME/.ssh/pantheon_deploy}"
# accept-new: registra la host key al primo uso e la verifica alle successive
# connessioni (protezione MITM dopo il primo contatto), invece di accettarne
# ciecamente una qualsiasi ogni volta (StrictHostKeyChecking=no).
export GIT_SSH_COMMAND="ssh -p 2222 -o StrictHostKeyChecking=accept-new -i $SSH_KEY"

echo "▸ Build export dai contenuti Pantheon ..."
( cd web && \
  WP_API_URL="$BASE_URL/wp-json/mariani/v1" \
  WP_API_BASIC_AUTH="$BASIC_AUTH" \
  NEXT_PUBLIC_WP_API_URL="/wp-json/mariani/v1" \
  NEXT_PUBLIC_SITE_URL="$BASE_URL" \
  npm run build )

echo "▸ Pubblico su Pantheon (git) ..."
rm -rf /tmp/ptn-deploy
git clone --quiet "$PANTHEON_GIT_URL" /tmp/ptn-deploy
cd /tmp/ptn-deploy
# Rimuovo i vecchi artefatti dell'export (NON i file WordPress)
rm -rf _next it en hero img leaflet
rm -f index.html 404.html sitemap.xml robots.txt llms.txt llms-full.txt \
      og-default.png logo-mariani.png placeholder-car.svg favicon.ico \
      next.svg vercel.svg file.svg globe.svg window.svg
cp -R "$OLDPWD/web/out/." .
git -c user.name="Mariani Deploy" -c user.email="deploy@mariani.local" add -A
if git diff --cached --quiet; then
  echo "  Nessuna modifica da pubblicare."
else
  git -c user.name="Mariani Deploy" -c user.email="deploy@mariani.local" commit -q -m "Rebuild frontend statico"
  git push --quiet origin HEAD:master
  echo "  ✅ Frontend aggiornato su $BASE_URL"
fi
