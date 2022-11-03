import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'
import { contractConfigs } from '../config/contractConfigs'

const deployFunction: DeployFunction = async function ({
  deployments,
  network,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running Vault TimeLock deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const contractConfig = contractConfigs[network.name || 'fantomtest']

  const tokenManager = await ethers.getContract('TokenManager')
  const buffer = contractConfig.priceFeedTimelock.buffer
  const { address } = await deploy('PriceFeedTimelock', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [
      deployer, // admin
      buffer,
      tokenManager.address,
    ],
  })

  console.log('PriceFeed TimeLock deployed at ', address)

  const priceFeedTimeLock = await ethers.getContract('PriceFeedTimelock')
  const vaultPriceFeed = await ethers.getContract('VaultPriceFeed')
  const secondaryPriceFeed = await ethers.getContract('FastPriceFeed')

  await sendTxn(vaultPriceFeed.setGov(priceFeedTimeLock.address), "vaultPriceFeed.setGov")
  await sendTxn(secondaryPriceFeed.setGov(priceFeedTimeLock.address), "secondaryPriceFeed.setGov")
  // await sendTxn(secondaryPriceFeed.setTokenManager(tokenManager.address), "secondaryPriceFeed.setTokenManager")
}

export default deployFunction

deployFunction.dependencies = ['VaultPriceFeed', 'FastPriceFeed', 'TokenManager']

deployFunction.tags = ['PriceFeedTimelock']
