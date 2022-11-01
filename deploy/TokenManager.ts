import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { contractConfigs } from '../config/contractConfigs'
import { sendTxn, expandDecimals } from '../utils/helper'

const deployFunction: DeployFunction = async function ({
  deployments,
  network,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running TokenManager deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const contractConfig = contractConfigs[network.name || 'fantomtest']

  const signers = [deployer]

  const { address } = await deploy('TokenManager', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [contractConfig.tokenManager.minAuthorizations],
  })

  console.log('TokenManager deployed at ', address)

  const tokenManager = await ethers.getContract('TokenManager')
  await sendTxn(tokenManager.initialize(signers), 'tokenManager.initialize')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['TokenManager']
