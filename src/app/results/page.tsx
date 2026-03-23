"use client";

import React, { useEffect, useState } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { BarChart3, Users, Crown, AlertCircle } from 'lucide-react';

export default function ResultsPage() {
  const { account, contract, connectWallet } = useWeb3();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalVotes, setTotalVotes] = useState<number>(0);

  const fetchResults = async () => {
    if (!contract || !account) return;

    try {
      const data = await contract.getCandidates();
      
      let total = 0;
      const formatted = data.map((c: any) => {
        const count = Number(c.voteCount);
        total += count;
        return {
          id: Number(c.id),
          name: c.name,
          party: c.party,
          imageHash: c.imageHash,
          voteCount: count
        };
      });
      
      // Sort by votes (descending)
      formatted.sort((a: any, b: any) => b.voteCount - a.voteCount);
      
      setCandidates(formatted);
      setTotalVotes(total);
    } catch (err) {
      console.error("Error fetching results:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    // Setup listener for real-time updates
    if (contract) {
      const onVoteCast = () => {
        // Fast UI update: just re-fetch all results
        fetchResults();
      };
      
      contract.on("VoteCast", onVoteCast);
      
      return () => {
        contract.off("VoteCast", onVoteCast);
      };
    }
  }, [contract, account]);

  if (!account) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-16 h-16 text-indigo-400 mb-6" />
        <h2 className="text-3xl font-bold mb-4">Connection Required</h2>
        <p className="text-slate-400 mb-8 max-w-md">
          Please connect your MetaMask wallet to view the real-time election results.
        </p>
        <button onClick={connectWallet} className="btn-primary text-lg px-8 py-3">
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10">
        <div>
          <h1 className="text-4xl font-extrabold mb-2 text-white">Live Election Results</h1>
          <p className="text-slate-400 text-lg">Real-time vote tallies directly from the Polygon network.</p>
        </div>
        
        <div className="mt-6 md:mt-0 flex gap-4">
          <div className="glass px-6 py-3 rounded-2xl border border-indigo-500/30 flex items-center">
            <Users className="w-5 h-5 text-indigo-400 mr-3" />
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Votes</p>
              <p className="text-2xl font-black text-white">{totalVotes}</p>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-[40vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {candidates.map((candidate, index) => {
            const percentage = totalVotes > 0 ? ((candidate.voteCount / totalVotes) * 100).toFixed(1) : "0.0";
            const isWinner = index === 0 && candidate.voteCount > 0;
            
            return (
              <div 
                key={candidate.id} 
                className={`glass rounded-2xl p-6 border transition-all duration-300 ${
                  isWinner 
                    ? 'border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.15)] bg-slate-800/80 relative overflow-hidden' 
                    : 'border-slate-700/50 hover:bg-slate-800/50'
                }`}
              >
                {/* Winner Background Flare */}
                {isWinner && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                )}
                
                <div className="flex items-center gap-6 relative z-10">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-slate-700 bg-slate-900 flex-shrink-0">
                    {candidate.imageHash ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={`https://ipfs.io/ipfs/${candidate.imageHash}`}
                        alt={candidate.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs text-center p-2">No Image</div>
                    )}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-2xl font-bold text-white tracking-tight">{candidate.name}</h3>
                          {isWinner && (
                            <span className="flex items-center text-xs font-bold text-yellow-900 bg-yellow-400 px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                              <Crown className="w-3 h-3 mr-1" /> Leading
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 font-medium">{candidate.party}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black text-white">{candidate.voteCount}</div>
                        <div className="text-sm font-medium text-slate-400">votes</div>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm font-bold mb-1">
                        <span className="text-indigo-300">{percentage}% of total</span>
                      </div>
                      <div className="w-full h-3 bg-slate-900/50 rounded-full overflow-hidden border border-slate-800 inset-shadow-sm">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${
                            isWinner ? 'from-yellow-400 to-amber-500 shadow-[0_0_10px_rgba(251,191,36,0.5)]' : 'from-indigo-500 to-purple-500'
                          }`}
                          style={{ width: `${Math.max(Number(percentage), 2)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
