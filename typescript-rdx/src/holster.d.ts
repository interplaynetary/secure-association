/**
 * Type declarations for Holster
 * Holster uses GunDB wire specification
 */

declare module "holster" {
  interface HolsterInstance {
    get(key: string): HolsterChain;
    user(pubKey?: string): HolsterUser;
    put(data: any, callback?: (err?: any) => void): void;
    wire: {
      get(key: string): any;
      put(key: string, data: any): void;
    };
  }

  interface HolsterUser {
    get(key: string): HolsterChain;
    put(data: any, callback?: (err?: any) => void): void;
  }

  interface HolsterChain {
    get(key: string): HolsterChain;
    put(data: any, callback?: (err?: any) => void): HolsterChain;
    on(callback: (data: any, key?: string) => void): void;
    off(): void;
    once(callback: (data: any, key?: string) => void): void;
    map(): HolsterChain;
  }

  interface HolsterOptions {
    indexedDB?: boolean;
    peers?: string[];
  }

  function Holster(options?: HolsterOptions): HolsterInstance;

  export default Holster;
}

