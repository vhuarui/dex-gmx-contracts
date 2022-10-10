import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { errors } from '../config/errors'
import { sendTxn } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running VaultErrorController deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const vault = await ethers.getContract('Vault')

  const { address } = await deploy('VaultErrorController', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('VaultErrorController deployed at ', address)

  const vaultErrorController = await ethers.getContract('VaultErrorController')

  await sendTxn(vault.setErrorController(vaultErrorController.address), 'vault.setErrorController')
  await sendTxn(vaultErrorController.setErrors(vault.address, errors), 'vaultErrorController.setErrors')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['VaultErrorController']
