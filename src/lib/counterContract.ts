import { Contract, ethers } from 'ethers'
import CounterABI from './counter.json'

export const CONTRACT_ADDRESS = '0x79DdE87d37370550AA42DCb75ac1da150dC196fC'

// 명시적 타입 정의
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

// 상태 변경 함수용 Contract
export async function getSignedContract(): Promise<Contract> {
  if (typeof window === 'undefined') throw new Error('클라이언트 환경에서만 사용 가능합니다.')

  const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum
  if (!ethereum) throw new Error('MetaMask 지갑이 설치되어 있지 않습니다.')

  const provider = new ethers.providers.Web3Provider(ethereum)
  await provider.send('eth_requestAccounts', [])

  const signer = provider.getSigner()

  const code = await provider.getCode(CONTRACT_ADDRESS)
  if (!code || code === '0x') throw new Error('컨트랙트가 배포되어 있지 않습니다.')

  return new Contract(CONTRACT_ADDRESS, CounterABI, signer)
}

// 각 함수 정의
export async function incrementCounter(): Promise<void> {
  const contract = await getSignedContract()
  const tx = await contract.incrementCounter()
  await tx.wait()
}

export async function decrementCounter(): Promise<void> {
  const contract = await getSignedContract()
  const tx = await contract.decrementCounter()
  await tx.wait()
}

export async function resetCounter(): Promise<void> {
  const contract = await getSignedContract()
  const tx = await contract.resetCounter()
  await tx.wait()
}
