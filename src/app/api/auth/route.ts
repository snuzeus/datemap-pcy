import { NextRequest, NextResponse } from 'next/server';
import type { Provider } from '@supabase/supabase-js';
import { createSupabaseRouteClient } from '@/lib/supabaseServer';

const OAUTH_PROVIDERS = ['kakao', 'google'] as const;
type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];
const KAKAO_SCOPES = 'profile_nickname profile_image';

function isOAuthProvider(provider: string | null): provider is OAuthProvider {
  return OAUTH_PROVIDERS.includes(provider as OAuthProvider);
}

function getSafeNext(value: string | null) {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/saved';
  }
  return value;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = getSafeNext(searchParams.get('next'));
  const redirectUrl = new URL(next, origin);
  const code = searchParams.get('code');
  const provider = searchParams.get('provider');

  if (!code && !provider) {
    redirectUrl.searchParams.set('auth', 'missing_callback');
    return NextResponse.redirect(redirectUrl);
  }

  if (!code && !isOAuthProvider(provider)) {
    return NextResponse.json(
      { error: 'Unsupported auth provider' },
      { status: 400 },
    );
  }

  const supabase = createSupabaseRouteClient();

  if (!supabase) {
    redirectUrl.searchParams.set('auth', 'unconfigured');
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      redirectUrl.searchParams.set('auth', 'error');
      redirectUrl.searchParams.set('auth_message', error.message);
    }
    return NextResponse.redirect(redirectUrl);
  }

  const callbackUrl = new URL('/api/auth', origin);
  callbackUrl.searchParams.set('next', next);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as Provider,
    options: {
      redirectTo: callbackUrl.toString(),
      queryParams: provider === 'kakao' ? { scope: KAKAO_SCOPES } : undefined,
    },
  });

  if (error || !data.url) {
    return NextResponse.json(
      { error: error?.message ?? 'Failed to start OAuth sign-in' },
      { status: 500 },
    );
  }

  return NextResponse.redirect(data.url);
}
