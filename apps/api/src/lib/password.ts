// Server-side password hashing.
//
// Uses PBKDF2-HMAC-SHA256 via WebCrypto, which is native to Cloudflare
// Workers and requires no dependencies. OWASP's Password Storage cheat
// sheet currently recommends 600,000 iterations for SHA-256.
//
// Argon2id is OWASP's preferred algorithm but requires a WASM/JS library
// (none ship in the Workers runtime). Switching to it later is a drop-in
// replacement at this layer — the format string below namespaces the
// algorithm so old hashes remain verifiable.

const ALGORITHM = 'pbkdf2-sha256';
const ITERATIONS = 600_000;
const KEY_LENGTH_BYTES = 32;
const SALT_LENGTH_BYTES = 16;
const MIN_PASSWORD_LENGTH = 8;

export class WeakPasswordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WeakPasswordError';
  }
}

export function validatePasswordStrength(password: unknown): asserts password is string {
  if (typeof password !== 'string') {
    throw new WeakPasswordError('Password must be a string');
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw new WeakPasswordError(
      `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
    );
  }
}

export async function hashPassword(password: string): Promise<string> {
  validatePasswordStrength(password);
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const hash = await derive(password, salt, ITERATIONS);
  return `${ALGORITHM}$${ITERATIONS}$${b64(salt)}$${b64(hash)}`;
}

export async function verifyPassword(
  password: string,
  stored: string
): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 4 || parts[0] !== ALGORITHM) return false;
  const iterations = Number(parts[1]);
  if (!Number.isInteger(iterations) || iterations <= 0) return false;
  const salt = fromB64(parts[2]);
  const expected = fromB64(parts[3]);
  const derived = await derive(password, salt, iterations);
  return constantTimeEqual(derived, expected);
}

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<Uint8Array> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH_BYTES * 8
  );
  return new Uint8Array(bits);
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

function b64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}

function fromB64(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
