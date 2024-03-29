import { parseUnits } from 'ethers/lib/utils'
import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn, expandDecimals } from '../utils/helper'
import { contractConfigs } from '../config/contractConfigs'

const deployFunction: DeployFunction = async function ({
  deployments,
  network,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running OrderBook deploy script')

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const contractConfig = contractConfigs[network.name || 'fantomtest']

  const { address } = await deploy('OrderBook', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('OrderBook deployed at ', address)

  const orderBook = await ethers.getContract('OrderBook')

  const vault = await ethers.getContract('Vault')
  const usdg = await ethers.getContract('USDG')
  const router = await ethers.getContract('Router')

  await sendTxn(
    orderBook.initialize(
      router.address, // router
      vault.address, // vault
      tokens.nativeToken.address, // weth
      usdg.address, // usdg
      contractConfig.orderBook.minExecutionFee, // 0.0003
      contractConfig.orderBook.minPurchaseTokenAmountUsd, // min purchase token amount usd
    ),
    'orderBook.initialize',
  )
  await sendTxn(router.addPlugin(orderBook.address), 'router.addPlugin(orderBook)')
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'USDG', 'Router']

deployFunction.tags = ['OrderBook']
