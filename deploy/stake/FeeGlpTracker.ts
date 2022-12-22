import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running FeeGlpTracker deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('FeeGlpTracker', {
    contract: 'RewardTracker',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ['Fee GLP', 'fGLP'],
  })

  console.log('FeeGlpTracker deployed at ', address)

  const glp = await ethers.getContract('GLP')
  const glpManager = await ethers.getContract('GlpManager')
  const feeGlpTracker = await ethers.getContract('FeeGlpTracker')

  await sendTxn(glpManager.setInPrivateMode(true), 'glpManager.setInPrivateMode')
  await sendTxn(feeGlpTracker.setInPrivateTransferMode(true), 'feeGlpTracker.setInPrivateTransferMode')
  await sendTxn(feeGlpTracker.setInPrivateStakingMode(true), 'feeGlpTracker.setInPrivateStakingMode')

  // allow feeGlpTracker to stake glp
  await sendTxn(glp.setHandler(feeGlpTracker.address, true), 'glp.setHandler(feeGlpTracker)')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'FeeGlpTracker']
