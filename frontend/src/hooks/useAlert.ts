// アラート（在庫不足商品）状態管理フック
"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import type { AlertItem } from "@/types";

export const useAlert = () => {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get<AlertItem[]>("/api/v1/alerts/");
      setAlerts(data);
    } catch {
      setAlerts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return { alerts, isLoading, refetch: fetchAlerts };
};
