"use client";

import { createContext, ReactNode, use, useCallback, useContext, useMemo, useState } from "react";

import type { AppConfigSnapshot } from "@/lib/app-config";
import { getErpConfig } from "./actions";

type ErpConfigContextValue = {
  config: AppConfigSnapshot;
  refreshConfig: () => Promise<AppConfigSnapshot>;
};

const ErpConfigContext = createContext<ErpConfigContextValue | null>(null);

export function ErpConfigProvider({
  children,
  configPromise,
}: {
  children: ReactNode;
  configPromise: Promise<AppConfigSnapshot>;
}) {
  const initialConfig = use(configPromise);
  const [config, setConfig] = useState(initialConfig);

  const refreshConfig = useCallback(async () => {
    const nextConfig = await getErpConfig();
    setConfig(nextConfig);
    return nextConfig;
  }, []);

  const value = useMemo(() => ({ config, refreshConfig }), [config, refreshConfig]);

  return <ErpConfigContext.Provider value={value}>{children}</ErpConfigContext.Provider>;
}

export function useConfig() {
  const context = useContext(ErpConfigContext);

  if (!context) {
    throw new Error("useConfig precisa ser usado dentro do ErpConfigProvider.");
  }

  return context;
}
