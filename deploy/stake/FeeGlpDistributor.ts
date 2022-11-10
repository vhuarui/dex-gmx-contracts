import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({network, deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running FeeGlpDistributor deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const tokens = require('../../config/tokens.json')[network.name || 'fantomtest']
  const { nativeToken } = tokens

  const feeGlpTracker = await ethers.getContract('FeeGlpTracker')
  const { address } = await deploy('FeeGlpDistributor', {
    contract: 'RewardDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [nativeToken.address, feeGlpTracker.address],
  })

  console.log('FeeGlpDistributor deployed at ', address)

  const glp = await ethers.getContract('GLP')
  const feeGlpDistributor = await ethers.getContract('FeeGlpDistributor')
  if (!(await feeGlpTracker.isInitialized())) {
    await sendTxn(feeGlpTracker.initialize([glp.address], feeGlpDistributor.address), 'feeGlpTracker.initialize')
  }
  await sendTxn(feeGlpDistributor.updateLastDistributionTime(), "feeGlpDistributor.updateLastDistributionTime")
}

export default deployFunction

deployFunction.dependencies = ['FeeGlpTracker']

deployFunction.tags = ['Stake', 'FeeGlpDistributor']
