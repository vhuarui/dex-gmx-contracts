import { task } from 'hardhat/config'
import { Timelock, Vault } from '../typechain'
import { sendTxn, toUsd } from '../utils/helper'

task('contracts-address', 'Show contracts address').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract } },
) {
  const deployer = await getNamedSigner('deployer')

  const showAddress = async (contractName: string) => {
    if (contractName) {
      console.log(`${contractName}: "${(await getContract(contractName)).address}",`)
    } else {
      console.log('')
    }
  }

  const contractNameArr = [
    'Vault',
    'Router',
    'VaultReader',
    'Reader',
    'GlpManager',
    'RewardRouterV2',
    'RewardReader',
    'GLP',
    'GMX',
    'EsGMX',
    'BnGMX',
    'USDG',
    '',
    'StakedGmxTracker',
    'BonusGmxTracker',
    'FeeGmxTracker',
    'StakedGlpTracker',
    'FeeGlpTracker',
    '',
    'StakedGmxDistributor',
    'StakedGlpDistributor',
    '',
    'GmxVester',
    'GlpVester',
    '',
    'OrderBook',
    'OrderBookReader',
    '',
    'PositionRouter',
    'PositionManager',
    '',
    'ReferralStorage',
    'ReferralReader',
    '',
    'FastPriceFeed',
    'Timelock',
  ]

  for await (const contractName of contractNameArr) {
    await showAddress(contractName)
  }
})
