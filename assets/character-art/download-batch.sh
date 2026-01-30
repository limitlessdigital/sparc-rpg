#!/bin/bash
# Batch download ArtStation art
# Uses API to get image URLs

download_art() {
  local id=$1
  local name=$2
  echo "Downloading $name ($id)..."
  
  # Fetch the artwork page to get the image URL
  local page=$(curl -s "https://www.artstation.com/artwork/$id")
  
  # Extract image URL from page (look for 4k or large)
  local img_url=$(echo "$page" | grep -oE 'https://cdn[ab]\.artstation\.com/p/assets/images/images/[0-9]+/[0-9]+/[0-9]+/(4k|large)/[^"]+\.(jpg|png|webp)' | head -1)
  
  if [ -n "$img_url" ]; then
    local ext="${img_url##*.}"
    ext="${ext%%\?*}"  # Remove query string
    curl -sL -o "${name}.${ext}" "$img_url"
    echo "  ✓ Downloaded ${name}.${ext}"
  else
    echo "  ✗ Could not find image for $id"
  fi
}

# Download in parallel (5 at a time)
export -f download_art
