/**
 * Carrier-related React hooks
 * 
 * This module provides React hooks for carrier-related operations,
 * encapsulating common data fetching and state management logic.
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { listCarriersAction } from "@/modules/carrier/routes/list-carriers";
import { getUserCarrierAction } from "@/modules/carrier/routes/get-user-carrier";
import type { DeviceCarrier } from "@/modules/carrier/domain/carrier.types";

/**
 * Hook to get user's carriers
 */
export function useCarriers() {
  const { data: session, status } = useSession();
  const [carriers, setCarriers] = useState<DeviceCarrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarriers = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await listCarriersAction();

      if (result.success && result.data) {
        setCarriers(result.data);
      } else {
        setError(result.error || "Failed to fetch carriers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch carriers");
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchCarriers();
  }, [fetchCarriers]);

  return {
    carriers,
    loading,
    error,
    refetch: fetchCarriers,
  };
}

/**
 * Hook to get user's default or first carrier
 */
export function useUserCarrier() {
  const { data: session, status } = useSession();
  const [carrier, setCarrier] = useState<DeviceCarrier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarrier = useCallback(async () => {
    if (status !== "authenticated" || !session?.user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await getUserCarrierAction();
      
      if (result.success && result.data) {
        setCarrier(result.data);
      } else {
        setError(result.error || "Failed to fetch carrier");
        setCarrier(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch carrier");
      setCarrier(null);
    } finally {
      setLoading(false);
    }
  }, [session, status]);

  useEffect(() => {
    fetchCarrier();
  }, [fetchCarrier]);

  return {
    carrier,
    loading,
    error,
    refetch: fetchCarrier,
  };
}

