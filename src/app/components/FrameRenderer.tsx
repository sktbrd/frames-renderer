"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import FrameActionModal from "./FrameActionModal";

interface FrameRendererProps {
  frameUrl: string;
  isConnected?: boolean;
  fid?: number | null;
}

interface FrameMetadata {
  image: string | null;
  title: string | null;
  buttons: { label: string; action: string }[];
  inputText: boolean;
  error: string | null;
  loading: boolean;
  postUrl?: string;
}

export default function FrameRenderer({
  frameUrl,
  isConnected = false,
  fid = null,
}: FrameRendererProps) {
  const [frameData, setFrameData] = useState<FrameMetadata>({
    image: null,
    title: null,
    buttons: [],
    inputText: false,
    error: null,
    loading: true,
  });
  const [inputValue, setInputValue] = useState("");
  const [imgError, setImgError] = useState(false);

  // Modal state for button actions
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);

  useEffect(() => {
    const fetchFrame = async () => {
      if (!frameUrl) return;

      try {
        setFrameData((prev) => ({ ...prev, loading: true, error: null }));
        setImgError(false);

        // Fetch the frame metadata through our proxy endpoint with user context if available
        const params = new URLSearchParams({
          url: frameUrl,
        });

        if (isConnected && fid) {
          params.append("fid", fid.toString());
        }

        const response = await fetch(`/frames?${params.toString()}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch frame: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched frame data:", data);

        setFrameData({
          image: data.image || null,
          title: data.title || null,
          buttons: data.buttons || [],
          inputText: !!data.inputText,
          postUrl: data.postUrl || null,
          error: null,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching frame:", error);
        setFrameData((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to load frame",
          loading: false,
        }));
      }
    };

    fetchFrame();
  }, [frameUrl, isConnected, fid]);

  const handleButtonClick = (buttonIndex: number) => {
    setActiveButton(buttonIndex);
    setIsModalOpen(true);
  };

  // If no URL has been entered yet, show a placeholder
  if (!frameUrl) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white",
          position: "relative",
          padding: "32px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "400px" }}>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#1f2937",
                marginBottom: "8px",
              }}
            >
              Enter a Farcaster Frame URL
            </h2>
            <p style={{ color: "#4b5563" }}>
              Enter a valid Frame URL in the input field above and click
              &quot;Load Frame&quot; to view it.
            </p>
            <div style={{ marginTop: "24px", color: "#4b5563" }}>
              <p style={{ fontSize: "14px" }}>Try these example frames:</p>
              <ul
                style={{ marginTop: "8px", color: "#3b82f6", fontSize: "14px" }}
              >
                <li style={{ marginTop: "4px" }}>
                  https://frame.onchnsummer.xyz
                </li>
                <li style={{ marginTop: "4px" }}>https://framesjs.org</li>
                <li style={{ marginTop: "4px" }}>https://skatehive.app</li>
                <li style={{ marginTop: "4px" }}>https://gnars.com</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (frameData.loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white",
          position: "relative",
          padding: "16px",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <p style={{ color: "#4b5563", fontWeight: 500 }}>Loading frame...</p>
        </div>
      </div>
    );
  }

  if (frameData.error) {
    return (
      <div
        style={{
          display: "flex",
          color: "#dc2626",
          fontSize: "14px",
          padding: "16px",
          backgroundColor: "white",
          border: "1px solid #ef4444",
          borderRadius: "6px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <p>Error: {frameData.error}</p>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: "8px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          overflow: "hidden",
          backgroundColor: "white",
          position: "relative",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {/* Connection Status */}
        {isConnected && fid ? (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              zIndex: 10,
              backgroundColor: "#dcfce7",
              color: "#166534",
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "9999px",
            }}
          >
            Connected: FID {fid}
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              zIndex: 10,
              backgroundColor: "#dbeafe",
              color: "#1e40af",
              fontSize: "12px",
              padding: "4px 8px",
              borderRadius: "9999px",
            }}
          >
            Demo Mode: FID 123456
          </div>
        )}

        {frameData.image && !imgError ? (
          <div
            style={{
              position: "relative",
              width: "100%",
              borderBottom: "1px solid #e5e7eb",
              overflow: "hidden",
              aspectRatio: "1.91/1",
            }}
          >
            <Image
              src={frameData.image}
              alt={frameData.title || "Frame image"}
              fill
              style={{
                objectFit: "cover",
              }}
              sizes="(max-width: 768px) 100vw, 600px"
              priority
              onError={() => setImgError(true)}
            />
          </div>
        ) : frameData.image && imgError ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              height: "192px",
              backgroundColor: "#f3f4f6",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <p style={{ color: "#4b5563" }}>Failed to load image</p>
          </div>
        ) : null}

        {frameData.title && (
          <div
            style={{
              padding: "8px 16px",
              fontWeight: 500,
              color: "#1f2937",
              backgroundColor: "#f9fafb",
            }}
          >
            {frameData.title}
          </div>
        )}

        {frameData.inputText && (
          <div style={{ width: "100%", padding: "8px" }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              style={{
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px",
                boxSizing: "border-box",
                width: "100%",
                color: "#1f2937",
              }}
              placeholder="Enter text..."
            />
          </div>
        )}

        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "0 8px 8px 8px",
            backgroundColor: "white",
          }}
        >
          {frameData.buttons.map((button, index) => (
            <button
              key={index}
              onClick={() => handleButtonClick(index + 1)}
              style={{
                border: "1px solid #d1d5db",
                fontSize: "14px",
                color: "#374151",
                borderRadius: "4px",
                flex: 1,
                backgroundColor: "white",
                padding: "8px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pass the current frame data to the modal */}
      <FrameActionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        frameUrl={frameUrl}
        buttonIndex={activeButton || 1}
        fid={fid || 123456}
        currentFrameData={frameData}
      />
    </>
  );
}
