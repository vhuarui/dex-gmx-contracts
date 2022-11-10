import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running StakedGlpDistributor deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const esGmx = await ethers.getContract('EsGMX')
  const feeGlpTracker = await ethers.getContract('FeeGlpTracker')
  const stakedGlpTracker = await ethers.getContract('StakedGlpTracker')
  const { address } = await deploy('StakedGlpDistributor', {
    contract: 'RewardDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [esGmx.address, stakedGlpTracker.address],
  })

  console.log('StakedGlpDistributor deployed at ', address)

  const stakedGlpDistributor = await ethers.getContract('StakedGlpDistributor')
  if (!(await stakedGlpTracker.isInitialized())) {
    await sendTxn(
      stakedGlpTracker.initialize([feeGlpTracker.address], stakedGlpDistributor.address),
      'stakedGlpTracker.initialize',
    )
  }
  await sendTxn(stakedGlpDistributor.updateLastDistributionTime(), 'feeGlpDistributor.updateLastDistributionTime')

  await sendTxn(esGmx.setHandler(stakedGlpDistributor.address, true), 'esGmx.setHandler(stakedGlpDistributor)')
}

export default deployFunction

deployFunction.dependencies = ['StakedGlpTracker']

deployFunction.tags = ['Stake', 'StakedGlpDistributor']
