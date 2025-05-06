'use client';

import React from 'react';

export default function FarcasterLogin() {
    return (
        <div className="flex flex-col items-center bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
            <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-gray-700 mb-2">Connect your Farcaster account to use authenticated frames</p>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 cursor-pointer"
                    onClick={() => {
                        alert('This is a demo version. In a production app, this would connect your Farcaster account.');
                    }}
                >
                    Connect Farcaster
                </button>
                <p className="text-xs text-gray-500 mt-2">Note: Authentication is simulated in this demo</p>
            </div>
        </div>
    );
} 