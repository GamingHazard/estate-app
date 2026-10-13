import rawMockProperties from "./mockProperties.json";
import type { Property } from "./property";

const mockProperties = rawMockProperties as Property[];

export function getMockProperties(): Property[] {
  return mockProperties;
}

export function validateMockProperties(
  properties: Property[] = mockProperties,
): void {
  const propertyIds = new Set<string>();
  const listingIds = new Set<string>();
  const typePurposes = new Map<string, Set<string>>();

  for (const property of properties) {
    if (propertyIds.has(property.id)) {
      throw new Error(`Duplicate mock property id: ${property.id}`);
    }
    propertyIds.add(property.id);

    if (property.listings.length !== 1) {
      throw new Error(`Expected one listing for ${property.id}`);
    }

    const listing = property.listings[0];
    if (listingIds.has(listing.id)) {
      throw new Error(`Duplicate mock listing id: ${listing.id}`);
    }
    listingIds.add(listing.id);

    const purposes =
      typePurposes.get(property.propertyType) ?? new Set<string>();
    purposes.add(listing.purpose);
    typePurposes.set(property.propertyType, purposes);

    for (const image of property.images) {
      if (!image.title || !image.url || !image.publicId) {
        throw new Error(`Incomplete image metadata for ${property.id}`);
      }
    }

    for (const unit of property.units) {
      for (const image of unit.images) {
        if (!image.title || !image.url || !image.publicId) {
          throw new Error(`Incomplete unit image metadata for ${property.id}`);
        }
      }
    }
  }

  if (properties.length !== 32 || typePurposes.size !== 16) {
    throw new Error(
      `Expected 32 properties across 16 types; received ${properties.length} properties across ${typePurposes.size} types`,
    );
  }

  for (const [propertyType, purposes] of typePurposes) {
    if (!purposes.has("rent") || !purposes.has("sale")) {
      throw new Error(`Missing rent or sale fixture for ${propertyType}`);
    }
  }
}

validateMockProperties();

export default mockProperties;
