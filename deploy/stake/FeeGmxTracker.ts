import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running FeeGmxTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('FeeGmxTracker', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args:  ["Staked + Bonus + Fee GMX", "sbfGMX"],
  })

  console.log('FeeGmxTracker deployed at ', address)

  const bnGmx = await ethers.getContract('BnGMX')
  const feeGmxTracker = await ethers.getContract('FeeGmxTracker')
  const bonusGmxTracker = await ethers.getContract('BonusGmxTracker')

  await sendTxn(feeGmxTracker.setInPrivateTransferMode(true), 'feeGmxTracker.setInPrivateTransferMode')
  await sendTxn(feeGmxTracker.setInPrivateStakingMode(true), 'feeGmxTracker.setInPrivateStakingMode')

  // allow bonusGmxTracker to stake feeGmxTracker
  await sendTxn(bonusGmxTracker.setHandler(feeGmxTracker.address, true), 'bonusGmxTracker.setHandler(feeGmxTracker)')

  // allow feeGmxTracker to stake bnGmx
  await sendTxn(bnGmx.setHandler(feeGmxTracker.address, true), 'bnGmx.setHandler(feeGmxTracker')
}

export default deployFunction

deployFunction.dependencies = ['BnGMX', 'BonusGmxTracker']

deployFunction.tags = ['Stake', 'FeeGmxTracker']
