const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function createOpaqueId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function createPublicReference(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  let output = '';
  for (const byte of bytes) output += alphabet[byte % alphabet.length];
  return `PV-${output}`;
}
