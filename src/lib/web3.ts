import { Contract, BrowserProvider, Signer } from 'ethers';
// JSON 파일을 소문자 변수명 'counterAbi'로 가져옵니다.
import counterAbi from './counter.json'

// ----------------------
// 1. 상수 정의 (환경변수 및 ABI 사용)
// ----------------------

// Next.js 환경변수에서 컨트랙트 주소를 가져옵니다.
// 환경변수명은 대문자로 유지하는 것이 일반적입니다.
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_COUNTER_CONTRACT_ADDRESS as string;

if (!CONTRACT_ADDRESS) {
    // 환경변수가 설정되지 않은 경우 오류 처리
    throw new Error("NEXT_PUBLIC_COUNTER_CONTRACT_ADDRESS 환경변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.");
}

// ABI 인터페이스는 상수임을 강조하기 위해 대문자로 유지합니다.
export const COUNTER_ABI_INTERFACE = counterAbi; 

// ----------------------
// 2. 타입 정의 및 Ethers.js 인스턴스 생성 함수
// ----------------------

// 전역 타입은 프로젝트의 `src/app/global.d.ts`에서 선언합니다.

/**
 * 브라우저 환경에서 Ethers.js의 Provider 객체를 반환합니다.
 * @returns {BrowserProvider | null}
 */
export const getProvider = (): BrowserProvider | null => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new BrowserProvider(window.ethereum);
  }
  return null;
};

/**
 * 컨트랙트와 상호작용할 수 있는 Contract 객체를 반환합니다.
 * @param signerOrProvider - Contract 객체에 연결할 Signer 또는 Provider
 * @returns {Contract}
 */
export const getCounterContract = (signerOrProvider: Signer | BrowserProvider): Contract => {
  // 환경변수의 주소와 JSON 파일에서 가져온 ABI를 사용하여 Contract 인스턴스를 생성합니다.
  return new Contract(CONTRACT_ADDRESS, COUNTER_ABI_INTERFACE, signerOrProvider);
};

/**
 * 지갑 연결을 요청하고 Signer 객체를 반환합니다.
 * @returns {Promise<Signer | null>}
 */
export const connectWallet = async (): Promise<Signer | null> => {
    const provider = getProvider();
    if (!provider) {
        throw new Error("MetaMask 또는 Web3 지갑이 감지되지 않았습니다.");
    }
    
    // 지갑 연결 요청
    await provider.send("eth_requestAccounts", []);
    
    // 서명자 (Signer) 객체 반환
    const signer = await provider.getSigner();
    return signer;
};