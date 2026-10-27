const km = new Intl.NumberFormat("es-MX");

export function kmText(n: number): string {
  return `${km.format(n)} km`;
}

export function dateText(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
