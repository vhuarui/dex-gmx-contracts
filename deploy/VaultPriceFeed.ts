import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn, expandDecimals } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running VaultPriceFeed deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('VaultPriceFeed', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('VaultPriceFeed deployed at ', address)

  const vaultPriceFeed = await ethers.getContract('VaultPriceFeed')
  await sendTxn(
    vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)),
    'vaultPriceFeed.setMaxStrictPriceDeviation',
  ) // 0.05 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), 'vaultPriceFeed.setPriceSampleSpace')
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), 'vaultPriceFeed.setIsAmmEnabled')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['VaultPriceFeed']
