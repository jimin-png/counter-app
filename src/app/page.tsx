// src/app/page.tsx

'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  incrementCounter,
  decrementCounter,
  resetCounter,
  getSignedContract,
} from '@/lib/counterContract'
import { ethers, Contract } from 'ethers'

// MetaMask 타입 정의
interface EthereumProvider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>
}

export default function Home() {
  const [counter, setCounter] = useState<number | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getErrorMessage = (e: unknown): string => {
    if (e instanceof Error) return e.message
    if (typeof e === 'string') return e
    try { return JSON.stringify(e) } catch { return '알 수 없는 오류' }
  }

  const fetchContractData = useCallback(async () => {
    try {
      const contract: Contract = await getSignedContract()
      try {
        const owner: string = await contract.owner()
        setOwnerAddress(owner)
      } catch {
        setOwnerAddress(null)
      }

      try {
        const value = await contract.getCounter()
        setCounter(Number(value))
        setError(null)
      } catch {
        setCounter(null)
        setError('카운터 값을 가져오는데 실패했습니다.')
      }
    } catch {
      setError('컨트랙트에 연결할 수 없습니다. 네트워크를 확인해주세요.')
    }
  }, [])

  const connectWallet = useCallback(async () => {
    setLoading(true)
    try {
      const ethereum = (window as unknown as { ethereum?: EthereumProvider }).ethereum
      if (!ethereum) { setError('MetaMask를 설치해주세요.'); return }

      const provider = new ethers.providers.Web3Provider(ethereum)
      const accounts: string[] = (await provider.send('eth_requestAccounts', [])) as string[]
      if (accounts.length > 0) {
        setAddress(accounts[0])
        await fetchContractData()
      }
      setError(null)
    } catch (err: unknown) {
      setError(`지갑 연결 실패: ${getErrorMessage(err)}`)
    } finally { setLoading(false) }
  }, [fetchContractData])

  const handleIncrement = async () => {
    if (!address) return setError('지갑을 먼저 연결해주세요.')
    setLoading(true)
    try { await incrementCounter(); await fetchContractData() }
    catch (err: unknown) { setError(`Increment 실패: ${getErrorMessage(err)}`) }
    finally { setLoading(false) }
  }

  const handleDecrement = async () => {
    if (!address) return setError('지갑을 먼저 연결해주세요.')
    setLoading(true)
    try { await decrementCounter(); await fetchContractData() }
    catch (err: unknown) { setError(`Decrement 실패: ${getErrorMessage(err)}`) }
    finally { setLoading(false) }
  }

  const handleReset = async () => {
    if (!address) return setError('지갑을 먼저 연결해주세요.')
    if (address?.toLowerCase() !== ownerAddress?.toLowerCase()) {
      return setError('리셋은 컨트랙트 소유자만 가능합니다.')
    }
    setLoading(true)
    try { await resetCounter(); await fetchContractData() }
    catch (err: unknown) { setError(`Reset 실패: ${getErrorMessage(err)}`) }
    finally { setLoading(false) }
  }

  useEffect(() => {
    if ((window as unknown as { ethereum?: EthereumProvider }).ethereum) connectWallet()
  }, [connectWallet])

  const isOwner = address?.toLowerCase() === ownerAddress?.toLowerCase()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">
          세폴리아 카운터 App
        </h1>
        <p className="text-center mb-6 text-gray-600">{'학번: 92313453, 이름: 유지민'}</p>

        <div className="mb-6 p-4 border rounded-lg bg-gray-100 text-sm">
          <p className="mb-2">컨트랙트 소유자: <span className="font-mono text-xs text-indigo-600">{ownerAddress ?? '...'}</span></p>
          {address ? (
            <p className="text-green-600 font-semibold truncate">
              ✅ 연결됨: {address}
              {isOwner && <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">소유자</span>}
            </p>
          ) : (
            <button onClick={connectWallet} disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition disabled:bg-indigo-400">
              {loading ? '연결 중...' : '메타마스크 지갑 연결하기'}
            </button>
          )}
        </div>

        <div className="text-center mb-8 bg-indigo-50 p-6 rounded-lg">
          <h2 className="text-xl text-indigo-800 mb-2">현재 카운터 값:</h2>
          <p className="text-7xl font-extrabold text-indigo-600">{counter !== null ? counter : '...'}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={handleIncrement} disabled={loading || !address} className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:bg-gray-400 font-bold shadow-md">➕ 증가</button>
          <button onClick={handleDecrement} disabled={loading || !address} className="bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition disabled:bg-gray-400 font-bold shadow-md">➖ 감소</button>
        </div>

        <div className="mt-4">
          <button onClick={handleReset} disabled={loading || !address || !isOwner} className={`w-full py-3 rounded-lg transition font-bold shadow-md ${isOwner ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-red-200 text-red-500 cursor-not-allowed'}`} title={!isOwner ? 'Only the contract owner can reset.' : 'Reset Counter'}>
            초기화 (소유자 전용)
          </button>
        </div>

        <button onClick={fetchContractData} disabled={loading} className="w-full mt-4 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-400 font-semibold">
          🔄 최신 데이터 가져오기
        </button>

        {error && <p className="text-sm text-red-500 mt-4 p-2 bg-red-100 rounded border border-red-300">{error}</p>}
      </div>
    </main>
  )
}
