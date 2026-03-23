// src/types/global.d.ts
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request?: (...args: any[]) => Promise<any>;
      on?: (eventName: string, listener: (...args: any[]) => void) => void;
      removeAllListeners?: (eventName?: string) => void;
    };
  }
}

export {};
