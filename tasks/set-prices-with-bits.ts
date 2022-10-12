import { task } from 'hardhat/config'
import { FastPriceFeed, Vault } from '../typechain'
import { getPriceBits, sendTxn } from '../utils/helper'

import axios from 'axios'

task('set-prices-with-bits', 'set prices with bits').setAction(async function (
  _,
  { network, ethers: { provider, getNamedSigner, getContract, getContractAt } },
) {
  async function getBlockTime() {
    const blockNumber = await provider.getBlockNumber()
    const block = await provider.getBlock(blockNumber)
    return block.timestamp
  }

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const deployer = await getNamedSigner('deployer')

  const fastPriceFeed = (await getContract('FastPriceFeed', deployer)) as FastPriceFeed
  const vault = (await getContract('Vault', deployer)) as Vault

  const { btc, eth, link, ftm } = tokens
  const fastPriceTokens = [btc, eth, link, ftm]

  let setPrices: string | any[] = []
  for await (const token of fastPriceTokens) {
    const price = await getBiAnPrice(token.name)
    setPrices.push(price * token.fastPricePrecision)
  }
  const priceBits = getPriceBits(setPrices)
  // console.log(priceBits)
  const timestamp = await getBlockTime()
  await sendTxn(fastPriceFeed.setPricesWithBits(priceBits, timestamp), 'fastPriceFeed.setPricesWithBits')

  console.log('getMinPrice', (await vault.getMinPrice(tokens.btc.address)).toString())
  console.log('getMaxPrice', (await vault.getMaxPrice(tokens.btc.address)).toString())
})

async function getBiAnPrice(name: string) {
  const api = `https://api.binance.com/api/v3/ticker/price?symbols=["${name.toLocaleUpperCase()}USDT"]`
  let params = await axios.get(api)
  let data = params.data
  return data[0].price
}
