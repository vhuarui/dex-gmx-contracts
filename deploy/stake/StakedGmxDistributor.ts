import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { expandDecimals, sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({
  network,
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running StakedGmxDistributor deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const stakedGmxTracker = await ethers.getContract('StakedGmxTracker')
  const gmx = await ethers.getContract('GMX')
  const esGmx = await ethers.getContract('EsGMX')

  const { address } = await deploy('StakedGmxDistributor', {
    contract: 'RewardDistributor',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [esGmx.address, stakedGmxTracker.address],
  })

  console.log('StakedGmxDistributor deployed at ', address)

  const stakedGmxDistributor = await ethers.getContract('StakedGmxDistributor')
  if (!(await stakedGmxTracker.isInitialized())) {
    await sendTxn(
      stakedGmxTracker.initialize([gmx.address, esGmx.address], stakedGmxDistributor.address),
      'stakedGmxTracker.initialize',
    )
  }
  await sendTxn(stakedGmxDistributor.updateLastDistributionTime(), 'StakedGmxDistributor.updateLastDistributionTime')

  await sendTxn(
    esGmx.mint(stakedGmxDistributor.address, expandDecimals(50000 * 12, 18)),
    'esGmx.mint(stakedGmxDistributor',
  ) // ~50,000 GMX per month
  await sendTxn(
    stakedGmxDistributor.setTokensPerInterval('20667989410000000'),
    'stakedGmxDistributor.setTokensPerInterval',
  ) // 0.02066798941 esGmx per second
}

export default deployFunction

deployFunction.dependencies = ['StakedGmxTracker']

deployFunction.tags = ['Stake', 'StakedGmxDistributor']
