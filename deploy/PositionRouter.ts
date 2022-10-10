import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../utils/helper'

const network = process.env.HARDHAT_NETWORK || 'fantomtest'
const tokens = require('../config/tokens.json')[network]

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running PositionRouter deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const depositFee = '30' // 0.3%
  const minExecutionFee = '300000000000000' // 0.0003 ETH

  const vault = await ethers.getContract('Vault')
  const router = await ethers.getContract('Router')
  const weth = await ethers.getContractAt('WETH', tokens.nativeToken.address)

  const { address } = await deploy('PositionRouter', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [vault.address, router.address, weth.address, depositFee, minExecutionFee],
  })

  console.log('PositionRouter deployed at ', address)

  const positionRouter = await ethers.getContract('PositionRouter')

  await sendTxn(router.addPlugin(positionRouter.address), 'router.addPlugin')

  await sendTxn(positionRouter.setDelayValues(1, 180, 30 * 60), 'positionRouter.setDelayValues')
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'Router']

deployFunction.tags = ['PositionRouter']
