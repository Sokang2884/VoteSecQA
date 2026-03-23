"use client";

import React from 'react';
import Link from 'next/link';
import { useWeb3 } from '@/context/Web3Context';
import { ShieldCheck, Vote, Link as LinkIcon } from 'lucide-react';

export default function Home() {
  const { account, connectWallet, isConnecting } = useWeb3();

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="relative mb-8 group inline-block">
        <div className="absolute inset-0 bg-indigo-500 rounded-full blur-[40px] opacity-40 group-hover:opacity-60 transition duration-500"></div>
        <div className="relative glass p-6 rounded-full border border-indigo-400/20 shadow-2xl">
          <ShieldCheck className="w-20 h-20 text-indigo-400 group-hover:scale-110 transition duration-500" />
        </div>
      </div>

      <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
        Welcome to{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
          IEC VoteSecQA
        </span>
      </h1>

      <p className="max-w-2xl text-lg text-slate-300 mb-10 leading-relaxed">
        A decentralized, transparent, and immutable voting platform built on Polygon. 
        Connect your wallet to participate in the Presidential Election securely and 
        watch the results unfold in real-time.
      </p>

      {account ? (
        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <Link 
            href="/voting" 
            className="btn-primary text-lg px-8 py-3 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transform hover:-translate-y-1 transition-all"
          >
            <Vote className="w-5 h-5 mr-2" />
            Proceed to Vote
          </Link>
          <Link 
            href="/results" 
            className="glass text-white font-medium text-lg px-8 py-3 rounded-xl flex items-center justify-center hover:bg-white/5 border border-white/10 transition-all shadow-xl"
          >
            View Live Results
          </Link>
        </div>
      ) : (
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="btn-primary text-xl px-10 py-4 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.5)] hover:shadow-[0_0_40px_rgba(99,102,241,0.7)] transform hover:-translate-y-1 hover:scale-105 transition-all w-full max-w-sm mx-auto"
        >
          <LinkIcon className="w-6 h-6 mr-3" />
          {isConnecting ? 'Initializing connection...' : 'Connect MetaMask to Start'}
        </button>
      )}

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full text-left">
        {[
          { title: "Immutable", desc: "Every vote is stored on-chain permanently" },
          { title: "Transparent", desc: "Results are verifiable by anyone in real-time" },
          { title: "Secure", desc: "Preventing double-voting automatically" },
        ].map((feature, i) => (
          <div key={i} className="glass p-6 rounded-2xl border border-slate-700/50 hover:bg-white/5 transition duration-300">
            <h3 className="text-xl font-bold text-indigo-300 border-b border-indigo-500/20 pb-2 mb-3">
              {feature.title}
            </h3>
            <p className="text-slate-400">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
