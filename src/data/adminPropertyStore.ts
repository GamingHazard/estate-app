import {
  mockProperties as seedProperties,
  Property as SeedProperty,
} from "./mockProperties";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const listeners = new Set<() => void>();

const toAdminProperty = (property: SeedProperty): AdminProperty => ({
  id: property.id,
  name: property.title,
  address: property.location,
  city: property.location,
  country: "",
  category: property.type,
  estate: "",
  price_per_unit: String(property.price),
  propertyType: property.type,
  geography: property.location,
  description: property.description,
  images: [property.mainImage, ...property.images].map((url, index) => ({
    url,
    public_id: `seed-${property.id}-${index}`,
  })),
  features: [],
  specifications: [
    { title: "Bedrooms", value: String(property.bedrooms) },
    { title: "Bathrooms", value: String(property.bathrooms) },
    { title: "Area", value: `${property.area} sq ft` },
  ],
  location: { lat: 0, lng: 0 },
  zoning: "",
  annualPropertyTaxes: 0,
  annualInsurance: 0,
  appraisedValue: property.price,
  noi: 0,
  capRate: 0,
  lastAppraisalDate: property.updatedAt,
  units_available: 0,
  customizeUnits: false,
  autoGenerateUnitNumbers: true,
  customUnitNumbers: "",
  detailedUnits: [],
  permittedUses: [],
  serviceFee: 0,
  policies: {
    petPolicy: { allowed: false, details: "" },
    parkingPolicy: { allowed: false, details: "" },
    leasePolicy: "",
    otherPolicies: [],
  },
  tenants: [],
  payments: [],
  units: [],
  owner: property.agent.id,
  status: property.status,
  createdAt: property.createdAt,
  updatedAt: property.updatedAt,
});

let properties: AdminProperty[] = seedProperties.map(toAdminProperty);
const PROPERTY_STORAGE_KEY = "admin-properties";
let hasLocalMutation = false;
let hydrationPromise: Promise<void>;

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
        properties = parsedProperties as AdminProperty[];
        notify();
      }
    }
  } catch (error) {
    console.error("Unable to restore saved properties:", error);
  }
};

hydrationPromise = hydrate();

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
};
