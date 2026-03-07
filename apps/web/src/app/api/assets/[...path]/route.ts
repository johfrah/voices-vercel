import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

type AssetRouteParams = {
  path?: string[];
};

async function forwardAsset(request: NextRequest, context: { params: AssetRouteParams }, method: 'GET' | 'HEAD') {
  const segments = context.params?.path || [];
  const assetPath = segments.join('/');

  if (!assetPath) {
    return new NextResponse('Missing asset path', { status: 400 });
  }

  const proxyUrl = new URL('/api/proxy/', request.url);
  proxyUrl.searchParams.set('path', assetPath);

  const upstream = await fetch(proxyUrl.toString(), {
    method,
    headers: {
      Accept: request.headers.get('accept') || '*/*',
    },
    cache: 'no-store',
  });

  const headers = new Headers();
  const contentType = upstream.headers.get('content-type');
  if (contentType) headers.set('Content-Type', contentType);
  const cacheControl = upstream.headers.get('cache-control');
  if (cacheControl) headers.set('Cache-Control', cacheControl);
  const proxySource = upstream.headers.get('x-voices-proxy');
  if (proxySource) headers.set('X-Voices-Proxy', proxySource);

  return new NextResponse(method === 'HEAD' ? null : upstream.body, {
    status: upstream.status,
    headers,
  });
}

export async function GET(request: NextRequest, context: { params: AssetRouteParams }) {
  return forwardAsset(request, context, 'GET');
}

export async function HEAD(request: NextRequest, context: { params: AssetRouteParams }) {
  return forwardAsset(request, context, 'HEAD');
}
