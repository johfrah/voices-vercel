<?php

/**
 * Root Clean Validator (Voices Headless Edition - 2026)
 *
 * Doel: Valideert dat de root directory alleen toegestane bestanden bevat
 * Cruciaal omdat: Voorkomt dat bestanden per ongeluk in root worden geplaatst
 *
 * Gebruik: php scripts/core/maintenance/validate-root-clean.php
 * Exit code: 0 = OK, 1 = Fouten gevonden
 */

$root = dirname(dirname(dirname(dirname(__DIR__))));
$errors = [];
$warnings = [];

// Toegestane bestanden in root (Voices Headless 2026)
$allowed_files = [
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'README.md',
    '.env.local',
];

// Systeembestanden die genegeerd moeten worden
$ignore_files = [
    '.DS_Store',
    '.gitignore',
    '.cursorignore',
    '.cursorrules',
    '.eslintrc.json',
    'Thumbs.db',
];

// Systeemdirectories die genegeerd moeten worden
$ignore_dirs = [
    '.',
    '..',
    '.git',
    '.vscode',
    '.cursor',
    '.local',
    '.cache',
    '.bin',
    '.webhosting',
    '.wp-cli',
    '.next',
    'node_modules',
];

// Toegestane directories in root (Monorepo Source of Truth)
$allowed_dirs = [
    'apps',
    'packages',
    'docs',
    'scripts',
    'test-results',
];

// Verboden patterns
$forbidden_patterns = [
    '*.md' => 'Markdown files moeten in docs/ staan (behalve expliciete root governance files)',
    '*.php' => 'PHP scripts moeten in scripts/ staan',
    '*.py' => 'Python scripts moeten in scripts/ staan',
    '*.sh' => 'Shell scripts moeten in scripts/ staan',
    '*.txt' => 'Tekstbestanden moeten in docs/ of docs/archive/ staan',
];

echo "🔍 Root Clean Validator (Voices Headless 2026)\n";
echo "===========================================\n\n";

// Scan root directory
$files = scandir($root);
$found_files = [];
$found_dirs = [];

foreach ($files as $item) {
    // Skip ignored files and directories
    if (in_array($item, $ignore_files) || in_array($item, $ignore_dirs)) {
        continue;
    }

    $path = $root . '/' . $item;

    if (is_file($path)) {
        $found_files[] = $item;

        // Check if file is allowed
        if (!in_array($item, $allowed_files)) {
            // Check forbidden patterns
            $forbidden = false;
            $reason = '';

            foreach ($forbidden_patterns as $pattern => $message) {
                if ($item === 'README.md') continue; // Uitzondering voor README
                if (fnmatch($pattern, $item)) {
                    $forbidden = true;
                    $reason = $message;
                    break;
                }
            }

            if ($forbidden) {
                $errors[] = "❌ {$item} - {$reason}";
            } else {
                $warnings[] = "⚠️  {$item} - Niet in toegestane lijst (controleer of dit correct is)";
            }
        }
    } elseif (is_dir($path)) {
        $found_dirs[] = $item;

        if (!in_array($item, $allowed_dirs)) {
            $errors[] = "❌ Directory {$item}/ - Niet toegestaan in root. Verplaats naar apps/, packages/, docs/ of scripts/.";
        }
    }
}

// Report results
if (empty($errors) && empty($warnings)) {
    echo "✅ Root directory is Nuclear Clean!\n";
    echo "\nToegestane structuur gevonden:\n";
    foreach ($found_dirs as $dir) {
        echo "  ✓ [DIR]  {$dir}/\n";
    }
    foreach ($found_files as $file) {
        echo "  ✓ [FILE] {$file}\n";
    }
    exit(0);
}

if (!empty($errors)) {
    echo "❌ FOUTEN GEVONDEN:\n\n";
    foreach ($errors as $error) {
        echo "  {$error}\n";
    }
    echo "\n";
}

if (!empty($warnings)) {
    echo "⚠️  WAARSCHUWINGEN:\n\n";
    foreach ($warnings as $warning) {
        echo "  {$warning}\n";
    }
    echo "\n";
}

if (!empty($errors)) {
    echo "💡 OPLOSSING:\n";
    echo "  - Verplaats MD/TXT files naar docs/ of docs/archive/\n";
    echo "  - Verplaats scripts naar scripts/\n";
    echo "  - Zorg dat alle mappen onder apps/, packages/, docs/ of scripts/ vallen\n";
    exit(1);
}

exit(0);