import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { expandDecimals, sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({
  network,
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running FeeGmxDistributor deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const tokens = require('../../config/tokens.json')[network.name || 'fantomtest']
  const { nativeToken } = tokens

  const feeGmxTracker = await ethers.getContract('FeeGmxTracker')
  const bonusGmxTracker = await ethers.getContract('BonusGmxTracker')
  const bnGmx = await ethers.getContract('BnGMX')

  const { address } = await deploy('FeeGmxDistributor', {
    contract: 'RewardDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [nativeToken.address, feeGmxTracker.address],
  })

  console.log('FeeGmxDistributor deployed at ', address)

  const feeGmxDistributor = await ethers.getContract('FeeGmxDistributor')
  if (!(await feeGmxTracker.isInitialized())) {
    await sendTxn(
      feeGmxTracker.initialize([bonusGmxTracker.address, bnGmx.address], feeGmxDistributor.address),
      'feeGmxTracker.initialize',
    )
  }
  await sendTxn(feeGmxDistributor.updateLastDistributionTime(), 'feeGmxDistributor.updateLastDistributionTime')
}

export default deployFunction

deployFunction.dependencies = ['BonusGmxTracker', 'FeeGmxTracker']

deployFunction.tags = ['Stake', 'FeeGmxDistributor']
