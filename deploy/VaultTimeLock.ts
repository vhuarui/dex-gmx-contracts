import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'
import { contractConfigs } from '../config/contractConfigs'

const deployFunction: DeployFunction = async function ({ deployments, network, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running Vault TimeLock deploy script')
  const { deploy } = deployments

  const { deployer, admin } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const contractConfig = contractConfigs[network.name || 'fantomtest']

  const vault = await ethers.getContract('Vault')
  const tokenManager = await ethers.getContract('TokenManager')
  const glpManager = await ethers.getContract('GlpManager')

  const { address } = await deploy('Timelock', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [
      deployer, // admin
      contractConfig.vaultTimeLock.buffer, // buffer
      tokenManager.address, // tokenManager
      tokenManager.address, // mintReceiver
      glpManager.address, // glpManager
      contractConfig.vaultTimeLock.maxTokenSupply, // maxTokenSupply
      contractConfig.vault.marginFeeBasisPoints, // marginFeeBasisPoints
      contractConfig.vaultTimeLock.maxMarginFeeBasisPoints, // maxMarginFeeBasisPoints
    ],
  })

  console.log('Vault TimeLock deployed at ', address)

  const timeLock = await ethers.getContract('Timelock')
  const positionManager = await ethers.getContract('PositionManager')
  const positionRouter = await ethers.getContract('PositionRouter')
  await sendTxn(vault.setGov(timeLock.address), `vault.setGov`)

  await sendTxn(
    timeLock.setShouldToggleIsLeverageEnabled(true),
    'deployedTimelock.setShouldToggleIsLeverageEnabled(true)',
  )
  await sendTxn(
    timeLock.setContractHandler(positionRouter.address, true),
    'timelock.setContractHandler(positionRouter)',
  )
  await sendTxn(
    timeLock.setContractHandler(positionManager.address, true),
    'timelock.setContractHandler(positionManager)',
  )
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'FastPriceFeed']

deployFunction.tags = ['VaultTimeLock']
