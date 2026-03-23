"use client";

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import Image from 'next/image';
import { Info, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function VotingPage() {
  const { account, contract, connectWallet } = useWeb3();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [txPending, setTxPending] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  useEffect(() => {
    const fetchElectionData = async () => {
      if (!contract || !account) return;

      try {
        setLoading(true);
        // Fetch candidates
        const data = await contract.getCandidates();
        
        const formatted = data.map((c: any) => ({
          id: Number(c.id),
          name: c.name,
          party: c.party,
          imageHash: c.imageHash,
          voteCount: Number(c.voteCount)
        }));
        
        setCandidates(formatted);

        // Check voted status
        const voted = await contract.hasVoted(account);
        setHasVoted(voted);

      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchElectionData();

    // Setup listener
    if (contract) {
      const onVoteCast = (voter: string, candidateId: number) => {
        if (voter.toLowerCase() === account?.toLowerCase()) {
          setHasVoted(true);
          setMessage({ type: 'success', text: 'Your vote was successfully recorded!' });
        }
      };
      
      contract.on("VoteCast", onVoteCast);
      
      return () => {
        contract.off("VoteCast", onVoteCast);
      };
    }
  }, [contract, account]);

  const handleVote = async (id: number) => {
    if (!contract) return;

    try {
      setTxPending(true);
      setMessage(null);
      
      const tx = await contract.vote(id);
      
      // Wait for confirmation
      await tx.wait();
      
      // The event listener will update the state
    } catch (err: any) {
      console.error(err);
      setMessage({ 
        type: 'error', 
        text: err.reason || err.message || "Transaction failed." 
      });
    } finally {
      setTxPending(false);
    }
  };

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-yellow-500 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Connection Required</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Please connect your MetaMask wallet to view candidates and cast your vote.
        </p>
        <button onClick={connectWallet} className="btn-primary text-lg px-8 py-3">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold mb-2">Presidential Election</h1>
          <p className="text-slate-400 text-lg">Select a candidate below to cast your secure, one-time vote.</p>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <div className={`inline-flex items-center px-4 py-2 rounded-full border ${hasVoted ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'glass border-indigo-500/30 text-indigo-300'}`}>
            {hasVoted ? (
              <><CheckCircle2 className="w-5 h-5 mr-2" /> Vote Confirmed</>
            ) : (
              <><Info className="w-5 h-5 mr-2" /> 1 Vote Remaining</>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className={`mb-8 p-4 rounded-xl flex items-center ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {message.type === 'success' ? <CheckCircle2 className="w-6 h-6 mr-3 flex-shrink-0" /> : <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="glass rounded-2xl overflow-hidden flex flex-col border border-slate-700/50 card-hover group relative">
              <div className="relative h-64 w-full bg-slate-800">
                {candidate.imageHash ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={`https://ipfs.io/ipfs/${candidate.imageHash}`}
                    alt={candidate.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                    No Image Provided
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="inline-block px-3 py-1 bg-indigo-600 font-bold text-xs rounded-full mb-2 shadow-lg">
                    {candidate.party}
                  </span>
                  <h3 className="text-xl font-bold text-white drop-shadow-md">{candidate.name}</h3>
                </div>
              </div>
              
              <div className="p-5 mt-auto bg-slate-900/40">
                <button
                  onClick={() => handleVote(candidate.id)}
                  disabled={hasVoted || txPending}
                  className={`w-full py-3 rounded-xl font-bold transition-all shadow-md ${
                    hasVoted
                      ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 hover:shadow-indigo-500/40'
                  }`}
                >
                  {txPending ? (
                    <span className="flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full border-2 border-white/50 border-t-white animate-spin mr-2"></div>
                      Processing...
                    </span>
                  ) : hasVoted ? (
                    'Already Voted'
                  ) : (
                    'Vote'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
