import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({
  deployments,
  network,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running Router deploy script')

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const vault = await ethers.getContract('Vault')
  const usdg = await ethers.getContract('USDG')

  const { address } = await deploy('Router', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [vault.address, usdg.address, tokens.nativeToken.address],
  })

  console.log('Router deployed at ', address)
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'USDG']

deployFunction.tags = ['Router']
