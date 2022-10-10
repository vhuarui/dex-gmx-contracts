import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running VaultUtils deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const vault = await ethers.getContract('Vault')

  const { address } = await deploy('VaultUtils', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [vault.address],
  })

  console.log('VaultUtils deployed at ', address)

  const vaultUtils = await ethers.getContract('VaultUtils')
  await sendTxn(vault.setVaultUtils(vaultUtils.address), 'vault.setVaultUtils')
}

export default deployFunction

deployFunction.dependencies = ['Vault']

deployFunction.tags = ['VaultUtils']
