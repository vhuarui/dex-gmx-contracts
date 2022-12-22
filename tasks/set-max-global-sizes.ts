import { BigNumber } from 'ethers'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { GlpManager, PositionManager, PositionRouter, RewardRouterV2 } from '../typechain'
import { ERC20 } from '../typechain'
import { expandDecimals, sendTxn } from '../utils/helper'

task('set:max-global-sizes', 'Set MaxGlobalSizes').setAction(async function (
  _,
  { network, ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const deployer = await getNamedSigner('deployer')

  const { btc, eth, link, usdc, ftm } = tokens
  const tokenArr = [btc, eth, link, usdc, ftm]

  const positionManager = (await getContract('PositionManager', deployer)) as PositionManager
  console.log('positionManager address', positionManager.address)
  const positionRouter = (await getContract('PositionRouter', deployer)) as PositionRouter
  console.log('positionRouter address', positionRouter.address)

  const tokenAddresses = tokenArr.map((t) => t.address)
  const longSizes = tokenArr.map((token) => {
    if (!token.maxGlobalLongSize) {
      return BigNumber.from(0)
    }

    return expandDecimals(token.maxGlobalLongSize, 30)
  })

  const shortSizes = tokenArr.map((token) => {
    if (!token.maxGlobalShortSize) {
      return BigNumber.from(0)
    }

    return expandDecimals(token.maxGlobalShortSize, 30)
  })
  await sendTxn(
    positionManager.setMaxGlobalSizes(tokenAddresses, longSizes, shortSizes),
    'positionManager.setMaxGlobalSizes',
  )

  await sendTxn(
    positionRouter.setMaxGlobalSizes(tokenAddresses, longSizes, shortSizes),
    'positionRouter.setMaxGlobalSizes',
  )

  console.log('setMaxGlobalSizes successfully!')
})
