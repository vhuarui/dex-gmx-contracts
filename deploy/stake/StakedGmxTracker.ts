import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running StakedGmxTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('StakedGmxTracker', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ['Staked GMX', 'sGMX'],
  })

  console.log('StakedGmxTracker deployed at ', address)

  const stakedGmxTracker = await ethers.getContract('StakedGmxTracker')
  const esGmx = await ethers.getContract('EsGMX')

  await sendTxn(stakedGmxTracker.setInPrivateTransferMode(true), 'stakedGmxTracker.setInPrivateTransferMode')
  await sendTxn(stakedGmxTracker.setInPrivateStakingMode(true), 'stakedGmxTracker.setInPrivateStakingMode')

  // allow stakedGmxTracker to stake esGmx
  await sendTxn(esGmx.setHandler(stakedGmxTracker.address, true), 'esGmx.setHandler(stakedGmxTracker)')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'StakedGmxTracker']
