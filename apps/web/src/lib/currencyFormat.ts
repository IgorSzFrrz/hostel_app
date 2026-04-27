export function formatBRL(value: string | number, locale: string): string {
  const amount = typeof value === "string" ? Number(value) : value;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(amount);
}
