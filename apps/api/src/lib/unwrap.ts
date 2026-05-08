// ekoDB may return field values either as plain primitives or as
// wrapped `{ type, value }` envelopes depending on the operation.
// `unwrapRecord` produces a plain object regardless of which shape arrives.

function unwrapField(field: unknown): unknown {
  if (field === null || field === undefined) return field;
  if (typeof field === 'object' && 'value' in (field as object) && 'type' in (field as object)) {
    return (field as { value: unknown }).value;
  }
  return field;
}

export function unwrapRecord<T>(record: unknown): T {
  if (!record || typeof record !== 'object') return record as T;
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(record as Record<string, unknown>)) {
    out[key] = unwrapField(value);
  }
  return out as T;
}
