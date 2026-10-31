import { categories } from "@/lib/categories";

const blockedTerms = [
  "scam", "phishing", "malware", "ransomware", "porn", "xxx", "escort",
  "onlyfans", "weapon", "firearm", "gun for sale", "bomb"
];

function containsBlockedTerm(value: string): boolean {
  const normalized = value.toLowerCase();
  return blockedTerms.some((term) => normalized.includes(term));
}

export function cleanText(value: unknown, maxLength: number): string {
  if (typeof value !== "string") throw new Error("Please complete all required fields.");
  const text = value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/<[^>]*>/g, "").trim();
  if (!text || text.length > maxLength) throw new Error(`Text must be between 1 and ${maxLength} characters.`);
  if (containsBlockedTerm(text)) {
    throw new Error("This submission contains content that is not allowed.");
  }
  return text;
}

export function cleanUrl(value: unknown): string {
  if (typeof value !== "string" || value.length > 2048) throw new Error("Enter a valid HTTPS website URL.");
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid HTTPS website URL.");
  }
  if (url.protocol !== "https:" || !url.hostname || url.username || url.password) {
    throw new Error("Only public HTTPS website URLs are accepted.");
  }
  if (containsBlockedTerm(url.toString())) throw new Error("This submission contains content that is not allowed.");
  return url.toString();
}

export function cleanCategory(value: unknown): string {
  if (typeof value !== "string" || !categories.some((category) => category.slug === value)) {
    throw new Error("Choose a valid category.");
  }
  return value;
}

export function cleanEmail(value: unknown): string {
  if (typeof value !== "string" || value.length > 254) throw new Error("Enter a valid email address.");
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  return email;
}

export function cleanAmount(value: unknown): number {
  const amount = typeof value === "number" ? value : Number(value);
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 1_000_000) {
    throw new Error("Amount must be a whole number between $1 and $1,000,000.");
  }
  return amount;
}
