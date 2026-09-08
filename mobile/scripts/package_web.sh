#!/usr/bin/env bash
# Builds the Expo web export and zips it for manual upload via cPanel File
# Manager. Run from anywhere; paths are resolved relative to this script.
#
#   npm run package:web
#
# Produces mobile/dist.zip. In cPanel File Manager: upload it into the
# target document root, right-click -> Extract, then delete the zip.
# index.html should end up directly in the document root, not nested in a
# subfolder - that's why we zip dist/'s *contents*, not the dist/ folder.
set -euo pipefail

cd "$(dirname "$0")/.."

npm run build:web

rm -f dist.zip
(cd dist && zip -rq ../dist.zip .)

echo "Packaged mobile/dist.zip ($(du -h dist.zip | cut -f1))"
