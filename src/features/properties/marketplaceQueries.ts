import type { QueryFunctionContext } from "@tanstack/react-query";
import { getQueryFn } from "../../shared/queryClient";
import { parseDealListResponse } from "../../data/deal";

export const marketplacePropertiesQueryKey = [
  "properties",
  "marketplace",
] as const;

export const marketplacePropertiesQueryOptions = () => ({
  queryKey: marketplacePropertiesQueryKey,
  queryFn: getQueryFn<unknown>({ on401: "throw" }),
  staleTime: 5 * 60 * 1000,
});

export const marketplaceDealsQueryOptions = () => ({
  queryKey: ["deals", "marketplace"] as const,
  queryFn: async (context: QueryFunctionContext) =>
    parseDealListResponse(
      await getQueryFn<unknown>({
        on401: "returnNull",
        path: "/deals",
      })(context),
    ),
  staleTime: 30_000,
});
