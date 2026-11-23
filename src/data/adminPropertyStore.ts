import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  MarketplacePropertyDraft,
  MarketplacePropertyRecord,
} from "./property";

export type PropertyImage = {
  url: string;
  public_id: string;
};

export type PropertySpecification = {
  title: string;
  value: string;
};

export type UnitSpecification = {
  label: string;
  value: string;
};

export type UnitImage = {
  name: string;
  url: string;
  public_id: string;
};

export type PropertyUnit = {
  unitNumber: string;
  rent: number;
  unitType: string;
  specifications: UnitSpecification[];
  images: UnitImage[];
};

export type PropertyPolicies = {
  petPolicy: {
    allowed: boolean;
    details: string;
  };
  parkingPolicy: {
    allowed: boolean;
    details: string;
  };
  leasePolicy: string;
  otherPolicies: Array<{
    title: string;
    body: string;
  }>;
};

export type AdminProperty = {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  category: string;
  estate: string;
  price_per_unit: string;
  propertyType: string;
  geography: string;
  description: string;
  images: PropertyImage[];
  features: string[];
  specifications: PropertySpecification[];
  location: { lat: number; lng: number };
  zoning: string;
  annualPropertyTaxes: number;
  annualInsurance: number;
  appraisedValue: number;
  noi: number;
  capRate: number;
  lastAppraisalDate: string;
  units_available: number;
  customizeUnits: boolean;
  autoGenerateUnitNumbers: boolean;
  customUnitNumbers: string;
  detailedUnits: PropertyUnit[];
  permittedUses: string[];
  serviceFee: number;
  policies: PropertyPolicies;
  tenants: string[];
  payments: string[];
  units: Array<string | PropertyUnit>;
  owner?: string;
  status: "active" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
};

export type PropertyDraft = Omit<
  AdminProperty,
  "id" | "status" | "createdAt" | "updatedAt"
>;

export const adaptAdminPropertyForMarketplace = (
  property: AdminProperty,
): MarketplacePropertyRecord => {
  const price = Number(property.price_per_unit) || 0;
  const status =
    property.status === "active"
      ? "published"
      : property.status === "rejected"
        ? "closed"
        : "draft";
  const specifications = property.specifications.map((item) => ({
    title: item.title,
    value: item.value,
  }));
  const units = property.detailedUnits.map((unit) => ({
    unitNumber: unit.unitNumber,
    rent: unit.rent,
    unitType: unit.unitType,
    description: "",
    price: unit.rent,
    currency: "UGX",
    billingPeriod: "monthly" as const,
    isAvailable: true,
    specifications: unit.specifications.map((item) => ({
      title: item.label,
      value: item.value,
    })),
    images: unit.images.map((image) => ({
      title: image.name,
      url: image.url,
      publicId: image.public_id,
    })),
  }));

  return {
    id: property.id,
    name: property.name,
    address: property.address,
    city: property.city,
    country: property.country,
    category: property.category,
    estate: property.estate,
    pricePerUnit: price,
    propertyType: property.propertyType,
    description: property.description,
    images: property.images.map((image) => ({
      url: image.url,
      publicId: image.public_id,
    })),
    features: property.features,
    specifications,
    location: property.location,
    policies: {
      pets: property.policies.petPolicy,
      parking: property.policies.parkingPolicy,
      lease: property.policies.leasePolicy,
      other: property.policies.otherPolicies,
    },
    serviceFee: property.serviceFee,
    unitsAvailable: property.units_available,
    customizeUnits: property.customizeUnits,
    units,
    listings: [
      {
        id: `${property.id}-local-listing`,
        propertyId: property.id,
        purpose: "rent",
        status,
        price,
        currency: "UGX",
        billingPeriod: "monthly",
        createdAt: property.createdAt,
        updatedAt: property.updatedAt,
      },
    ],
    moderationStatus:
      property.status === "active"
        ? "approved"
        : property.status === "rejected"
          ? "rejected"
          : "pending",
    createdAt: property.createdAt,
    updatedAt: property.updatedAt,
  };
};

const listeners = new Set<() => void>();
const PROPERTY_STORAGE_KEY = "admin-properties";
const MARKETPLACE_PROPERTY_STORAGE_KEY = "marketplace-properties";
const LEGACY_SEEDED_PROPERTY_IDS = new Set(["1", "2", "3"]);
let properties: AdminProperty[] = [];
let hasLocalMutation = false;
let hydrationPromise: Promise<void>;
const marketplaceListeners = new Set<() => void>();
let marketplaceProperties: MarketplacePropertyRecord[] = [];
let marketplaceHydrationPromise: Promise<void>;

const notify = () => listeners.forEach((listener) => listener());

const persist = async () => {
  await hydrationPromise;
  await AsyncStorage.setItem(PROPERTY_STORAGE_KEY, JSON.stringify(properties));
};

const hydrate = async () => {
  try {
    const storedProperties = await AsyncStorage.getItem(PROPERTY_STORAGE_KEY);

    if (storedProperties && !hasLocalMutation) {
      const parsedProperties: unknown = JSON.parse(storedProperties);

      if (Array.isArray(parsedProperties)) {
        properties = parsedProperties.filter(
          (property): property is AdminProperty =>
            typeof property === "object" &&
            property !== null &&
            "id" in property &&
            typeof property.id === "string" &&
            !LEGACY_SEEDED_PROPERTY_IDS.has(property.id),
        );
        notify();

        if (properties.length !== parsedProperties.length) {
          await AsyncStorage.setItem(
            PROPERTY_STORAGE_KEY,
            JSON.stringify(properties),
          );
        }
      }
    }
  } catch (error) {
    console.error("Unable to restore saved properties:", error);
  }
};

hydrationPromise = hydrate();

const hydrateMarketplace = async () => {
  try {
    const storedProperties = await AsyncStorage.getItem(
      MARKETPLACE_PROPERTY_STORAGE_KEY,
    );
    if (storedProperties) {
      const parsedProperties: unknown = JSON.parse(storedProperties);
      if (Array.isArray(parsedProperties)) {
        marketplaceProperties = parsedProperties as MarketplacePropertyRecord[];
        marketplaceListeners.forEach((listener) => listener());
      }
    }
  } catch (error) {
    console.error("Unable to restore marketplace properties:", error);
  }
};

marketplaceHydrationPromise = hydrateMarketplace();

const persistMarketplace = async () => {
  await marketplaceHydrationPromise;
  await AsyncStorage.setItem(
    MARKETPLACE_PROPERTY_STORAGE_KEY,
    JSON.stringify(marketplaceProperties),
  );
};

export const adminPropertyStore = {
  getSnapshot: () => properties,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  create: (draft: PropertyDraft): AdminProperty => {
    const now = new Date().toISOString();
    const property: AdminProperty = {
      ...draft,
      id: `property-${Date.now()}`,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };
    properties = [property, ...properties];
    hasLocalMutation = true;
    notify();
    void persist().catch((error) =>
      console.error("Unable to save created property:", error),
    );
    return property;
  },
  update: (id: string, updates: Partial<AdminProperty>) => {
    properties = properties.map((property) =>
      property.id === id
        ? {
            ...property,
            ...updates,
            updatedAt: new Date().toISOString(),
          }
        : property,
    );
    hasLocalMutation = true;
    notify();
    void persist().catch((error) =>
      console.error("Unable to save updated property:", error),
    );
  },
  remove: (id: string) => {
    properties = properties.filter((property) => property.id !== id);
    hasLocalMutation = true;
    notify();
    void persist().catch((error) =>
      console.error("Unable to save removed property:", error),
    );
  },
  updateStatus: (id: string, status: AdminProperty["status"]) => {
    properties = properties.map((property) =>
      property.id === id
        ? { ...property, status, updatedAt: new Date().toISOString() }
        : property,
    );
    hasLocalMutation = true;
    notify();
    void persist().catch((error) =>
      console.error("Unable to save property status:", error),
    );
  },
  getById: (id: string) => properties.find((property) => property.id === id),
  getMarketplaceSnapshot: () => marketplaceProperties,
  subscribeMarketplace: (listener: () => void) => {
    marketplaceListeners.add(listener);
    return () => marketplaceListeners.delete(listener);
  },
  createMarketplace: (
    draft: MarketplacePropertyDraft,
  ): MarketplacePropertyRecord => {
    const now = new Date().toISOString();
    const id = `marketplace-property-${Date.now()}`;
    const listing = draft.listings[0];
    const property: MarketplacePropertyRecord = {
      ...draft,
      id,
      listings: draft.listings.map((item) => ({
        ...item,
        propertyId: id,
      })),
      pricePerUnit: listing?.price ?? 0,
      unitsAvailable:
        draft.units.filter((unit) => unit.isAvailable).length || 1,
      moderationStatus: "approved",
      createdAt: now,
      updatedAt: now,
    };
    marketplaceProperties = [property, ...marketplaceProperties];
    marketplaceListeners.forEach((listener) => listener());
    void persistMarketplace().catch((error) =>
      console.error("Unable to save marketplace property:", error),
    );
    return property;
  },
  updateMarketplace: (
    id: string,
    updates: Partial<MarketplacePropertyRecord>,
  ) => {
    marketplaceProperties = marketplaceProperties.map((property) =>
      property.id === id
        ? { ...property, ...updates, updatedAt: new Date().toISOString() }
        : property,
    );
    marketplaceListeners.forEach((listener) => listener());
    void persistMarketplace().catch((error) =>
      console.error("Unable to update marketplace property:", error),
    );
  },
  updateMarketplaceModeration: (
    id: string,
    moderationStatus: MarketplacePropertyRecord["moderationStatus"],
    moderationReason?: string,
  ) => {
    marketplaceProperties = marketplaceProperties.map((property) =>
      property.id === id
        ? {
            ...property,
            moderationStatus,
            moderationReason,
            updatedAt: new Date().toISOString(),
          }
        : property,
    );
    marketplaceListeners.forEach((listener) => listener());
    void persistMarketplace().catch((error) =>
      console.error("Unable to update marketplace moderation:", error),
    );
  },
  removeMarketplace: (id: string) => {
    marketplaceProperties = marketplaceProperties.filter(
      (property) => property.id !== id,
    );
    marketplaceListeners.forEach((listener) => listener());
    void persistMarketplace().catch((error) =>
      console.error("Unable to remove marketplace property:", error),
    );
  },
};
