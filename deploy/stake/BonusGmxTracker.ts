import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running BonusGmxTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('BonusGmxTracker', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ['Staked + Bonus GMX', 'sbGMX'],
  })

  console.log('BonusGmxTracker deployed at ', address)

  const bonusGmxTracker = await ethers.getContract('BonusGmxTracker')
  const stakedGmxTracker = await ethers.getContract('StakedGmxTracker')

  await sendTxn(bonusGmxTracker.setInPrivateTransferMode(true), 'bonusGmxTracker.setInPrivateTransferMode')
  await sendTxn(bonusGmxTracker.setInPrivateStakingMode(true), 'bonusGmxTracker.setInPrivateStakingMode')
  await sendTxn(bonusGmxTracker.setInPrivateClaimingMode(true), 'bonusGmxTracker.setInPrivateClaimingMode')

  // allow bonusGmxTracker to stake stakedGmxTracker
  await sendTxn(
    stakedGmxTracker.setHandler(bonusGmxTracker.address, true),
    'stakedGmxTracker.setHandler(bonusGmxTracker)',
  )
}

export default deployFunction

deployFunction.dependencies = ['StakedGmxTracker']

deployFunction.tags = ['Stake', 'BonusGmxTracker']
