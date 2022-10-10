import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn, expandDecimals } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running TokenManager deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const signers = [deployer]

  const { address } = await deploy('TokenManager', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [1],
  })

  console.log('TokenManager deployed at ', address)

  const tokenManager = await ethers.getContract('TokenManager')
  await sendTxn(tokenManager.initialize(signers), 'tokenManager.initialize')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['TokenManager']
