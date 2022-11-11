import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { expandDecimals, sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running BonusGmxDistributor deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const bnGmx = await ethers.getContract('BnGMX')
  const bonusGmxTracker = await ethers.getContract('BonusGmxTracker')
  const stakedGmxTracker = await ethers.getContract('StakedGmxTracker')

  const { address } = await deploy('BonusGmxDistributor', {
    contract: 'BonusDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [bnGmx.address, bonusGmxTracker.address],
  })

  console.log('BonusGmxDistributor deployed at ', address)

  const bonusGmxDistributor = await ethers.getContract('BonusGmxDistributor')
  if (!(await bonusGmxTracker.isInitialized())) {
    await sendTxn(
      bonusGmxTracker.initialize([stakedGmxTracker.address], bonusGmxDistributor.address),
      'bonusGmxTracker.initialize',
    )
  }
  await sendTxn(bonusGmxDistributor.updateLastDistributionTime(), 'bonusGmxDistributor.updateLastDistributionTime')

  await sendTxn(bonusGmxDistributor.setBonusMultiplier(10000), 'bonusGmxDistributor.setBonusMultiplier')
  await sendTxn(
    bnGmx.mint(bonusGmxDistributor.address, expandDecimals(15 * 1000 * 1000, 18)),
    'bnGmx.mint(bonusGmxDistributor)',
  )
}

export default deployFunction

deployFunction.dependencies = ['GMX', 'EsGMX', 'BnGMX', 'BonusGmxTracker']

deployFunction.tags = ['Stake', 'BonusGmxDistributor']
