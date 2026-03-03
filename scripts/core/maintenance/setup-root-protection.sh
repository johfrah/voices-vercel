#!/bin/bash
# Setup Root Protection - Installeert automatische bescherming (Voices Headless 2026)
# 
# Doel: Installeert git hooks voor automatische root cleanup
# Gebruik: bash 3-CURSOR-ONLY/scripts/core/maintenance/setup-root-protection.sh

echo "🛡️  Root Protection Setup (Voices Headless 2026)"
echo "=============================================="
echo ""

# Bepaal de root directory (4 niveaus omhoog vanaf scripts/core/maintenance/)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../../../../" && pwd)"
GIT_HOOKS_DIR="$ROOT_DIR/.git/hooks"

# 1. Git pre-commit hook
echo "1️⃣  Git pre-commit hook installeren..."
if [ -d "$GIT_HOOKS_DIR" ]; then
    cat > "$GIT_HOOKS_DIR/pre-commit" << 'HOOK_EOF'
#!/bin/bash
# Nuclear Root Protection Hook
ROOT_DIR="$(git rev-parse --show-toplevel)"
VALIDATOR="$ROOT_DIR/3-CURSOR-ONLY/scripts/core/maintenance/validate-root-clean.php"

if [ -f "$VALIDATOR" ]; then
    php "$VALIDATOR" || {
        echo ""
        echo "❌ COMMIT GEBLOKKEERD: Je root directory is niet Nuclear Clean!"
        echo "💡 OPLOSSING: Verplaats verboden bestanden naar 1, 2, 3 of 4."
        echo "   Run handmatig: php 3-CURSOR-ONLY/scripts/core/maintenance/validate-root-clean.php"
        exit 1
    }
fi
exit 0
HOOK_EOF
    chmod +x "$GIT_HOOKS_DIR/pre-commit"
    echo "   ✅ Pre-commit hook geïnstalleerd in $GIT_HOOKS_DIR"
else
    echo "   ⚠️  .git directory niet gevonden!"
    exit 1
fi

# 2. Test validator
echo ""
echo "2️⃣  Validator testen..."
php "$ROOT_DIR/3-CURSOR-ONLY/scripts/core/maintenance/validate-root-clean.php"
VALIDATOR_EXIT=$?

if [ $VALIDATOR_EXIT -eq 0 ]; then
    echo "   ✅ Validator bevestigt: Root is Nuclear Clean!"
else
    echo "   ⚠️  Validator vond problemen - los deze eerst op!"
fi

echo ""
echo "✅ Setup voltooid! Je project is nu beschermd."
echo ""
