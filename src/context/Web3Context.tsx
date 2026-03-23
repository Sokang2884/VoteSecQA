"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { ethers, BrowserProvider, Contract } from "ethers";

// Adjust path based on Hardhat artifacts location or copy the abi here.
import VotingArtifact from "../contracts/Voting.json";

const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const ABI = VotingArtifact.abi;

interface Web3State {
  account: string | null;
  provider: BrowserProvider | null;
  contract: Contract | null;
  connectWallet: () => Promise<void>;
  isConnecting: boolean;
  error: string | null;
}

const Web3Context = createContext<Web3State>({
  account: null,
  provider: null,
  contract: null,
  connectWallet: async () => {},
  isConnecting: false,
  error: null,
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initWeb3 = async (requestAccess = false) => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask not detected. Please install the extension.");
      return;
    }

    try {
      if (requestAccess) setIsConnecting(true);
      setError(null);
      
      const browserProvider = new ethers.BrowserProvider(window.ethereum as any);
      
      // Auto-switch to Local Hardhat Network
      try {
        if (window.ethereum?.request) {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x539' }], // 1337 in hex
          });
        }
      } catch (switchError: any) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            if (window.ethereum?.request) {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0x539', // 1337
                    chainName: 'Hardhat Local',
                    rpcUrls: ['http://127.0.0.1:8545/'],
                    nativeCurrency: {
                      name: 'ETH',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                  },
                ],
              });
            }
          } catch (addError) {
            console.error(addError);
          }
        }
      }

      let accounts = [];
      if (requestAccess) {
        accounts = await browserProvider.send("eth_requestAccounts", []);
      } else {
        accounts = await browserProvider.send("eth_accounts", []);
      }

      if (accounts.length > 0) {
        const addr = accounts[0];
        setAccount(addr);
        setProvider(browserProvider);

        const signer = await browserProvider.getSigner();
        const votingContract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
        setContract(votingContract);
      } else {
        setAccount(null);
        setContract(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to connect wallet.");
    } finally {
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    initWeb3(false);
    
    if (window.ethereum) {
      window.ethereum.on?.("accountsChanged", () => initWeb3(false));
      window.ethereum.on?.("chainChanged", () => window.location.reload());
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners?.("accountsChanged");
        window.ethereum.removeAllListeners?.("chainChanged");
      }
    };
  }, []);

  const connectWallet = async () => initWeb3(true);

  return (
    <Web3Context.Provider value={{ account, provider, contract, connectWallet, isConnecting, error }}>
      {children}
    </Web3Context.Provider>
  );
};

export const useWeb3 = () => useContext(Web3Context);
