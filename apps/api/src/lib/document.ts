// Strip keys whose value is `undefined` so we never serialize them to ekoDB.
// MessagePack (and some JSON paths) treat `undefined` as an unsupported type,
// while a missing key is well-defined.

export function compact<T extends Record<string, unknown>>(obj: T): T {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out as T;
}
