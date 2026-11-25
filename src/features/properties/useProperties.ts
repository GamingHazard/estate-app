import { useQuery } from "@tanstack/react-query";
import { parsePropertyListResponse } from "../../data/property";
import { useAuth } from "../auth/AuthContext";
import { getQueryFn } from "../../shared/queryClient";
import { marketplacePropertiesQueryOptions } from "./marketplaceQueries";

export const managedPropertiesQueryKey = (userId?: string | null) =>
  ["properties", "marketplace", "manage", userId ?? null] as const;

export function useProperties() {
  return useQuery({
    ...marketplacePropertiesQueryOptions(),
    select: (response: unknown) =>
      parsePropertyListResponse(response).properties,
  });
}

export function useManagedProperties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: managedPropertiesQueryKey(user?.id),
    queryFn: getQueryFn({
      on401: "throw",
      authenticated: true,
      path: "/properties/marketplace/manage",
    }),
    enabled: Boolean(user?.id),
    staleTime: 0,
    refetchOnMount: "always",
    select: (response: unknown) =>
      parsePropertyListResponse(response).properties,
  });
}
