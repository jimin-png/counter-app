// global.d.ts (브라우저 전역 타입 선언)

import type { Eip1193Provider } from 'ethers';

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export {};