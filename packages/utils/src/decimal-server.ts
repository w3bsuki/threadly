import { Prisma } from "@repo/database";

export type Decimal = Prisma.Decimal;

export const decimalToNumber = (d: any): number => {
  if (!d) return 0;
  if (typeof d === "number") return d;
  if (typeof d === "string") return parseFloat(d) || 0;
  if (d.toNumber) return d.toNumber();
  return 0;
};

export const numberToDecimal = (n: any) => new Prisma.Decimal(n || 0);

export const formatDecimalAsCurrency = (d: any, currency = "USD", locale = "en-US"): string => {
  try {
    return new Intl.NumberFormat(locale, { style: "currency", currency }).format(decimalToNumber(d));
  } catch {
    return currency + " " + decimalToNumber(d).toFixed(2);
  }
};

export const addDecimals = (a: any, b: any) => new Prisma.Decimal(a || 0).add(new Prisma.Decimal(b || 0));
export const multiplyDecimals = (a: any, b: any) => new Prisma.Decimal(a || 0).mul(new Prisma.Decimal(b || 1));
export const calculatePercentage = (v: any, p: number) => new Prisma.Decimal(v || 0).mul(new Prisma.Decimal(p).div(100));
export const roundDecimal = (d: any, places = 2) => new Prisma.Decimal(d || 0).toDecimalPlaces(places);
