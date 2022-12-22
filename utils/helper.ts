import BN from 'bn.js'
import { BigNumber, BigNumberish } from 'ethers'

export const sendTxn = async (txnPromise: any, label: any) => {
  const txn = await txnPromise
  console.info(`Sending ${label}...`)
  const result = await txn.wait()
  console.info(`... Sent! ${txn.hash}`)
  return result
}

export function expandDecimals(n: any, decimals: BigNumberish) {
  return BigNumber.from(n).mul(BigNumber.from(10).pow(decimals))
}

export function toUsd(value: number) {
  const normalizedValue = parseInt((value * Math.pow(10, 5)).toString())
  return BigNumber.from(normalizedValue).mul(BigNumber.from(10).pow(25))
}

export const toNormalizedPrice = toUsd

export function getPriceBits(prices: string | any[]) {
  if (prices.length > 8) {
    throw new Error('max prices.length exceeded')
  }

  let priceBits = new BN('0')

  for (let j = 0; j < 8; j++) {
    let index = j
    if (index >= prices.length) {
      break
    }

    const price = new BN(prices[index])
    if (price.gt(new BN('2147483648'))) {
      // 2^31
      throw new Error(`price exceeds bit limit ${price.toString()}`)
    }

    priceBits = priceBits.or(price.shln(j * 32))
  }

  return priceBits.toString()
}
