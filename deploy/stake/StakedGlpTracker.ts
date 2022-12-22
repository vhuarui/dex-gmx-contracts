import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running StakedGlpTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('StakedGlpTracker', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ['Fee + Staked GLP', 'fsGLP'],
  })

  console.log('StakedGlpTracker deployed at ', address)

  const esGmx = await ethers.getContract('EsGMX')
  const feeGlpTracker = await ethers.getContract('FeeGlpTracker')

  const stakedGlpTracker = await ethers.getContract('StakedGlpTracker')

  await sendTxn(stakedGlpTracker.setInPrivateTransferMode(true), "stakedGlpTracker.setInPrivateTransferMode")
  await sendTxn(stakedGlpTracker.setInPrivateStakingMode(true), "stakedGlpTracker.setInPrivateStakingMode")

  
  // allow stakedGlpTracker to stake feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(stakedGlpTracker.address, true), "feeGlpTracker.setHandler(stakedGlpTracker)")

  await sendTxn(esGmx.setHandler(stakedGlpTracker.address, true), "esGmx.setHandler(stakedGlpTracker)")
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'StakedGlpTracker']
