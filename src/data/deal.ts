import {
  parsePropertyListResponse,
  type Property,
  type PropertyListing,
} from "./property";

export type DealStatus = "draft" | "published" | "paused" | "removed";

export type Deal = {
  id: string;
  propertyId: string;
  listingId: string;
  title: string;
  description?: string;
  discount: { type: "percentage" | "fixed"; value: number };
  pricingSnapshot: {
    basePrice: number;
    dealPrice: number;
    currency: string;
    billingPeriod?: string;
  };
  status: DealStatus;
  featured: boolean;
  startsAt: string;
  endsAt?: string | null;
  createdAt?: string;
  isActive: boolean;
  property?: Property;
  listing?: PropertyListing;
};

export type DealListResponse = { deals: Deal[] };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export function parseDealListResponse(value: unknown): DealListResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("deals" in value) ||
    !Array.isArray(value.deals)
  ) {
    throw new Error("The deals API returned an invalid response.");
  }

  const deals = value.deals.map((entry) => {
    if (!isRecord(entry)) {
      throw new Error("The deals API returned an invalid deal.");
    }

    const raw = entry;
    const rawProperty =
      isRecord(raw.property) ? raw.property : null;
    const rawListing =
      isRecord(raw.listing) ? raw.listing : null;
    const rawDiscount = raw.discount;
    const rawPricingSnapshot = raw.pricingSnapshot;
    const id = raw.id ?? raw._id;
    if (
      typeof id !== "string" ||
      id.length === 0 ||
      typeof raw.title !== "string" ||
      typeof raw.startsAt !== "string" ||
      !isRecord(rawDiscount) ||
      (rawDiscount.type !== "percentage" && rawDiscount.type !== "fixed") ||
      typeof rawDiscount.value !== "number" ||
      !isRecord(rawPricingSnapshot) ||
      typeof rawPricingSnapshot.basePrice !== "number" ||
      typeof rawPricingSnapshot.dealPrice !== "number" ||
      typeof rawPricingSnapshot.currency !== "string"
    ) {
      throw new Error("The deals API returned an invalid deal.");
    }

    const discountType: "percentage" | "fixed" = rawDiscount.type;
    const status: DealStatus =
      raw.status === "published" ||
      raw.status === "paused" ||
      raw.status === "removed"
        ? raw.status
        : "draft";
    const property = rawProperty
      ? parsePropertyListResponse({
          properties: [
            {
              ...rawProperty,
              listings: rawListing ? [rawListing] : [],
            },
          ],
        }).properties[0]
      : undefined;
    const listing = property?.listings[0];

    return {
      id,
      propertyId: String(raw.propertyId ?? property?.id ?? ""),
      listingId: String(raw.listingId ?? listing?.id ?? ""),
      title: raw.title,
      description:
        typeof raw.description === "string" ? raw.description : undefined,
      discount: {
        type: discountType,
        value: rawDiscount.value,
      },
      pricingSnapshot: {
        basePrice: rawPricingSnapshot.basePrice,
        dealPrice: rawPricingSnapshot.dealPrice,
        currency: rawPricingSnapshot.currency,
        billingPeriod:
          typeof rawPricingSnapshot.billingPeriod === "string"
            ? rawPricingSnapshot.billingPeriod
            : undefined,
      },
      status,
      featured: raw.featured === true,
      startsAt: raw.startsAt,
      endsAt:
        typeof raw.endsAt === "string"
          ? raw.endsAt
          : raw.endsAt instanceof Date
            ? raw.endsAt.toISOString()
            : null,
      createdAt:
        typeof raw.createdAt === "string" ? raw.createdAt : undefined,
      isActive: raw.isActive === true,
      property,
      listing,
    };
  });

  return { deals };
}

export const formatDealMoney = (amount: number, currency = "USD") =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);

export const getDealTimeRemaining = (
  endsAt?: string | null,
  now = Date.now(),
) => {
  if (!endsAt) return "No end date";
  const endTime = new Date(endsAt).getTime();
  if (!Number.isFinite(endTime)) return "End date unavailable";

  const remainingMinutes = Math.ceil((endTime - now) / 60_000);
  if (remainingMinutes <= 0) return "Ended";

  const days = Math.floor(remainingMinutes / (60 * 24));
  const hours = Math.floor((remainingMinutes % (60 * 24)) / 60);
  const minutes = remainingMinutes % 60;
  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
};
