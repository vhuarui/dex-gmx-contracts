import { BigNumber, BigNumberish } from 'ethers'

export const sendTxn = async (txnPromise: any, label: any) => {
  const txn = await txnPromise
  console.info(`Sending ${label}...`)
  await txn.wait()
  console.info(`... Sent! ${txn.hash}`)
  return txn
}

export function expandDecimals(n: any, decimals: BigNumberish) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals))
}

export function toUsd(value: number) {
  const normalizedValue = parseInt((value * Math.pow(10, 10)).toString())
  return BigNumber.from(normalizedValue).mul(BigNumber.from(10).pow(20))
}

export const toNormalizedPrice = toUsd
