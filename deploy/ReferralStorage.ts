import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running ReferralStorage deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('ReferralStorage', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('ReferralStorage deployed at ', address)

  const referralStorage = await ethers.getContract('ReferralStorage')
  const positionRouter = await ethers.getContract('PositionRouter')
  const positionManager = await ethers.getContract('PositionManager')

  await sendTxn(positionRouter.setReferralStorage(referralStorage.address), 'positionRouter.setReferralStorage')
  await sendTxn(positionManager.setReferralStorage(referralStorage.address), 'positionManager.setReferralStorage')

  await sendTxn(referralStorage.setHandler(positionRouter.address, true), 'referralStorage.setHandler(positionRouter)')
}

export default deployFunction

deployFunction.dependencies = ['PositionRouter', 'PositionManager']

deployFunction.tags = ['ReferralStorage']
