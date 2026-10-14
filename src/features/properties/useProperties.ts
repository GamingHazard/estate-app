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
  const marketplaceQuery = useQuery({
    queryKey: ["properties", "marketplace"],
    queryFn: useMockProperties
      ? async () => ({ properties: [] as Property[] })
      : getQueryFn({ on401: "throw" }),
    enabled: !useMockProperties,
    select: (response: unknown) =>
      parsePropertyListResponse(response).properties,
  });

  const publicLocalProperties = locallyPublishedProperties.filter(
    (property) =>
      property.moderationStatus === "approved" &&
      property.listings.some((listing) => listing.status === "published"),
  );
  const existingIds = new Set(
    [...(query.data ?? []), ...(marketplaceQuery.data ?? [])].map(
      (property) => property.id,
    ),
  );
  const properties = [
    ...(query.data ?? []),
    ...(marketplaceQuery.data ?? []).filter(
      (property) => !query.data?.some((item) => item.id === property.id),
    ),
    ...publicLocalProperties.filter((property) => !existingIds.has(property.id)),
  ];

  return {
    ...query,
    data: properties,
    isLoading: query.isLoading || marketplaceQuery.isLoading,
    isFetching: query.isFetching || marketplaceQuery.isFetching,
    isError: query.isError || marketplaceQuery.isError,
    error: query.error ?? marketplaceQuery.error,
    refetch: async () => {
      await Promise.all([query.refetch(), marketplaceQuery.refetch()]);
    },
  };
}
