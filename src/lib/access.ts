/**
 * Who may open which page. Shared by the proxy (server, before any HTML is sent) and the
 * client guards, so the two never disagree. The API enforces the same rules on every
 * request (see IPILE-api/docs/rbac.md); these checks keep people off pages whose
 * data they could never load, and send admins to their dashboard.
 */
export type AppRole = 'customer' | 'tailor' | 'merchant' | 'admin';

type Rule = {
  /** Path prefix, matched on whole segments ("/orders" matches "/orders/x", not "/ordersx"). */
  prefix: string;
  /** Roles allowed in; 'members' = any signed-in non-admin account. */
  allow: AppRole[] | 'members';
  /** Signed-out visitors are new people joining in this role: send them to sign up, not sign in. */
  signupAs?: Exclude<AppRole, 'admin'>;
};

// First match wins, so more specific prefixes come first.
const RULES: Rule[] = [
  { prefix: '/admin', allow: ['admin'] },
  { prefix: '/merchant', allow: ['merchant'] },
  // Onboarding pages offer a role switch client-side (before the role is locked), so any member may open them.
  { prefix: '/onboarding/fit-profile', allow: 'members', signupAs: 'customer' },
  { prefix: '/onboarding/tailor-kyc', allow: 'members', signupAs: 'tailor' },
  { prefix: '/onboarding/merchant-verification', allow: 'members', signupAs: 'merchant' },
  // Starting a commission while signed out usually means a new customer.
  { prefix: '/orders/new', allow: 'members', signupAs: 'customer' },
  { prefix: '/orders', allow: 'members' },
  { prefix: '/saved', allow: 'members' },
  { prefix: '/notifications', allow: 'members' },
  // Each member answers the testing survey for their own role; admins read results instead.
  { prefix: '/survey', allow: 'members' },
];

const matches = (pathname: string, prefix: string) => pathname === prefix || pathname.startsWith(`${prefix}/`);

export function ruleFor(pathname: string): Rule | null {
  return RULES.find((rule) => matches(pathname, rule.prefix)) ?? null;
}

/** Where an admin goes instead of a members-only page. */
function adminEquivalent(pathname: string): string {
  const order = pathname.match(/^\/orders\/([0-9a-f-]{36})$/i);
  if (order) return `/admin/orders/${order[1]}`;
  if (matches(pathname, '/orders')) return '/admin/orders';
  if (matches(pathname, '/notifications')) return '/admin/notifications';
  if (matches(pathname, '/merchant')) return '/admin/fabrics';
  if (matches(pathname, '/survey')) return '/admin/surveys';
  return '/admin';
}

/** Landing page after signing in. */
export function homeFor(role: AppRole): string {
  if (role === 'admin') return '/admin';
  if (role === 'tailor') return '/onboarding/tailor-kyc';
  if (role === 'merchant') return '/onboarding/merchant-verification';
  return '/marketplace';
}

export type AccessDecision =
  | { kind: 'allow' }
  | { kind: 'signin' }
  | { kind: 'signup'; role: Exclude<AppRole, 'admin'> }
  | { kind: 'redirect'; to: string };

/**
 * The decision for `role` (null = signed out) opening `pathname`. `knownAccount`: this
 * browser has signed in before, so a returning visitor is asked to sign in, not sign up.
 */
export function decideAccess(pathname: string, role: AppRole | null, knownAccount = false): AccessDecision {
  const rule = ruleFor(pathname);
  if (!rule) return { kind: 'allow' };
  if (!role) return rule.signupAs && !knownAccount ? { kind: 'signup', role: rule.signupAs } : { kind: 'signin' };
  if (rule.allow === 'members') {
    return role === 'admin' ? { kind: 'redirect', to: adminEquivalent(pathname) } : { kind: 'allow' };
  }
  if (rule.allow.includes(role)) return { kind: 'allow' };
  return { kind: 'redirect', to: role === 'admin' ? adminEquivalent(pathname) : '/marketplace' };
}

/**
 * Where to go after signing in or verifying: an account that never chose how it will use
 * IPILE goes back to that step (unless it was heading somewhere specific), so an
 * abandoned sign-up resumes where it stopped.
 */
export function landingAfterAuth(
  user: { role: AppRole; pathChosenAt?: string | null },
  next: string | null | undefined,
  home?: string,
): string {
  const heading = next?.split(/[?#]/)[0];
  if (user.role !== 'admin' && !user.pathChosenAt && (!heading || heading.startsWith('/onboarding'))) return '/onboarding';
  return landingFor(user.role, next, home);
}

/**
 * Where to go after signing in: `next` when this role may open it, otherwise their home.
 * Admins always land in the dashboard unless `next` is an admin page.
 */
export function landingFor(role: AppRole, next: string | null | undefined, home = homeFor(role)): string {
  if (role === 'admin') home = '/admin';
  const safe = next && next.startsWith('/') && !next.startsWith('//') ? next : null;
  if (!safe) return home;
  const path = safe.split(/[?#]/)[0];
  if (role === 'admin' && !matches(path, '/admin')) return '/admin';
  return decideAccess(path, role).kind === 'allow' ? safe : home;
}
