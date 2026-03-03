import { NextResponse } from 'next/server';

export const SECURITY_SETTINGS_KEY = 'security_settings';

type SecurityCheckStatus = 'pass' | 'warn' | 'fail';
type CspMode = 'disabled' | 'report_only' | 'enforce';

export interface SecurityAuditCheck {
  key: string;
  status: SecurityCheckStatus;
  message: string;
}

export interface SecurityAuditResult {
  score: number;
  status: SecurityCheckStatus;
  checked_at: string;
  checks: SecurityAuditCheck[];
}

export interface SecurityCenterSettings {
  schema_version: string;
  bot_protection: {
    enabled: boolean;
    blocked_user_agents: string[];
    block_ai_scrapers: boolean;
  };
  hotlink_protection: {
    enabled: boolean;
    protected_asset_prefixes: string[];
    allowed_referer_hosts: string[];
  };
  headers: {
    enabled: boolean;
    csp_mode: CspMode;
    content_security_policy: string;
    strict_transport_security: string;
    x_content_type_options: string;
    x_frame_options: string;
    referrer_policy: string;
    permissions_policy: string;
  };
  admin_protection: {
    require_mfa_for_sensitive_actions: boolean;
    auto_login_bridge_enabled: boolean;
    require_expiring_auto_login_link: boolean;
    allowed_auto_login_hosts: string[];
    trusted_admin_cookie_names: string[];
  };
  session_security: {
    secure_cookie: boolean;
    same_site: 'lax' | 'strict' | 'none';
  };
  observability: {
    watchdog_enabled: boolean;
    log_security_events: boolean;
    alert_on_unhandled_rejections: boolean;
  };
  last_reviewed_at: string;
}

export const DEFAULT_SECURITY_CENTER_SETTINGS: SecurityCenterSettings = {
  schema_version: '2026.03',
  bot_protection: {
    enabled: true,
    block_ai_scrapers: true,
    blocked_user_agents: [
      'gptbot',
      'chatgpt-user',
      'google-extended',
      'ccbot',
      'anthropicai',
      'claude-web',
      'omgili',
      'facebookbot',
      'diffbot',
      'bytespider',
      'imagesiftbot',
      'perplexitybot',
      'youbot',
      'claudebot',
      'cohere-ai',
      'proximic',
      'meta-externalagent',
      'amazonbot',
      'duckduckbot',
      'mojeekbot',
    ],
  },
  hotlink_protection: {
    enabled: true,
    protected_asset_prefixes: ['/assets/agency/voices'],
    allowed_referer_hosts: ['localhost'],
  },
  headers: {
    enabled: true,
    csp_mode: 'enforce',
    content_security_policy:
      "default-src 'self'; img-src 'self' https: data: blob:; media-src 'self' https: blob:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; style-src 'self' 'unsafe-inline' https:; connect-src 'self' https: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
    strict_transport_security: 'max-age=31536000; includeSubDomains; preload',
    x_content_type_options: 'nosniff',
    x_frame_options: 'DENY',
    referrer_policy: 'strict-origin-when-cross-origin',
    permissions_policy:
      'camera=(), microphone=(), geolocation=(), payment=(self), usb=()',
  },
  admin_protection: {
    require_mfa_for_sensitive_actions: true,
    auto_login_bridge_enabled: false,
    require_expiring_auto_login_link: true,
    allowed_auto_login_hosts: ['localhost:3000'],
    trusted_admin_cookie_names: ['voices_role', 'sb-access-token'],
  },
  session_security: {
    secure_cookie: true,
    same_site: 'lax',
  },
  observability: {
    watchdog_enabled: true,
    log_security_events: true,
    alert_on_unhandled_rejections: true,
  },
  last_reviewed_at: new Date().toISOString(),
};

function is_record(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function as_string(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback;
}

function as_boolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function as_string_array(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const strings = value.filter((entry): entry is string => typeof entry === 'string');
  return strings.length > 0 ? strings : fallback;
}

function as_same_site(
  value: unknown,
  fallback: SecurityCenterSettings['session_security']['same_site']
): SecurityCenterSettings['session_security']['same_site'] {
  if (value === 'lax' || value === 'strict' || value === 'none') return value;
  return fallback;
}

function as_csp_mode(
  value: unknown,
  fallback: SecurityCenterSettings['headers']['csp_mode']
): SecurityCenterSettings['headers']['csp_mode'] {
  if (value === 'disabled' || value === 'report_only' || value === 'enforce') return value;
  return fallback;
}

export function sanitize_security_settings(raw: unknown): SecurityCenterSettings {
  if (!is_record(raw)) return { ...DEFAULT_SECURITY_CENTER_SETTINGS };

  const defaults = DEFAULT_SECURITY_CENTER_SETTINGS;
  const bot_protection = is_record(raw.bot_protection) ? raw.bot_protection : {};
  const hotlink_protection = is_record(raw.hotlink_protection) ? raw.hotlink_protection : {};
  const headers = is_record(raw.headers) ? raw.headers : {};
  const admin_protection = is_record(raw.admin_protection) ? raw.admin_protection : {};
  const session_security = is_record(raw.session_security) ? raw.session_security : {};
  const observability = is_record(raw.observability) ? raw.observability : {};

  return {
    schema_version: as_string(raw.schema_version, defaults.schema_version),
    bot_protection: {
      enabled: as_boolean(bot_protection.enabled, defaults.bot_protection.enabled),
      block_ai_scrapers: as_boolean(
        bot_protection.block_ai_scrapers,
        defaults.bot_protection.block_ai_scrapers
      ),
      blocked_user_agents: as_string_array(
        bot_protection.blocked_user_agents,
        defaults.bot_protection.blocked_user_agents
      ),
    },
    hotlink_protection: {
      enabled: as_boolean(hotlink_protection.enabled, defaults.hotlink_protection.enabled),
      protected_asset_prefixes: as_string_array(
        hotlink_protection.protected_asset_prefixes,
        defaults.hotlink_protection.protected_asset_prefixes
      ),
      allowed_referer_hosts: as_string_array(
        hotlink_protection.allowed_referer_hosts,
        defaults.hotlink_protection.allowed_referer_hosts
      ),
    },
    headers: {
      enabled: as_boolean(headers.enabled, defaults.headers.enabled),
      csp_mode: as_csp_mode(headers.csp_mode, defaults.headers.csp_mode),
      content_security_policy: as_string(
        headers.content_security_policy,
        defaults.headers.content_security_policy
      ),
      strict_transport_security: as_string(
        headers.strict_transport_security,
        defaults.headers.strict_transport_security
      ),
      x_content_type_options: as_string(
        headers.x_content_type_options,
        defaults.headers.x_content_type_options
      ),
      x_frame_options: as_string(headers.x_frame_options, defaults.headers.x_frame_options),
      referrer_policy: as_string(headers.referrer_policy, defaults.headers.referrer_policy),
      permissions_policy: as_string(
        headers.permissions_policy,
        defaults.headers.permissions_policy
      ),
    },
    admin_protection: {
      require_mfa_for_sensitive_actions: as_boolean(
        admin_protection.require_mfa_for_sensitive_actions,
        defaults.admin_protection.require_mfa_for_sensitive_actions
      ),
      auto_login_bridge_enabled: as_boolean(
        admin_protection.auto_login_bridge_enabled,
        defaults.admin_protection.auto_login_bridge_enabled
      ),
      require_expiring_auto_login_link: as_boolean(
        admin_protection.require_expiring_auto_login_link,
        defaults.admin_protection.require_expiring_auto_login_link
      ),
      allowed_auto_login_hosts: as_string_array(
        admin_protection.allowed_auto_login_hosts,
        defaults.admin_protection.allowed_auto_login_hosts
      ),
      trusted_admin_cookie_names: as_string_array(
        admin_protection.trusted_admin_cookie_names,
        defaults.admin_protection.trusted_admin_cookie_names
      ),
    },
    session_security: {
      secure_cookie: as_boolean(session_security.secure_cookie, defaults.session_security.secure_cookie),
      same_site: as_same_site(session_security.same_site, defaults.session_security.same_site),
    },
    observability: {
      watchdog_enabled: as_boolean(
        observability.watchdog_enabled,
        defaults.observability.watchdog_enabled
      ),
      log_security_events: as_boolean(
        observability.log_security_events,
        defaults.observability.log_security_events
      ),
      alert_on_unhandled_rejections: as_boolean(
        observability.alert_on_unhandled_rejections,
        defaults.observability.alert_on_unhandled_rejections
      ),
    },
    last_reviewed_at: as_string(raw.last_reviewed_at, defaults.last_reviewed_at),
  };
}

export function merge_security_settings(
  base: SecurityCenterSettings,
  patch: unknown
): SecurityCenterSettings {
  if (!is_record(patch)) return { ...base };
  return sanitize_security_settings({
    ...base,
    ...patch,
    bot_protection: { ...base.bot_protection, ...(is_record(patch.bot_protection) ? patch.bot_protection : {}) },
    hotlink_protection: {
      ...base.hotlink_protection,
      ...(is_record(patch.hotlink_protection) ? patch.hotlink_protection : {}),
    },
    headers: { ...base.headers, ...(is_record(patch.headers) ? patch.headers : {}) },
    admin_protection: {
      ...base.admin_protection,
      ...(is_record(patch.admin_protection) ? patch.admin_protection : {}),
    },
    session_security: {
      ...base.session_security,
      ...(is_record(patch.session_security) ? patch.session_security : {}),
    },
    observability: {
      ...base.observability,
      ...(is_record(patch.observability) ? patch.observability : {}),
    },
    last_reviewed_at: new Date().toISOString(),
  });
}

export function build_security_headers(
  settings: SecurityCenterSettings,
  request_protocol: 'http:' | 'https:' = 'https:'
): Record<string, string> {
  if (!settings.headers.enabled) return {};

  const headers: Record<string, string> = {
    'X-Content-Type-Options': settings.headers.x_content_type_options,
    'X-Frame-Options': settings.headers.x_frame_options,
    'Referrer-Policy': settings.headers.referrer_policy,
    'Permissions-Policy': settings.headers.permissions_policy,
  };

  if (request_protocol === 'https:' && settings.headers.strict_transport_security) {
    headers['Strict-Transport-Security'] = settings.headers.strict_transport_security;
  }

  if (settings.headers.csp_mode === 'enforce') {
    headers['Content-Security-Policy'] = settings.headers.content_security_policy;
  } else if (settings.headers.csp_mode === 'report_only') {
    headers['Content-Security-Policy-Report-Only'] = settings.headers.content_security_policy;
  }

  return headers;
}

export function apply_security_headers(
  response: NextResponse,
  settings: SecurityCenterSettings,
  request_protocol: 'http:' | 'https:' = 'https:'
): NextResponse {
  const headers = build_security_headers(settings, request_protocol);
  Object.entries(headers).forEach(([key, value]) => response.headers.set(key, value));
  return response;
}

export function run_security_audit(
  settings: SecurityCenterSettings,
  runtime: { node_env?: string; has_supabase_service_role_key: boolean; has_admin_email: boolean } = {
    node_env: process.env.NODE_ENV,
    has_supabase_service_role_key: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
    has_admin_email: Boolean(process.env.ADMIN_EMAIL),
  }
): SecurityAuditResult {
  const checks: SecurityAuditCheck[] = [];

  checks.push({
    key: 'bot_protection_enabled',
    status: settings.bot_protection.enabled ? 'pass' : 'warn',
    message: settings.bot_protection.enabled
      ? 'Bot protection is enabled.'
      : 'Bot protection is disabled.',
  });

  checks.push({
    key: 'blocked_agents_size',
    status: settings.bot_protection.blocked_user_agents.length >= 10 ? 'pass' : 'warn',
    message:
      settings.bot_protection.blocked_user_agents.length >= 10
        ? 'Blocked user agent list has broad coverage.'
        : 'Blocked user agent list is short; coverage may be weak.',
  });

  checks.push({
    key: 'headers_enabled',
    status: settings.headers.enabled ? 'pass' : 'fail',
    message: settings.headers.enabled
      ? 'Security headers are enabled.'
      : 'Security headers are disabled.',
  });

  checks.push({
    key: 'csp_mode',
    status:
      settings.headers.csp_mode === 'enforce'
        ? 'pass'
        : settings.headers.csp_mode === 'report_only'
          ? 'warn'
          : 'fail',
    message:
      settings.headers.csp_mode === 'enforce'
        ? 'CSP enforce mode is active.'
        : settings.headers.csp_mode === 'report_only'
          ? 'CSP is report-only; monitor and move to enforce.'
          : 'CSP is disabled.',
  });

  checks.push({
    key: 'session_secure_cookie',
    status:
      runtime.node_env === 'production' && !settings.session_security.secure_cookie ? 'fail' : 'pass',
    message:
      runtime.node_env === 'production' && !settings.session_security.secure_cookie
        ? 'Secure cookie is disabled in production.'
        : 'Secure cookie policy is acceptable.',
  });

  checks.push({
    key: 'admin_auto_login_bridge',
    status: settings.admin_protection.auto_login_bridge_enabled ? 'warn' : 'pass',
    message: settings.admin_protection.auto_login_bridge_enabled
      ? 'Auto-login bridge is enabled; keep tightly controlled.'
      : 'Auto-login bridge is disabled.',
  });

  checks.push({
    key: 'auto_login_bridge_expiry',
    status:
      !settings.admin_protection.auto_login_bridge_enabled ||
      settings.admin_protection.require_expiring_auto_login_link
        ? 'pass'
        : 'warn',
    message:
      !settings.admin_protection.auto_login_bridge_enabled
        ? 'Auto-login bridge is disabled.'
        : settings.admin_protection.require_expiring_auto_login_link
          ? 'Auto-login links require expiration.'
          : 'Auto-login links should require expiration.',
  });

  checks.push({
    key: 'supabase_service_role_key',
    status: runtime.has_supabase_service_role_key ? 'pass' : 'fail',
    message: runtime.has_supabase_service_role_key
      ? 'Supabase service role key is configured.'
      : 'Supabase service role key is missing.',
  });

  checks.push({
    key: 'admin_email',
    status: runtime.has_admin_email ? 'pass' : 'warn',
    message: runtime.has_admin_email
      ? 'Admin email is configured.'
      : 'Admin email is missing; role fallback only.',
  });

  checks.push({
    key: 'watchdog_enabled',
    status: settings.observability.watchdog_enabled ? 'pass' : 'warn',
    message: settings.observability.watchdog_enabled
      ? 'Watchdog monitoring is enabled.'
      : 'Watchdog monitoring is disabled.',
  });

  let score_total = 0;
  checks.forEach((check) => {
    if (check.status === 'pass') score_total += 1;
    if (check.status === 'warn') score_total += 0.5;
  });

  const score = Number(((score_total / checks.length) * 100).toFixed(1));
  const has_fail = checks.some((check) => check.status === 'fail');
  const has_warn = checks.some((check) => check.status === 'warn');

  return {
    score,
    status: has_fail ? 'fail' : has_warn ? 'warn' : 'pass',
    checked_at: new Date().toISOString(),
    checks,
  };
}
