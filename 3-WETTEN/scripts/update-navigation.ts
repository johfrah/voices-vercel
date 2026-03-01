import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Zoek naar de .env.local file
const envPath = path.resolve(process.cwd(), '1-SITE/apps/web/.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateNav() {
  console.log('🚀 UPDATING NAVIGATION MENUS...');

  const worlds = [
    { name: 'Agency', href: '/agency' },
    { name: 'Johfrai (AI)', href: '/johfrai' },
    { name: 'Studio', href: '/studio' },
    { name: 'Academy', href: '/academy' },
    { name: 'Ademing', href: '/ademing' },
    { name: 'Artists', href: '/artists' },
    { name: 'Partners', href: '/partners' },
    { name: 'Freelance', href: '/freelance' },
    { name: 'Portfolio', href: '/portfolio' }
  ];

  // 1. Update main_nav
  const mainNavItems = worlds.slice(0, 6).map((w, i) => ({
    label: w.name,
    href: w.href,
    order: i + 1
  }));

  await supabase.from('nav_menus').upsert({
    key: 'main_nav',
    items: mainNavItems,
    market: 'ALL',
    updated_at: new Date()
  }, { onConflict: 'key' });

  // 2. Create/Update world-specific navs
  for (const world of worlds) {
    const key = `nav_${world.name.toLowerCase().split(' ')[0]}`;
    const worldNav = {
      logo: {
        alt: `Voices ${world.name}`,
        src: "/assets/common/branding/Voices-LOGO-Animated.svg",
        width: 180,
        height: 40
      },
      icons: {
        cart: true,
        menu: true,
        account: true,
        language: true,
        favorites: true
      },
      links: [
        { name: 'Overzicht', href: world.href },
        { name: 'Hoe het werkt', href: `${world.href}#how` },
        { name: 'Contact', href: '/contact' }
      ]
    };

    await supabase.from('nav_menus').upsert({
      key,
      items: worldNav,
      market: 'ALL',
      updated_at: new Date()
    }, { onConflict: 'key' });
  }

  console.log('🏁 NAVIGATION UPDATED.');
}

updateNav();
