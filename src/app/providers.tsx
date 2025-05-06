"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AuthKitProvider } from "@farcaster/auth-kit";
import type { UseSignInData } from "@farcaster/auth-kit";
import { mainnet, optimism, base } from "viem/chains";
import { WagmiConfig, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Note: Replace with your own project details in production
const config = {
  relay: "https://relay.farcaster.xyz",
  rpcUrl: "https://mainnet.optimism.io",
  domain:
    typeof window !== "undefined" ? window.location.host : "localhost:3000",
  siweUri:
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost:3000",
};

// Set up wagmi config
const wagmiConfig = createConfig({
  chains: [mainnet, optimism, base],
  connectors: [injected()],
  transports: {
    [mainnet.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
  },
});

// Create our Auth context
type AuthContextType = {
  isConnected: boolean;
  fid: number | null;
  username: string | null;
  pfp: string | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isConnected: false,
  fid: null,
  username: null,
  pfp: null,
  loading: true,
});

// Custom hook to use auth
export const useAuth = () => useContext(AuthContext);

export function Providers({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthContextType>({
    isConnected: false,
    fid: null,
    username: null,
    pfp: null,
    loading: true,
  });

  const [queryClient] = useState(() => new QueryClient());

  // Listen for auth state changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAuthSuccess = (event: CustomEvent<UseSignInData>) => {
      const userData = event.detail;
      setAuthState({
        isConnected: true,
        fid: userData.fid ?? null,
        username: userData.username || null,
        pfp: null, // Avatar URL not directly available in UseSignInData
        loading: false,
      });
    };

    const handleAuthError = (event: CustomEvent<Error>) => {
      console.error("Auth error:", event.detail);
      setAuthState({
        isConnected: false,
        fid: null,
        username: null,
        pfp: null,
        loading: false,
      });
    };

    // Add event listeners
    window.addEventListener("auth_success", handleAuthSuccess as EventListener);
    window.addEventListener("auth_error", handleAuthError as EventListener);

    return () => {
      // Clean up event listeners
      window.removeEventListener(
        "auth_success",
        handleAuthSuccess as EventListener
      );
      window.removeEventListener(
        "auth_error",
        handleAuthError as EventListener
      );
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <WagmiConfig config={wagmiConfig}>
        <AuthKitProvider
          config={{
            domain: config.domain,
            siweUri: config.siweUri,
            relay: config.relay,
            rpcUrl: config.rpcUrl,
            version: "v1",
          }}
        >
          <AuthContext.Provider value={authState}>
            {children}
          </AuthContext.Provider>
        </AuthKitProvider>
      </WagmiConfig>
    </QueryClientProvider>
  );
}
