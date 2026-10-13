export type ApiPropertyImage = {
  _id?: string;
  title?: string;
  public_id?: string;
  url: string;
};

export type ApiPropertySpecification = {
  _id?: string;
  title: string;
  value: string;
  default?: unknown[];
};

export type ApiPropertyUnit = {
  _id?: string;
  unitNumber: string;
  rent: number;
  unitType: string;
  description?: string;
  price?: number;
  currency?: string;
  billingPeriod?: BillingPeriod;
  isAvailable?: boolean;
  specifications?: ApiPropertySpecification[];
  images?: ApiPropertyImage[];
};

export type ListingPurpose = "rent" | "sale";
export type ListingStatus = "draft" | "published" | "paused" | "closed";
export type BillingPeriod = "weekly" | "monthly" | "yearly" | "one-time";

export type ApiPropertyListing = {
  _id?: string;
  property?: string;
  propertyId?: string;
  purpose: ListingPurpose;
  status: ListingStatus;
  price: number;
  currency: string;
  billingPeriod?: BillingPeriod;
  serviceFee?: number;
  negotiable?: boolean;
  availableFrom?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ApiPropertyPolicies = {
  pets?: { allowed?: boolean; details?: string };
  parking?: { allowed?: boolean; details?: string };
  lease?: string;
  other?: Array<{ title?: string; body?: string }>;
  petPolicy?: { allowed?: boolean; details?: string };
  parkingPolicy?: { allowed?: boolean; details?: string };
  leasePolicy?: string;
  otherPolicies?: Array<{ title?: string; body?: string }>;
};

export type ApiProperty = {
  _id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  category: string;
  estate: string;
  price_per_unit: string | number;
  propertyType: string;
  description: string;
  images?: ApiPropertyImage[];
  features?: string[];
  specifications?: ApiPropertySpecification[];
  location: { lat: number; lng: number };
  policies?: ApiPropertyPolicies;
  serviceFee?: number;
  units_available?: number;
  customizeUnits?: boolean;
  units?: ApiPropertyUnit[];
  listings?: ApiPropertyListing[];
  owner?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PropertyImage = {
  id?: string;
  title?: string;
  publicId?: string;
  url: string;
};

export type PropertySpecification = {
  id?: string;
  title: string;
  value: string;
  default?: unknown[];
};

export type PropertyUnit = {
  id?: string;
  propertyId?: string;
  unitNumber: string;
  rent: number;
  unitType: string;
  description?: string;
  price?: number;
  currency?: string;
  billingPeriod?: BillingPeriod;
  isAvailable: boolean;
  specifications: PropertySpecification[];
  images: PropertyImage[];
};

export type PropertyListing = {
  id: string;
  propertyId: string;
  purpose: ListingPurpose;
  status: ListingStatus;
  price: number;
  currency: string;
  billingPeriod?: BillingPeriod;
  serviceFee?: number;
  negotiable?: boolean;
  availableFrom?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type PropertyPolicies = ApiPropertyPolicies;

export type Property = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  category: string;
  estate: string;
  pricePerUnit: number;
  propertyType: string;
  description: string;
  images: PropertyImage[];
  features: string[];
  specifications: PropertySpecification[];
  location: { lat: number; lng: number };
  policies?: PropertyPolicies;
  serviceFee?: number;
  unitsAvailable: number;
  customizeUnits: boolean;
  units: PropertyUnit[];
  listings: PropertyListing[];
  ownerId?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ModerationStatus = "pending" | "approved" | "rejected";

export type MarketplacePropertyDraft = Omit<
  Property,
  "id" | "pricePerUnit" | "unitsAvailable" | "createdAt" | "updatedAt"
> & {
  ownerId?: string;
  moderationStatus?: ModerationStatus;
};

export type MarketplacePropertyRecord = Property & {
  moderationStatus: ModerationStatus;
  moderationReason?: string;
};

export type PropertyListResponse = {
  properties: Property[];
};

const mapImage = (image: ApiPropertyImage): PropertyImage => ({
  id: image._id,
  title: image.title,
  publicId: image.public_id,
  url: image.url,
});

const mapSpecification = (
  specification: ApiPropertySpecification,
): PropertySpecification => ({
  id: specification._id,
  title: specification.title,
  value: specification.value,
  default: specification.default,
});

const mapUnit = (unit: ApiPropertyUnit): PropertyUnit => ({
  id: unit._id,
  propertyId: undefined,
  unitNumber: unit.unitNumber,
  rent: Number(unit.rent),
  unitType: unit.unitType,
  description: unit.description,
  price: unit.price,
  currency: unit.currency,
  billingPeriod: unit.billingPeriod,
  isAvailable: unit.isAvailable ?? true,
  specifications: (unit.specifications ?? []).map(mapSpecification),
  images: (unit.images ?? []).map(mapImage),
});

const mapProperty = (property: ApiProperty): Property => ({
  id: property._id,
  name: property.name,
  address: property.address,
  city: property.city,
  country: property.country,
  category: property.category,
  estate: property.estate,
  pricePerUnit: Number(property.price_per_unit),
  propertyType: property.propertyType,
  description: property.description,
  images: (property.images ?? []).map(mapImage),
  features: property.features ?? [],
  specifications: (property.specifications ?? []).map(mapSpecification),
  location: property.location,
  policies: property.policies,
  serviceFee: property.serviceFee,
  unitsAvailable: property.units_available ?? 0,
  customizeUnits: property.customizeUnits ?? false,
  units: (property.units ?? []).map(mapUnit),
  listings: (property.listings ?? []).map((listing) => ({
    id: listing._id ?? `${property._id}-${listing.purpose}`,
    propertyId: listing.propertyId ?? listing.property ?? property._id,
    purpose: listing.purpose,
    status: listing.status,
    price: Number(listing.price),
    currency: listing.currency,
    billingPeriod: listing.billingPeriod,
    serviceFee: listing.serviceFee,
    negotiable: listing.negotiable,
    availableFrom: listing.availableFrom,
    publishedAt: listing.publishedAt,
    createdAt:
      listing.createdAt ?? property.createdAt ?? new Date(0).toISOString(),
    updatedAt:
      listing.updatedAt ?? property.updatedAt ?? new Date(0).toISOString(),
  })),
  ownerId: property.owner,
  createdAt: property.createdAt,
  updatedAt: property.updatedAt,
});

export function parsePropertyListResponse(
  value: unknown,
): PropertyListResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !("properties" in value) ||
    !Array.isArray(value.properties)
  ) {
    throw new Error("The property API returned an invalid response.");
  }

  return {
    properties: (value.properties as ApiProperty[]).map(mapProperty),
  };
}

export function getPropertyDisplayLocation(property: Property): string {
  return [property.address, property.estate, property.city, property.country]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");
}

export function getSpecificationValue(
  specifications: PropertySpecification[],
  ...names: string[]
): string | undefined {
  const normalizedNames = names.map((name) => name.toLowerCase());
  return specifications.find((specification) =>
    normalizedNames.includes(specification.title.trim().toLowerCase()),
  )?.value;
}

export function formatPropertyPrice(amount: number): string {
  return amount.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function getPublishedListing(
  property: Property,
): PropertyListing | undefined {
  return (
    property.listings.find((listing) => listing.status === "published") ??
    property.listings[0]
  );
}

export function formatListingPrice(listing?: PropertyListing): string {
  if (!listing) return "Price on request";

  return listing.price.toLocaleString("en-US", {
    style: "currency",
    currency: listing.currency || "USD",
    maximumFractionDigits: 0,
  });
}

export function getListingPriceLabel(listing?: PropertyListing): string {
  if (!listing) return "Price on request";

  const price = formatListingPrice(listing);
  if (listing.purpose === "sale" || !listing.billingPeriod) return price;

  return `${price} / ${listing.billingPeriod.replace("one-time", "sale")}`;
}

export function getPropertyCardFacts(property: Property): string[] {
  const specifications = [
    ...property.specifications,
    ...(property.units[0]?.specifications ?? []),
  ];
  const titlesByType: Record<string, string[]> = {
    residential: ["Bedrooms", "Bathrooms", "Square Feet", "Area"],
    commercial: [
      "Total Square Feet",
      "Square Feet",
      "Floors",
      "Number of Floors",
      "Loading Docks",
    ],
    land: ["Total Acreage", "Acreage", "Zoning Classification", "Frontage"],
    special: ["Total Area", "Parking Capacity", "Storage Units", "Classrooms"],
  };
  const priority = titlesByType[property.category] ?? [];
  const facts: string[] = [];

  for (const title of priority) {
    const specification = specifications.find(
      (item) => item.title.trim().toLowerCase() === title.toLowerCase(),
    );
    if (specification?.value && !facts.includes(specification.value)) {
      facts.push(specification.value);
    }
    if (facts.length === 3) return facts;
  }

  for (const specification of specifications) {
    if (specification.value && !facts.includes(specification.value)) {
      facts.push(specification.value);
    }
    if (facts.length === 3) break;
  }

  return facts;
}
