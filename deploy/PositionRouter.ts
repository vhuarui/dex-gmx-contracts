import { BigNumber } from 'ethers'
import { parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { expandDecimals, sendTxn } from '../utils/helper'

const network = process.env.HARDHAT_NETWORK || 'fantomtest'
const tokens = require('../config/tokens.json')[network]

const deployFunction: DeployFunction = async function ({network, deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running PositionRouter deploy script')

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { btc, eth, link, usdc, ftm } = tokens
  const tokenArr = [btc, eth, link, usdc, ftm]

  const depositFee = '30' // 0.3%
  const minExecutionFee = parseUnits('0.0001', 18) // 0.0001 FTM

  const vault = await ethers.getContract('Vault')
  const router = await ethers.getContract('Router')
  const weth = await ethers.getContractAt('WETH', tokens.nativeToken.address)

  const { address } = await deploy('PositionRouter', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [vault.address, router.address, weth.address, depositFee, minExecutionFee],
  })

  console.log('PositionRouter deployed at ', address)

  const positionRouter = await ethers.getContract('PositionRouter')

  await sendTxn(router.addPlugin(positionRouter.address), 'router.addPlugin')

  await sendTxn(positionRouter.setDelayValues(1, 180, 30 * 60), 'positionRouter.setDelayValues')

  
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
    positionRouter.setMaxGlobalSizes(tokenAddresses, longSizes, shortSizes),
    'positionRouter.setMaxGlobalSizes',
  )
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'Router']

deployFunction.tags = ['PositionRouter']
