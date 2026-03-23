"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWeb3 } from '@/context/Web3Context';
import { Wallet, Vote, BarChart3, ShieldCheck } from 'lucide-react';

const Navbar = () => {
  const pathname = usePathname();
  const { account, connectWallet, isConnecting } = useWeb3();

  const navLinks = [
    { name: 'Home', path: '/', icon: <ShieldCheck className="w-4 h-4 mr-2" /> },
    { name: 'Vote Now', path: '/voting', icon: <Vote className="w-4 h-4 mr-2" /> },
    { name: 'Live Results', path: '/results', icon: <BarChart3 className="w-4 h-4 mr-2" /> },
  ];

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="sticky top-0 z-50 glass border-b border-slate-700/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 mr-8">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-1.5 rounded-lg shadow-lg">
                <Vote className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                VoteSecQA
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    href={link.path}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-slate-800 text-indigo-400 shadow-inner' 
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {account ? (
              <div className="flex items-center glass px-4 py-2 rounded-full border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                <span className="text-sm font-medium text-indigo-100">{formatAddress(account)}</span>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="btn-primary flex items-center shadow-lg shadow-indigo-500/20"
              >
                <Wallet className="w-4 h-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
