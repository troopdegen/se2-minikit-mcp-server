"use client";

import { useState } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";

export default function Home() {
  const [newGreeting, setNewGreeting] = useState("");
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();

  // Read current greeting
  const { data: greeting, refetch } = useReadContract({
    address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
    abi: [
      {
        inputs: [],
        name: "greeting",
        outputs: [{ type: "string" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "greeting",
  });

  const handleSetGreeting = async () => {
    if (!newGreeting) return;

    writeContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`,
      abi: [
        {
          inputs: [{ name: "_newGreeting", type: "string" }],
          name: "setGreeting",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      functionName: "setGreeting",
      args: [newGreeting],
    });

    // Refetch greeting after update
    setTimeout(() => refetch(), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{{projectName}}</h1>
          <p className="text-lg text-gray-600 mb-8">{{description}}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Current Greeting</h2>
            <div className="bg-gray-100 rounded p-4">
              <p className="text-xl text-center">
                {greeting || "Loading..."}
              </p>
            </div>
          </div>

          {isConnected ? (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Update Greeting</h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newGreeting}
                  onChange={(e) => setNewGreeting(e.target.value)}
                  placeholder="Enter new greeting..."
                  className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSetGreeting}
                  disabled={!newGreeting}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Update
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
              </p>
            </div>
          ) : (
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-gray-700">
                Please connect your wallet to interact with the contract
              </p>
            </div>
          )}
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>Built with Scaffold-ETH 2 on {{network}}</p>
        </div>
      </div>
    </div>
  );
}
