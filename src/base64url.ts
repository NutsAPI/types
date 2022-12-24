export function toBase64URL(base64: string) {
  return base64.replaceAll('+', '-').replaceAll('/', '_').replace('=', '');
}

export function toBase64(base64url: string) {
  return `${base64url.replaceAll('-', '+').replaceAll('_', '/')}${'='.repeat((4 - (base64url.length % 4)) % 4)}`;
}
