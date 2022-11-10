import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running GlpVester deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const vestingDuration = 365 * 24 * 60 * 60

  const gmx = await ethers.getContract('GMX')
  const esGmx = await ethers.getContract('EsGMX')
  const stakedGlpTracker = await ethers.getContract('StakedGlpTracker')

  const { address } = await deploy('GlpVester', {
    contract: 'Vester',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [
      'Vested GLP', // _name
      'vGLP', // _symbol
      vestingDuration, // _vestingDuration
      esGmx.address, // _esToken
      stakedGlpTracker.address, // _pairToken
      gmx.address, // _claimableToken
      stakedGlpTracker.address, // _rewardTracker
    ],
  })

  console.log('GlpVester deployed at ', address)

  const glpVester = await ethers.getContract('GlpVester')

  await sendTxn(esGmx.setHandler(glpVester.address, true), 'esGmx.setHandler(glpVester)')
  await sendTxn(esGmx.setMinter(glpVester.address, true), 'esGmx.setMinter(glpVester)')

  await sendTxn(stakedGlpTracker.setHandler(glpVester.address, true), 'stakedGlpTracker.setHandler(glpVester)')
}

export default deployFunction

deployFunction.dependencies = ['GMX', 'StakedGlpTracker']

deployFunction.tags = ['Stake', 'GlpVester']
