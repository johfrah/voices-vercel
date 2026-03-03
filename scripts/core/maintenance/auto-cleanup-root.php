<?php

/**
 * Auto Cleanup Root - Automatische cleanup van verboden bestanden in root
 *
 * Doel: Detecteert en verplaatst automatisch bestanden die niet in root horen
 * Cruciaal omdat: Voorkomt dat root directory vervuilt raakt
 *
 * Gebruik: php scripts/auto-cleanup-root.php [--dry-run] [--auto-fix]
 *
 * --dry-run: Toon alleen wat er zou gebeuren (geen wijzigingen)
 * --auto-fix: Verplaats automatisch bestanden (standaard: alleen waarschuwing)
 */

$root = dirname(__DIR__);
$dry_run = in_array('--dry-run', $argv);
$auto_fix = in_array('--auto-fix', $argv);

$moved = [];
$errors = [];
$warnings = [];

// Toegestane bestanden in root
$allowed_files = [
    'functions.php',
    'style.css',
    'index.php',
    'page.php',
    'header.php',
    'footer.php',
    'sidebar.php',
    'composer.json',
    'composer.lock',
    'package.json',
    'package-lock.json',
    'translation-manager.js',
];

// Systeembestanden die genegeerd moeten worden
$ignore_files = [
    '.DS_Store',
    '.gitignore',
    '.cursorignore',
    '.cursorrules',
    'Thumbs.db',
];

// Mapping: pattern => [target_dir, description]
$cleanup_rules = [
    // MD files → documentation/
    '*.md' => ['documentation/', 'Markdown documentatie'],

    // PHP scripts → scripts/ (behalve theme templates)
    'reset-*.php' => ['scripts/', 'Cache reset script'],
    'check-*.php' => ['scripts/', 'Check script'],
    'deploy-*.php' => ['scripts/', 'Deploy script'],
    'test-*.php' => ['scripts/', 'Test script'],
    'setup-*.php' => ['scripts/', 'Setup script'],
    'update-*.php' => ['scripts/', 'Update script'],
    'generate-*.php' => ['scripts/', 'Generate script'],
    'find-*.php' => ['scripts/', 'Find script'],
    'list-*.php' => ['scripts/', 'List script'],
    'remove-*.php' => ['scripts/', 'Remove script'],
    'convert-*.php' => ['scripts/', 'Convert script'],
    'proactive-*.php' => ['scripts/', 'Proactive script'],
    'performance-*.php' => ['scripts/', 'Performance script'],

    // Python scripts → scripts/
    '*.py' => ['scripts/', 'Python script'],

    // Shell scripts → scripts/
    '*.sh' => ['scripts/', 'Shell script'],
    'post-*.sh' => ['scripts/', 'Post-deploy script'],
    'pre-*.sh' => ['scripts/', 'Pre-deploy script'],
    'deploy-*.sh' => ['scripts/', 'Deploy script'],
    'upload-*.sh' => ['scripts/', 'Upload script'],
    'test-*.sh' => ['scripts/', 'Test script'],
];

echo "🧹 Auto Cleanup Root\n";
echo "===================\n\n";

if ($dry_run) {
    echo "🔍 DRY RUN MODE - Geen wijzigingen worden gemaakt\n\n";
}

// Scan root directory
$files = scandir($root);

foreach ($files as $item) {
    // Skip ignored files
    if (in_array($item, $ignore_files) || $item === '.' || $item === '..' || is_dir($root . '/' . $item)) {
        continue;
    }

    // Skip allowed files
    if (in_array($item, $allowed_files)) {
        continue;
    }

    $file_path = $root . '/' . $item;

    // Check cleanup rules
    $matched = false;
    foreach ($cleanup_rules as $pattern => $target_info) {
        if (fnmatch($pattern, $item)) {
            $target_dir = $root . '/' . $target_info[0];
            $description = $target_info[1];
            $target_path = $target_dir . $item;

            // Check if target directory exists
            if (!is_dir($target_dir)) {
                if (!$dry_run && $auto_fix) {
                    if (!mkdir($target_dir, 0755, true)) {
                        $errors[] = "❌ Kan directory niet aanmaken: {$target_dir}";
                        continue;
                    }
                } else {
                    $warnings[] = "⚠️  Directory bestaat niet: {$target_dir}";
                    continue;
                }
            }

            // Check if target file already exists
            if (file_exists($target_path)) {
                // If file exists in target, we can safely remove from root
                if ($dry_run) {
                    echo "  🗑️  Zou verwijderen (duplicaat): {$item} (bestaat al in {$target_info[0]})\n";
                } elseif ($auto_fix) {
                    if (unlink($file_path)) {
                        echo "  ✅ Verwijderd (duplicaat): {$item} (bestaat al in {$target_info[0]})\n";
                        $moved[] = [
                            'file' => $item,
                            'action' => 'deleted',
                            'reason' => "Duplicaat - bestaat al in {$target_info[0]}"
                        ];
                    } else {
                        $errors[] = "❌ Kan duplicaat niet verwijderen: {$item}";
                    }
                } else {
                    $warnings[] = "⚠️  Duplicaat: {$item} (bestaat al in {$target_info[0]} - gebruik --auto-fix om te verwijderen)";
                }
                $matched = true;
                continue;
            }

            if ($dry_run) {
                echo "  📦 Zou verplaatsen: {$item} → {$target_info[0]}{$item} ({$description})\n";
            } elseif ($auto_fix) {
                // Move file
                if (rename($file_path, $target_path)) {
                    $moved[] = [
                        'file' => $item,
                        'from' => $file_path,
                        'to' => $target_path,
                        'description' => $description
                    ];
                    echo "  ✅ Verplaatst: {$item} → {$target_info[0]}{$item}\n";
                } else {
                    $errors[] = "❌ Kan bestand niet verplaatsen: {$item}";
                }
            } else {
                $warnings[] = "⚠️  {$item} - {$description} (gebruik --auto-fix om te verplaatsen)";
            }

            $matched = true;
            break;
        }
    }

    // If no rule matched, it's an unknown file
    if (!$matched) {
        $warnings[] = "⚠️  Onbekend bestand in root: {$item} (controleer of dit correct is)";
    }
}

// Report results
echo "\n";

if (!empty($moved)) {
    $count = count($moved);
    echo "✅ {$count} bestand(en) verplaatst:\n";
    foreach ($moved as $move) {
        $to_path = isset($move['to']) ? $move['to'] : (isset($move['action']) ? 'verwijderd' : 'onbekend');
        echo "   - {$move['file']} → {$to_path}\n";
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
    echo "❌ FOUTEN:\n\n";
    foreach ($errors as $error) {
        echo "  {$error}\n";
    }
    echo "\n";
    exit(1);
}

if (empty($moved) && empty($warnings) && empty($errors)) {
    echo "✅ Root directory is al clean!\n";
    exit(0);
}

if ($dry_run && !empty($warnings)) {
    echo "💡 Gebruik --auto-fix om deze bestanden automatisch te verplaatsen\n";
    exit(0);
}

if (!$auto_fix && !empty($warnings)) {
    echo "💡 Gebruik --auto-fix om deze bestanden automatisch te verplaatsen\n";
    echo "   Of gebruik --dry-run om te zien wat er zou gebeuren\n";
    exit(0);
}

exit(0);
