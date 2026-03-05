import { ConfigBridge } from '@/lib/utils/config-bridge';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const requestedKey = params.key;
    const navKey = requestedKey.startsWith('nav_') ? requestedKey.slice(4) : requestedKey;
    const menu = await ConfigBridge.getNavConfig(navKey, 'nl');

    return NextResponse.json(menu || { items: [] });
  } catch (error) {
    console.error('Nav API Error (Table might be missing):', error);
    // Return a graceful empty response instead of 500
    return NextResponse.json({ items: [], error: 'Table missing or query failed' });
  }
}
