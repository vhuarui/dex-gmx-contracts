import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn } from '../../utils/helper'

const deployFunction: DeployFunction = async function ({
  network,
  deployments,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running RewardRouterV2 deploy script')
  const { deploy } = deployments
  const { AddressZero } = ethers.constants

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const tokens = require('../../config/tokens.json')[network.name || 'fantomtest']
  const { nativeToken } = tokens

  const { address } = await deploy('RewardRouterV2', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('RewardRouterV2 deployed at ', address)

  const rewardRouter = await ethers.getContract('RewardRouterV2')

  const glp = await ethers.getContract('GLP')
  const glpManager = await ethers.getContract('GlpManager')

  const gmx = await ethers.getContract('GMX')
  const esGmx = await ethers.getContract('EsGMX')
  const bnGmx = await ethers.getContract('BnGMX')

  const stakedGmxTracker = await ethers.getContract('StakedGmxTracker')
  const bonusGmxTracker = await ethers.getContract('BonusGmxTracker')
  const feeGmxTracker = await ethers.getContract('FeeGmxTracker')
  const gmxVester = await ethers.getContract('GmxVester')

  const feeGlpTracker = await ethers.getContract('FeeGlpTracker')
  const stakedGlpTracker = await ethers.getContract('StakedGlpTracker')
  const glpVester = await ethers.getContract('GlpVester')

  if (!(await rewardRouter.isInitialized())) {
    await sendTxn(
      rewardRouter.initialize(
        nativeToken.address,
        gmx.address,
        esGmx.address,
        bnGmx.address,
        glp.address,
        stakedGmxTracker.address,
        bonusGmxTracker.address,
        feeGmxTracker.address,
        feeGlpTracker.address,
        stakedGlpTracker.address,
        glpManager.address,
        gmxVester.address,
        glpVester.address,
      ),
      'rewardRouter.initialize',
    )
  }

  await sendTxn(glpManager.setHandler(rewardRouter.address, true), 'glpManager.setHandler(rewardRouter)')

  // allow rewardRouter to stake in stakedGmxTracker
  await sendTxn(stakedGmxTracker.setHandler(rewardRouter.address, true), 'stakedGmxTracker.setHandler(rewardRouter)')
  // allow rewardRouter to stake in bonusGmxTracker
  await sendTxn(bonusGmxTracker.setHandler(rewardRouter.address, true), 'bonusGmxTracker.setHandler(rewardRouter)')
  // allow rewardRouter to stake in feeGmxTracker
  await sendTxn(feeGmxTracker.setHandler(rewardRouter.address, true), 'feeGmxTracker.setHandler(rewardRouter)')
  await sendTxn(gmxVester.setHandler(rewardRouter.address, true), 'gmxVester.setHandler(rewardRouter)')

  // allow rewardRouter to stake in feeGlpTracker
  await sendTxn(feeGlpTracker.setHandler(rewardRouter.address, true), 'feeGlpTracker.setHandler(rewardRouter)')
  // allow rewardRouter to stake in stakedGlpTracker
  await sendTxn(stakedGlpTracker.setHandler(rewardRouter.address, true), 'stakedGlpTracker.setHandler(rewardRouter)')

  await sendTxn(esGmx.setHandler(rewardRouter.address, true), 'esGmx.setHandler(rewardRouter)')
  await sendTxn(glpVester.setHandler(rewardRouter.address, true), 'glpVester.setHandler(rewardRouter)')

  // allow rewardRouter to burn bnGmx
  await sendTxn(bnGmx.setMinter(rewardRouter.address, true), 'bnGmx.setMinter(rewardRouter')
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'RewardRouterV2']
