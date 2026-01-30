#!/bin/bash
# Download all art from ArtStation
# Requires curl

OUTPUT_DIR="$(dirname "$0")"
cd "$OUTPUT_DIR"

# Function to download single artwork
download() {
  local id=$1
  local name=$2
  
  if [ -f "${name}.webp" ] || [ -f "${name}.jpg" ]; then
    echo "✓ ${name} already exists, skipping"
    return
  fi
  
  echo "Downloading ${name} ($id)..."
  
  # Get the page and extract image URL
  local page=$(curl -sL "https://www.artstation.com/artwork/$id" 2>/dev/null)
  
  # Look for 4k image first, then large
  local img_url=$(echo "$page" | grep -oE 'https://cdn[ab]\.artstation\.com/p/assets/images/images/[0-9]+/[0-9]+/[0-9]+/4k/[^"]+\.(jpg|webp|png)' | head -1)
  
  if [ -z "$img_url" ]; then
    img_url=$(echo "$page" | grep -oE 'https://cdn[ab]\.artstation\.com/p/assets/images/images/[0-9]+/[0-9]+/[0-9]+/large/[^"]+\.(jpg|webp|png)' | head -1)
  fi
  
  if [ -n "$img_url" ]; then
    # Clean URL (remove query string for extension detection)
    local ext="${img_url##*.}"
    ext="${ext%%\?*}"
    curl -sL -o "${name}.${ext}" "$img_url"
    echo "  ✓ Downloaded ${name}.${ext}"
  else
    echo "  ✗ Could not find image for $id"
  fi
  
  # Small delay to be nice to their servers
  sleep 0.3
}

# Download first batch (3-12)
download "5Wqr5O" "03-heritage-power"
download "GvNA0a" "04-witch-november"  
download "vbqy5x" "05-conqueror"
download "qJnZby" "06-angel-demon"
download "zxR3vd" "07-sea-princess"
download "eRWymY" "08-scouts"
download "XJbKbL" "09-angry-queen"
download "L4Ee1r" "10-bow"
download "Bky0k8" "11-snake-lady"
download "4NaxY2" "12-viviketh-warriors"

echo ""
echo "Downloaded 10 of 50"
