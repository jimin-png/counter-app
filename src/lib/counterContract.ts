// src/lib/counterContract.ts
import { Contract, ethers } from 'ethers'
import CounterABI from './counter.json'
import { CONTRACT_ADDRESS } from './constants'

// ABI
const CONTRACT_ABI = CounterABI

export async function getSignedContract(): Promise<Contract> {
  if (typeof window === 'undefined') throw new Error('MetaMask 지갑이 설치되어 있지 않습니다.')

  const ethereumProvider = (window as any).ethereum
  if (!ethereumProvider) throw new Error('MetaMask 지갑이 설치되어 있지 않습니다.')

  const provider = new ethers.providers.Web3Provider(ethereumProvider)
  await provider.send('eth_requestAccounts', [])
  const signer = provider.getSigner()

  const onChainCode = await provider.getCode(CONTRACT_ADDRESS)
  if (!onChainCode || onChainCode === '0x') {
    throw new Error(`컨트랙트가 해당 네트워크에 배포되어 있지 않습니다. 주소: ${CONTRACT_ADDRESS}`)
  }

  return new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
}

// 상태 변경 함수
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

// 조회 함수
export async function getCounterValue(): Promise<number> {
  const contract = await getSignedContract()
  const value: bigint = await contract.getCounter()
  return Number(value)
}

