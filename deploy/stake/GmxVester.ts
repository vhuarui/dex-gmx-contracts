import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running GmxVester deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const vestingDuration = 365 * 24 * 60 * 60

  const gmx = await ethers.getContract('GMX')
  const esGmx = await ethers.getContract('EsGMX')
  const feeGmxTracker = await ethers.getContract('FeeGmxTracker')
  const stakedGmxTracker = await ethers.getContract('StakedGmxTracker')

  const { address } = await deploy('GmxVester', {
    contract: 'Vester',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [
      'Vested GMX', // _name
      'vGMX', // _symbol
      vestingDuration, // _vestingDuration
      esGmx.address, // _esToken
      feeGmxTracker.address, // _pairToken
      gmx.address, // _claimableToken
      stakedGmxTracker.address, // _rewardTracker
    ],
  })

  console.log('GmxVester deployed at ', address)

  const gmxVester = await ethers.getContract('GmxVester')

  await sendTxn(esGmx.setHandler(gmxVester.address, true), 'esGmx.setHandler(gmxVester)')
  await sendTxn(esGmx.setMinter(gmxVester.address, true), 'esGmx.setMinter(gmxVester)')

  await sendTxn(feeGmxTracker.setHandler(gmxVester.address, true), 'feeGmxTracker.setHandler(gmxVester)')
}

export default deployFunction

deployFunction.dependencies = ['GMX', 'FeeGmxTracker', 'StakedGmxTracker']

deployFunction.tags = ['Stake', 'GmxVester']
