import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running EsGMX deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('EsGMX', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('EsGMX deployed at ', address)

  const esGmx = await ethers.getContract('EsGMX')
  await sendTxn(esGmx.setMinter(deployer, true), 'esGmx.setMinter(deployer)')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'EsGMX']
