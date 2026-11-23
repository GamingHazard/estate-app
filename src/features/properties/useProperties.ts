import { useQuery } from "@tanstack/react-query";
import { parsePropertyListResponse } from "../../data/property";
import { getQueryFn } from "../../shared/queryClient";

export function useProperties() {
  return useQuery({
    queryKey: ["properties", "marketplace"],
    queryFn: getQueryFn({ on401: "throw" }),
    select: (response: unknown) =>
      parsePropertyListResponse(response).properties,
  });
}

export function useManagedProperties() {
  return useQuery({
    queryKey: ["properties", "marketplace", "manage"],
    queryFn: getQueryFn({ on401: "throw", authenticated: true }),
    staleTime: 0,
    refetchOnMount: "always",
    select: (response: unknown) =>
      parsePropertyListResponse(response).properties,
  });
}
