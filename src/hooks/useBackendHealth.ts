"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { checkBackendHealth } from "@/services/healthService";

export function useBackendHealth(intervalMs: number = 10000) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const check = useCallback(async () => {
    setChecking(true);
    const result = await checkBackendHealth();
    setIsConnected(result);
    setChecking(false);
  }, []);

  useEffect(() => {
    check();
    intervalRef.current = setInterval(check, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [check, intervalMs]);

  return { isConnected, checking };
}
