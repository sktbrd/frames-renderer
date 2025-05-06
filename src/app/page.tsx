"use client";

import { useState } from "react";
import FrameRenderer from "./components/FrameRenderer";
import ConnectWalletFarcaster from "./components/ConnectWalletFarcaster";
// Remove problematic FarcasterLogin import
// import FarcasterLogin from "./components/FarcasterLogin";
// import { useAuth } from "./providers";

export default function Home() {
  const [frameUrl, setFrameUrl] = useState<string>("");
  const [currentUrl, setCurrentUrl] = useState<string>("");
  // Simulate authenticated state for demo
  const isConnected = true;
  const fid = 123456; // Demo FID

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentUrl(frameUrl);
  };

  return (
    <div
      style={{ backgroundColor: "white", color: "#333" }}
      className="min-h-screen"
    >
      <div
        style={{ maxWidth: "800px", margin: "0 auto", padding: "32px 16px" }}
      >
        <header style={{ textAlign: "center", marginBottom: "32px" }}>
          <h1
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#4a63c4",
              marginBottom: "8px",
            }}
          >
            Farcaster Frame Viewer
          </h1>
          <p style={{ color: "#666" }}>
            Explore and interact with Farcaster frames
          </p>
        </header>

        {/* Connect Wallet & Farcaster */}
        <ConnectWalletFarcaster />

        {/* Status indicator */}
        <div style={{ maxWidth: "500px", margin: "0 auto 24px auto" }}>
          <div
            style={{
              backgroundColor: "#e6f0ff",
              border: "1px solid #ccdeff",
              borderRadius: "8px",
              padding: "16px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  backgroundColor: "#4ade80",
                  borderRadius: "50%",
                }}
              ></div>
              <span style={{ fontSize: "14px", fontWeight: "500" }}>
                Demo Mode: Connected as FID {fid}
              </span>
            </div>
          </div>
        </div>

        {/* URL Input Form */}
        <div
          style={{
            maxWidth: "500px",
            margin: "0 auto 32px auto",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "600",
              marginBottom: "16px",
              color: "#333",
            }}
          >
            Load a Frame
          </h2>
          <form onSubmit={handleSubmit}>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="url"
                value={frameUrl}
                onChange={(e) => setFrameUrl(e.target.value)}
                placeholder="Enter a Farcaster frame URL (e.g., https://gnars.com)"
                style={{
                  padding: "12px",
                  width: "100%",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                }}
                required
              />
              <button
                type="submit"
                style={{
                  padding: "12px",
                  backgroundColor: "#4361ee",
                  color: "white",
                  borderRadius: "6px",
                  fontWeight: "500",
                  border: "none",
                }}
              >
                Load Frame
              </button>
            </div>
          </form>
        </div>

        {/* Frame Renderer */}
        {currentUrl ? (
          <div
            style={{
              maxWidth: "500px",
              margin: "0 auto",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <h2
              style={{
                fontSize: "18px",
                fontWeight: "600",
                marginBottom: "16px",
                color: "#333",
              }}
            >
              Frame Preview
            </h2>
            <FrameRenderer
              frameUrl={currentUrl}
              isConnected={isConnected}
              fid={fid}
            />
          </div>
        ) : (
          <div
            style={{
              maxWidth: "500px",
              margin: "0 auto",
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "32px 20px",
              textAlign: "center",
            }}
          >
            <p style={{ color: "#6b7280" }}>
              Enter a frame URL above to preview it here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
