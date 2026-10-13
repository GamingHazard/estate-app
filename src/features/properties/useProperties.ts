import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { parsePropertyListResponse, Property } from "../../data/property";
import { getMockProperties } from "../../data/mockProperties";
import { adminPropertyStore } from "../../data/adminPropertyStore";
import { getQueryFn } from "../../shared/queryClient";

export function useProperties() {
  const useMockProperties =
    process.env.EXPO_PUBLIC_USE_MOCK_PROPERTIES === "true";
  const locallyPublishedProperties = useSyncExternalStore(
    adminPropertyStore.subscribeMarketplace,
    adminPropertyStore.getMarketplaceSnapshot,
    adminPropertyStore.getMarketplaceSnapshot,
  );

  const query = useQuery({
    queryKey: ["properties", "all", useMockProperties ? "mock" : "api"],
    queryFn: useMockProperties
      ? async () => ({ properties: getMockProperties() })
      : getQueryFn({ on401: "throw" }),
    select: (response: unknown) => {
      if (useMockProperties) {
        return (response as { properties: Property[] }).properties;
      }

      return parsePropertyListResponse(response).properties;
    },
  });

  const publicLocalProperties = locallyPublishedProperties.filter(
    (property) =>
      property.moderationStatus === "approved" &&
      property.listings.some((listing) => listing.status === "published"),
  );
  const existingIds = new Set(
    (query.data ?? []).map((property) => property.id),
  );

  return {
    ...query,
    data: [
      ...(query.data ?? []),
      ...publicLocalProperties.filter(
        (property) => !existingIds.has(property.id),
      ),
    ],
  };
}
