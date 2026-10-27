export function isCronAuthorized(header: string | null, secret: string | undefined): boolean {
  return Boolean(secret) && header === `Bearer ${secret}`;
}
