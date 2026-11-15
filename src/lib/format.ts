export function formatCredits(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatPct(n: number | null): string {
  if (n == null) return "—";
  return `${Math.round(n * 100)}%`;
}

export function formatUsd(n: number): string {
  if (n === 0) return "$0";
  if (n < 0.0001) return `$${n.toExponential(2)}`;
  if (n < 0.01) return `$${n.toFixed(6)}`;
  return `$${n.toFixed(4)}`;
}

export function formatKwh(n: number): string {
  if (n === 0) return "0 kWh";
  if (n < 0.000001) return `${(n * 1e6).toFixed(3)} µkWh`;
  if (n < 0.001) return `${(n * 1000).toFixed(4)} Wh`;
  return `${n.toFixed(6)} kWh`;
}

export function formatCo2(n: number): string {
  if (n < 0.001) return `${(n * 1000).toFixed(3)} mg`;
  if (n < 1) return `${n.toFixed(3)} g`;
  return `${n.toFixed(2)} g`;
}

export function formatWater(n: number): string {
  if (n < 0.01) return `${(n * 1000).toFixed(2)} µL`;
  if (n < 1) return `${n.toFixed(3)} mL`;
  return `${n.toFixed(2)} mL`;
}

export function formatWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString();
}
