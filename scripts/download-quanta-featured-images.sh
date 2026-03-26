#!/usr/bin/env bash
# Downloads Quanta social/header (og:image) assets for selected articles on the homepage.
# Run from repo root: bash scripts/download-quanta-featured-images.sh

set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/images/featured"
mkdir -p "$DEST"

curl -fsSL -o "$DEST/quanta-lean-proof-assistant-2021.jpg" \
  "https://d2r55xnwy6nx47.cloudfront.net/uploads/2021/07/Liquid_Tensor_1200_Social.jpg"

curl -fsSL -o "$DEST/quanta-lean-library-2020.jpg" \
  "https://d2r55xnwy6nx47.cloudfront.net/uploads/2020/10/Lean_1200_social.jpg"

curl -fsSL -o "$DEST/quanta-imo-ai-2020.jpg" \
  "https://d2r55xnwy6nx47.cloudfront.net/uploads/2020/09/IMO_1200x630_Social.jpg"

LANDMARK_PAGE="https://www.quantamagazine.org/landmark-computer-science-proof-cascades-through-physics-and-math-20200304/"
OG=$(curl -fsSL "$LANDMARK_PAGE" | grep -o 'property="og:image" content="[^"]*"' | head -1 | sed 's/.*content="//;s/"$//')
if [[ -n "$OG" ]]; then
  curl -fsSL -o "$DEST/quanta-landmark-mip-2020.jpg" "$OG"
  printf '%s\n' "$OG" > "$DEST/landmark-og-image-url.txt"
  echo "Saved landmark article image from: $OG"
else
  echo "Could not find og:image for landmark article; skip fourth image." >&2
fi

echo "Done. Files in $DEST"
