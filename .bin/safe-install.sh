#!/bin/bash
# 🛡️ VOICES DROPBOX PROTECTOR
# Draai dit script om node_modules te negeren in Dropbox en installatie-fouten te voorkomen.

echo "🚀 Optimaliseren van werkomgeving..."

# Ga naar de next-experience folder
cd "$(dirname "$0")/../next-experience"

# 1. Vertel Dropbox om node_modules te negeren (macOS specifieke vlag)
if [ -d "node_modules" ]; then
    echo "📦 node_modules gevonden, negeren voor Dropbox..."
    xattr -w com.dropbox.ignored 1 node_modules
else
    echo "📁 node_modules nog niet aanwezig, maken en negeren..."
    mkdir node_modules
    xattr -w com.dropbox.ignored 1 node_modules
fi

echo "✅ Dropbox negeert nu node_modules."
echo "💡 Je kunt nu veilig 'npm install' draaien zonder file-locks."
