/**
 * 🛡️ CHRIS WATCHDOG (2026)
 * 
 * De digitale uitsmijter van Voices.be. 
 * Handhaaft de Bob-methode: Clean, Fast, Rigid, Ademing.
 * 
 * "Als het niet ademt, is het dood. Als het niet snel is, bestaat het niet."
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Laad env vars voor self-healing checks
dotenv.config({ path: '1-SITE/apps/web/.env.local' });

interface AuditResult {
  file: string;
  issues: { line: number; message: string; severity: 'CRITICAL' | 'WARNING'; fixable: boolean }[];
}

class ChrisWatchdog {
  private supabase: any;

  constructor() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      this.supabase = createClient(url, key);
    }
  }

  /**
   * 🏥 SELF-HEALING: Check database health
   */
  async checkDatabaseHealth() {
    console.log('🏥 [HEAL] Controleren van database gezondheid...');
    if (!this.supabase) {
      console.error('🔴 [HEAL] Supabase niet geconfigureerd in env.');
      return false;
    }

    try {
      const { data, error } = await this.supabase.from('actors').select('id').limit(1);
      if (error) throw error;
      console.log('✅ [HEAL] Database tunnel (SDK) is operationeel.');
      return true;
    } catch (e: any) {
      console.error('🔴 [HEAL] Database CRITICAL FAILURE:', e.message);
      // Hier kunnen we proactief actie ondernemen, bijv. een notificatie sturen
      return false;
    }
  }

  private rules = [
    {
      name: 'Raleway Mandate',
      pattern: /font-(?!light|extralight|thin|medium).*(h[1-6]|HeadingInstrument|text-[4-9]xl)/g,
      message: 'Koppen MOETEN font-light of font-extralight Raleway zijn.',
      severity: 'CRITICAL'
    },
    {
      name: 'Zero-Uppercase Slop',
      pattern: /className="[^"]*\buppercase\b[^"]*"/g,
      message: 'Uppercase is verboden. Gebruik Natural Capitalization.',
      severity: 'CRITICAL'
    },
    {
      name: 'Centralized Imports',
      pattern: /from ['"]\.\.\/.*components\/ui\/(?!LayoutInstruments|VoiceglotText)/g,
      message: 'Gebruik uitsluitend @/components/ui/LayoutInstruments voor UI componenten.',
      severity: 'WARNING'
    },
    {
      name: 'Hardcoded Text Detection',
      pattern: />[^<{]*[a-zA-Z]{5,}[^<{]*</g,
      message: 'Mogelijke hardcoded tekst gedetecteerd. Gebruik <VoiceglotText />.',
      severity: 'WARNING'
    },
    {
      name: 'Mobile-First Spacing',
      pattern: /className="[^"]*\b(p|m)[xy]?-[0-9]+\b(?!.*md:(p|m)[xy]?-[0-9]+)[^"]*"/g,
      message: 'Zorg voor mobile-first spacing (gebruik md: voor desktop overrides).',
      severity: 'WARNING'
    },
    {
      name: 'Leesbaarheid Mandate',
      pattern: /text-\[([0-9]|10)px\]/g,
      message: 'Minimale tekstgrootte is 11px (alleen voor metadata/badges). Body tekst moet 15px+ zijn.',
      severity: 'WARNING'
    },
    {
      name: 'Atomic Icon Mandate',
      pattern: /<(Zap|Star|Check|Plus|X|ArrowRight|ChevronDown|User|Mail|Briefcase|ShieldCheck|CheckCircle2|LogOut|Sparkles|ArrowLeft|Quote|Calendar|MessageSquare|HelpCircle|Shield|Send|Unlock|Lock|Activity|Monitor|Radio|Globe|Mic2|Phone|Building2|BookOpen|Wind|Users|Heart|Play|Layout|Settings|Database|Mailbox|Search|Layers|Eye|FileText|Download|Trash2|Edit|PlusCircle|CheckCircle|AlertCircle|Info|Clock|MapPin|ExternalLink|Menu|ChevronRight|ChevronLeft|ChevronUp|Filter|Grid|List|Maximize2|Minimize2|Volume2|VolumeX|Moon|Sun|Camera|Video|Mic|Music|Wifi|WifiOff|Cloud|CloudRain|CloudLightning|CloudSnow|Sunrise|Sunset|Umbrella|Thermometer|Droplets|Gauge|Minus|ArrowUp|ArrowDown|ArrowUpRight|ArrowUpLeft|ArrowDownRight|ArrowDownLeft|ChevronsRight|ChevronsLeft|ChevronsUp|ChevronsDown|MoreHorizontal|MoreVertical|Share|Share2|Unlink|Unlink2|Scissors|Copy|Clipboard|Save|HardDrive|Cpu|Smartphone|Tablet|Laptop|Tv|Speaker|Headphones|Globe2|Map|Compass|Navigation|Navigation2|Flag|Terminal|Code|Code2|Command|Film|Film2|Pause|Square|Circle|Triangle|Hexagon|Pentagon|Octagon|ShieldAlert|ShieldX|Key|UserPlus|UserMinus|UserCheck|UserX|Archive|Inbox|Folder|FolderPlus|FolderMinus|FolderOpen|File|FilePlus|FileMinus|FileSearch|FileCheck|FileX|FileCode|FileAudio|FileVideo|FileArchive|FileDigit|FileBox|FileSpreadsheet|FilePieChart|FileBarChart|FileLineChart|FileSignature|FileQuestion|FileWarning|FileLock|FileUnlock|FileEdit|FileUp|FileDown|FileHeart|FileStar|FileZap|FileShield|FileShieldCheck|FileShieldAlert|FileShieldX|FileUser|FileUserPlus|FileUserMinus|FileUserCheck|FileUserX|FileUsers|FileMail|FileMailbox|FileSend|FileInbox|FileFolder|FileFolderPlus|FileFolderMinus|FileFolderOpen|RefreshCw|TrendingUp|Brain|MessageSquareQuote)(?![^>]*strokeWidth=\{1\.5\})(?![^>]*Provider)[^>]*>/g,
      message: 'Lucide icons MOETEN strokeWidth={1.5} hebben voor de Ademing-feel.',
      severity: 'CRITICAL',
      excludeFiles: ['DirectMailService.ts', 'AuthContext.tsx', 'CheckoutContext.tsx', 'EditModeContext.tsx', 'agency-bridge.ts', 'api-server.ts', 'api.ts', 'mailbox/page.tsx', 'layout.tsx', 'VideoPlayer.tsx', 'BentoArchitect.tsx', 'CommandPalette.tsx', 'FilterBar.tsx', 'StudioLaunchpad.tsx']
    },
    {
      name: 'Modern Stack Discipline',
      pattern: /<div|<span|<p|<a\s+href=|className="[^"]*"(?=\s*style=)|document\.getElement|document\.querySelector/g,
      message: 'Gebruik Layout Instruments (Container, Text, Section) ipv kale HTML tags. Geen inline styles of DOM manipulatie.',
      severity: 'WARNING'
    }
  ];

  async auditFile(filePath: string): Promise<AuditResult> {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const result: AuditResult = { file: filePath, issues: [] };

    lines.forEach((line, index) => {
      this.rules.forEach(rule => {
        // @ts-ignore
        if (rule.excludeFiles && rule.excludeFiles.some(f => filePath.endsWith(f))) {
          // console.log(`   ⏭️ [SKIP] ${rule.name} for ${path.basename(filePath)}`);
          return;
        }
        if (rule.pattern.test(line)) {
          result.issues.push({
            line: index + 1,
            message: rule.message,
            severity: rule.severity as any,
            fixable: true
          });
        }
      });
    });

    return result;
  }

  async run(targetPath: string): Promise<boolean> {
    console.log(`🚀 CHRIS WATCHDOG: Start audit op ${targetPath}...`);
    
    if (!fs.existsSync(targetPath)) {
      console.error(`🔴 Pad niet gevonden: ${targetPath}`);
      return false;
    }

    let hasCriticalIssues = false;

    const stats = fs.statSync(targetPath);
    if (stats.isFile()) {
      const result = await this.auditFile(targetPath);
      this.report(result);
      if (result.issues.some(i => i.severity === 'CRITICAL')) {
        hasCriticalIssues = true;
        console.log(`🔴 [AUDIT] Kritieke fout in ${targetPath}`);
      }
    } else {
      hasCriticalIssues = await this.auditDir(targetPath);
    }

    return !hasCriticalIssues;
  }

  private async auditDir(dir: string): Promise<boolean> {
    const files = fs.readdirSync(dir);
    let hasCriticalIssues = false;

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
          const subDirHasIssues = await this.auditDir(fullPath);
          if (subDirHasIssues) hasCriticalIssues = true;
        }
      } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
        const result = await this.auditFile(fullPath);
        this.report(result);
        if (result.issues.some(i => i.severity === 'CRITICAL')) {
          hasCriticalIssues = true;
          console.log(`🔴 [AUDIT] Kritieke fout in ${fullPath}`);
        }
      }
    }
    return hasCriticalIssues;
  }

  private report(result: AuditResult) {
    if (result.issues.length === 0) return;

    console.log(`\n📄 File: ${result.file}`);
    result.issues.forEach(issue => {
      const color = issue.severity === 'CRITICAL' ? '🔴' : '🟡';
      console.log(`${color} [L${issue.line}] ${issue.severity}: ${issue.message}`);
    });
  }

  async fixDir(dir: string) {
    const files = fs.readdirSync(dir);
    files.forEach(async file => {
      const fullPath = path.join(dir, file);
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        if (!fullPath.includes('node_modules') && !fullPath.includes('.next') && !fullPath.includes('.git')) {
          this.fixDir(fullPath);
        }
      } else if (/\.(tsx|ts|js|jsx)$/.test(file)) {
        await this.fix(fullPath);
      }
    });
  }

  async fix(filePath: string) {
    // console.log(`🔧 CHRIS FIX: Herstellen van ${filePath}...`); // Te veel log noise
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;

    // Fix Uppercase Slop
    content = content.replace(/className="([^"]*)\buppercase\b([^"]*)"/g, (match, p1, p2) => {
      console.log(`   ✅ [FIX] ${path.basename(filePath)}: Verwijderd 'uppercase'`);
      return `className="${p1}${p2}"`.replace(/\s\s+/g, ' ');
    });

    // Fix Leesbaarheid Mandate (Opschalen van te kleine tekst)
    content = content.replace(/text-\[([0-9])px\]/g, 'text-[11px]'); // 0-9px -> 11px
    content = content.replace(/text-\[10px\]/g, 'text-[11px]'); // 10px -> 11px
    content = content.replace(/text-xs/g, 'text-[13px]'); // xs -> 13px (veilige ondergrens)
    // Vervang font-black/bold door font-light als de tekst groot is (text-4xl+)
    content = content.replace(/(className="[^"]*)\b(font-black|font-bold|font-semibold)\b([^"]*text-([4-9]xl|6xl|7xl|8xl|9xl)[^"]*")/g, (match, p1, p2, p3) => {
        console.log(`   ✅ [FIX] ${path.basename(filePath)}: Vervangen '${p2}' door 'font-light' (Large Text)`);
        return `${p1}font-light${p3}`;
    });

    // Fix Raleway Mandate (Specifiek voor Headings & TextInstrument)
    content = content.replace(/<(h[1-6]|TextInstrument|HeadingInstrument)([^>]*className="[^"]*)(?<!font-(light|extralight|thin|medium))([^"]*")/g, (match, p1, p2, p3, p4) => {
      if (p2.includes('font-') || p4.includes('font-')) return match;
      console.log(`   ✅ [FIX] ${path.basename(filePath)}: Toegevoegd 'font-light' aan ${p1}`);
      return `<${p1}${p2} font-light${p4}`;
    });

    // Fix Atomic Icon Mandate (Lucide icons strokeWidth)
    // 🛡️ CHRIS-PROTOCOL: Regex verfijnd om geen TypeScript generics (bv. useState<User>) te slopen.
    const iconPattern = /<([A-Z][a-zA-Z0-9]+)(?=\s|\/>)(?![^>]*strokeWidth=\{1\.5\})(?![^>]*Provider)([^>]*)>/g;
    content = content.replace(iconPattern, (match, p1, p2) => {
        // p1 is de icon naam (bv. Zap, Star, etc.)
        // p2 is de capture group voor de rest van de tag
        const iconName = p1;
        const attributes = p2 || '';
        
        // Alleen Lucide-achtige iconen (PascalCase, meestal 3+ letters)
        if (iconName.length < 3) return match;
        
        // 🛡️ CHRIS-PROTOCOL: Voorkom dat we TypeScript generics (bv. createContext<Type>) matchen
        // We checken of de match gevolgd wordt door een spatie, een newline, of direct gesloten wordt.
        // En we checken of het geen generic is in een Promise of function call.
        if (!match.includes(' ') && !match.includes('/>')) return match;
        if (match.includes('<Promise<') || match.includes('Promise<')) return match;
        if (attributes.includes('>') && !attributes.includes('=')) return match; // Waarschijnlijk een generic type

        // Extra check: negeer als het eruit ziet als een type (bv. <User | null>)
        if (attributes.includes('|') || attributes.includes('[') || attributes.trim() === '' || attributes.includes('>') || attributes.includes(')')) {
            if (!attributes.includes('=') && !match.includes('/>')) return match; 
        }
        
        // Check of het een bekend Lucide icoon is (simpele check: begint met hoofdletter, geen Provider)
        // We kunnen hier een lijst toevoegen of het generiek houden voor alle Capitalized tags die geen Provider zijn
        const exceptions = [
            'Provider', 'Instrument', 'Card', 'Skeleton', 'Link', 'Image', 'NextImage', 
            'VoiceglotText', 'VoiceglotHtml', 'VoiceglotImage', 'ImageIcon', 'VideoPlayer', 
            'ArticleSkeleton', 'SonicDNAHandler', 'LiquidTransitionOverlay', 'CodyPreviewBanner',
            'VoicejarTracker', 'GlobalNav', 'MobileFloatingDock', 'Analytics', 'CommandPalette',
            'Toaster', 'GlobalAudioOrchestrator', 'Suspense', 'VoicyBridge', 'VoicyChat',
            'CookieBanner', 'FooterWrapper', 'Section', 'Container', 'Heading', 'Text', 'Button',
            'Input', 'Label', 'Form', 'Select', 'Option', 'LoadingScreen', 'PageWrapper',
            'LiquidBackground', 'TranslationProvider', 'AuthProvider', 'EditModeProvider',
            'VoicesStateProvider', 'GlobalAudioProvider', 'Providers', 'QueryClientProvider',
            'SessionProvider', 'ThemeProvider', 'TooltipProvider', 'ToastProvider', 'Popover',
            'PopoverTrigger', 'PopoverContent', 'Dialog', 'DialogTrigger', 'DialogContent',
            'Tabs', 'TabsList', 'TabsTrigger', 'TabsContent', 'Accordion', 'AccordionItem',
            'AccordionTrigger', 'AccordionContent', 'DropdownMenu', 'DropdownMenuTrigger',
            'DropdownMenuContent', 'DropdownMenuItem', 'ScrollArea', 'Separator', 'Badge',
            'Avatar', 'AvatarImage', 'AvatarFallback', 'Switch', 'Slider',
            'Checkbox', 'RadioGroup', 'RadioGroupItem', 'Label', 'Table', 'TableHeader',
            'TableBody', 'TableFooter', 'TableHead', 'TableRow', 'TableCell', 'TableCaption',
            'AnimatePresence', 'Fragment', 'Portal', 'Slot', 'Primitive', 'Presence',
            'Motion', 'MotionDiv', 'MotionSpan', 'MotionSection', 'MotionContainer',
            'ClientOnly', 'Hydrate', 'QueryClient', 'NextLink', 'Head', 'Script',
            'AudioReviewDashboard', 'DynamicActorFeed', 'BentoArchitect', 'SmartDemoExplorer',
            'AtomicActionPreview', 'BlueprintExplorer', 'CartDrawer', 'FilterBar', 'GlossaryCard',
            'RateCard', 'StudioLaunchpad', 'EditModeContext', 'AgencyBridge', 'ApiServer', 'Api',
            'AccountDashboardClient', 'PartnerDashboardClient', 'MailboxPage', 'VoicePageClient',
            'CheckoutPageClient', 'SuccessPageClient', 'VoiceDetailClient', 'WorkshopFunnel',
            'WorkshopCalendar', 'WorkshopContent', 'WorkshopInterestForm', 'CastingDock',
            'HeroInstrument', 'StudioAcademyBento', 'PageWrapperInstrument', 'SectionInstrument',
            'ContainerInstrument', 'HeadingInstrument', 'TextInstrument', 'ButtonInstrument',
            'InputInstrument', 'LabelInstrument', 'FormInstrument', 'SelectInstrument',
            'OptionInstrument', 'LoadingScreenInstrument', 'VoiceglotTextInstrument',
            'VoiceglotHtmlInstrument', 'VoiceglotImageInstrument', 'BentoGrid', 'BentoCard',
            'X', 'Link', 'AnimatePresence'
        ];
        
        if (exceptions.some(ext => iconName.endsWith(ext) || iconName === ext)) {
            return match;
        }

        if (match.includes('strokeWidth=')) {
            // Replace existing strokeWidth
            console.log(`   ✅ [FIX] ${path.basename(filePath)}: Updated strokeWidth for ${iconName}`);
            return match.replace(/strokeWidth=\{[^}]*\}/, 'strokeWidth={1.5}');
        } else {
            // Add strokeWidth
            console.log(`   ✅ [FIX] ${path.basename(filePath)}: Added strokeWidth={1.5} to ${iconName}`);
            
            // 🛡️ CHRIS-PROTOCOL: Fix self-closing tag detection to avoid double slashes
            if (attributes.endsWith('/')) {
                const cleanAttributes = attributes.slice(0, -1).trim();
                return `<${iconName} strokeWidth={1.5} ${cleanAttributes} />`;
            }
            
            return `<${iconName} strokeWidth={1.5}${attributes}>`;
        }
    });

    // 🚀 CHRIS-PROTOCOL 2.0: Auto-fix double slashes in self-closing tags (herstel van eerdere fout)
    content = content.replace(/\/ \/>/g, '/>');
    content = content.replace(/\/ \/>/g, '/>'); // Dubbele check voor hardnekkige gevallen
    content = content.replace(/ \/ \/>/g, ' />');

    // 🚀 CHRIS-PROTOCOL 2.0: Verwijder strokeWidth van elementen die het niet horen te hebben
    content = content.replace(/<(Link|Image|NextImage|VoiceglotText|VoiceglotHtml|VoiceglotImage|ContainerInstrument|SectionInstrument|HeadingInstrument|TextInstrument|ButtonInstrument|InputInstrument|LabelInstrument|FormInstrument|SelectInstrument|OptionInstrument|LoadingScreenInstrument|PageWrapperInstrument|AnimatePresence|Suspense|WorkshopHero|WorkshopContent|WorkshopInterestForm|PricingCalculator|AppointmentPicker|JitsiMeeting|ParticipantsContent|AfspraakContent|WorkshopQuiz|AcademyDashboardData|StudioDashboardData|WorkshopHeroProps)([^>]*)strokeWidth=\{1\.5\}([^>]*)>/g, '<$1$2$3>');

    // 🚀 CHRIS-PROTOCOL 2.0: Auto-fix Raleway Mandate (font-light voor koppen)
    content = content.replace(/<(h[1-6]|HeadingInstrument)([^>]*)className="([^"]*)"([^>]*)>/g, (match, tag, p1, classes, p2) => {
        if (classes.includes('font-') && !classes.includes('font-light') && !classes.includes('font-extralight') && !classes.includes('font-thin') && !classes.includes('font-medium')) {
            console.log(`   ✅ [FIX] ${path.basename(filePath)}: font-light geforceerd op ${tag} (was ${classes.match(/font-[a-z]+/)?.[0]})`);
            const newClasses = classes.replace(/font-[a-z]+/, 'font-light');
            return `<${tag}${p1}className="${newClasses}"${p2}>`;
        }
        if (!classes.includes('font-')) {
            console.log(`   ✅ [FIX] ${path.basename(filePath)}: font-light toegevoegd aan ${tag}`);
            return `<${tag}${p1}className="${classes} font-light"${p2}>`;
        }
        return match;
    });

    // 🚀 CHRIS-PROTOCOL 2.0: Auto-fix Leesbaarheid (Alleen tekst < 15px opschalen naar 15px)
    content = content.replace(/text-(xs|sm|\[([0-9]|1[0-4])px\])/g, (match) => {
      console.log(`   ✅ [FIX] ${path.basename(filePath)}: Opgeschaald naar text-[15px] (${match})`);
      return 'text-[15px]';
    });

    // 🚀 CHRIS-PROTOCOL 2.0: Auto-fix HTML naar Instruments (div -> ContainerInstrument)
    // Alleen als het bestand al LayoutInstruments importeert om import-chaos te voorkomen
    if (content.includes('LayoutInstruments')) {
      content = content.replace(/<div([^>]*)>/g, (match, p1) => {
        if (p1.includes('className')) {
          console.log(`   ✅ [FIX] ${path.basename(filePath)}: <div> -> <ContainerInstrument>`);
          return `<ContainerInstrument${p1}>`;
        }
        return match;
      });
      content = content.replace(/<\/div>/g, '<\/ContainerInstrument>');
      
      content = content.replace(/<span([^>]*)>/g, (match, p1) => {
        if (p1.includes('className')) {
          console.log(`   ✅ [FIX] ${path.basename(filePath)}: <span> -> <TextInstrument>`);
          return `<TextInstrument${p1}>`;
        }
        return match;
      });
      content = content.replace(/<\/span>/g, '<\/TextInstrument>');
    }

    content = content.replace(/ (md:(size|width|height|className|strokeWidth))=\{([^}]*)\}/g, '');
    content = content.replace(/ (md:(size|width|height|className|strokeWidth))=([^\s>]*)/g, '');

    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
    }
  }
}

// CLI Execution
const mode = process.argv[2];
const target = process.argv[3] || '1-SITE/apps/web/src';
const watchdog = new ChrisWatchdog();

if (mode === 'fix') {
  console.log(`🔧 CHRIS FIX PROTOCOL: Start herstel op ${target}...`);
  if (fs.statSync(target).isFile()) {
    watchdog.fix(target).catch(console.error);
  } else {
    watchdog.fixDir(target).catch(console.error);
  }
} else if (mode === 'health') {
  watchdog.checkDatabaseHealth().then(ok => {
    process.exit(ok ? 0 : 1);
  });
} else {
  watchdog.run(target).then(success => {
    if (!success) {
      console.error('🔴 CHRIS: Kritieke fouten gevonden. Audit failed.');
      process.exit(1);
    }
    console.log('✅ CHRIS: Audit geslaagd. Geen kritieke fouten.');
    process.exit(0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
