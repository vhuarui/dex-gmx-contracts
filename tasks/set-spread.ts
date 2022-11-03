import { task } from 'hardhat/config'
import { PriceFeedTimelock, VaultPriceFeed } from '../typechain'
import { sendTxn } from '../utils/helper'

task('set:spread', 'VaultPriceFeed setSpreadBasisPoints').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract }, network },
) {
  const deployer = await getNamedSigner('deployer')

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const { btc, eth, link, usdc, ftm } = tokens
  const tokenArr = [btc, eth, link, usdc, ftm]

  const vaultPriceFeed = (await getContract('VaultPriceFeed', deployer)) as VaultPriceFeed
  const vaultPriceFeedGov = await vaultPriceFeed.gov()
  
  for (const tokenItem of tokenArr) {
    if (tokenItem.spreadBasisPoints === undefined) {
      continue
    }
    if (vaultPriceFeedGov == deployer.address) {
      await sendTxn(
        vaultPriceFeed.setSpreadBasisPoints(
          tokenItem.address, // _token
          tokenItem.spreadBasisPoints, // _spreadBasisPoints
          ),
          `vaultPriceFeed.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`,
      )
    } else {
      const priceFeedTimelock = (await getContract('PriceFeedTimelock', deployer)) as PriceFeedTimelock
      await sendTxn(
        priceFeedTimelock.setSpreadBasisPoints(
          vaultPriceFeed.address,
          tokenItem.address, // _token
          tokenItem.spreadBasisPoints, // _spreadBasisPoints
        ),
        `priceFeedTimelock.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`,
      )
    }
  }

  console.log('SetSpreadBasisPoints successfully!')
})
