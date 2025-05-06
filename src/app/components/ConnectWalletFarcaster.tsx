import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useAuth } from "../providers";
import { useState } from "react";

export default function ConnectWalletFarcaster() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isLoading: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();
  const auth = useAuth();
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      if (!isConnected) {
        const injectedConnector = connectors.find(
          (conn) => conn.name === "Injected"
        );
        if (injectedConnector) {
          await connect({ connector: injectedConnector });
        } else {
          alert("No injected wallet connector found.");
        }
      }
      // Farcaster sign-in handled by AuthKitProvider UI (see providers.tsx)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3 mb-6">
      {isConnected && auth.isConnected ? (
        <div className="flex flex-col items-center gap-1">
          <span className="text-green-600 font-medium">
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <span className="text-blue-600 font-medium">
            Farcaster: {auth.username || `FID ${auth.fid}`}
          </span>
          <button
            className="bg-gray-200 px-3 py-1 rounded mt-2"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
          onClick={handleConnect}
          disabled={loading || isConnecting}
        >
          {loading || isConnecting
            ? "Connecting..."
            : "Connect Wallet & Farcaster"}
        </button>
      )}
      <div className="flex gap-2 mt-2">
        <button
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          onClick={() =>
            alert("Add Notifications clicked! (implement logic here)")
          }
        >
          Add Notifications
        </button>
        <button
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
          onClick={() => alert("Add Frame clicked! (implement logic here)")}
        >
          Add Frame
        </button>
      </div>
    </div>
  );
}
