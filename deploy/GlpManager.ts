import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'
import { contractConfigs } from '../config/contractConfigs'

const deployFunction: DeployFunction = async function ({ deployments, network, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running GlpManager deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const contractConfig = contractConfigs[network.name || 'fantomtest']

  const vault = await ethers.getContract('Vault')
  const usdg = await ethers.getContract('USDG')
  const glp = await ethers.getContract('GLP')

  const cooldownDuration = contractConfig.glpManager.cooldownDuration

  const { address } = await deploy('GlpManager', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [vault.address, usdg.address, glp.address, cooldownDuration],
  })

  console.log('GlpManager deployed at ', address)

  const glpManager = await ethers.getContract('GlpManager')

  // await sendTxn(glpManager.setInPrivateMode(true), 'glpManager.setInPrivateMode')
  await sendTxn(glp.setMinter(glpManager.address, true), 'glp.setMinter')
  await sendTxn(usdg.addVault(glpManager.address), 'usdg.addVault(glpManager)')

  await sendTxn(vault.setInManagerMode(true), 'vault.setInManagerMode')
  await sendTxn(vault.setManager(glpManager.address, true), 'vault.setManager')
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'USDG', 'GLP']

deployFunction.tags = ['GlpManager']
