import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, network, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running PositionManager deploy script')

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const depositFee = 30 // 0.3%
  const orderKeeper = { address: deployer }
  const liquidator = { address: deployer }

  const vault = await ethers.getContract('Vault')
  const router = await ethers.getContract('Router')
  const weth = await ethers.getContractAt('WETH', tokens.nativeToken.address)
  const orderBook = await ethers.getContract('OrderBook')

  const { address } = await deploy('PositionManager', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [vault.address, router.address, weth.address, depositFee, orderBook.address],
  })

  console.log('PositionManager deployed at ', address)

  const positionManager = await ethers.getContract('PositionManager')

  await sendTxn(
    positionManager.setOrderKeeper(orderKeeper.address, true),
    'positionManager.setOrderKeeper(orderKeeper)',
  )
  await sendTxn(positionManager.setLiquidator(liquidator.address, true), 'positionManager.setLiquidator(liquidator)')
  // await sendTxn(timelock.setContractHandler(positionManager.address, true), "timelock.setContractHandler(positionRouter)")
  // await sendTxn(timelock.setLiquidator(vault.address, positionManager.address, true), "timelock.setLiquidator(vault, positionManager, true)")
  await sendTxn(vault.setLiquidator(positionManager.address, true), 'vault.setLiquidator(positionManager, true)')
  await sendTxn(router.addPlugin(positionManager.address), 'router.addPlugin(positionManager)')
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'Router', 'OrderBook']

deployFunction.tags = ['PositionManager']
