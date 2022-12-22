import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { GlpManager, RewardRouterV2 } from '../typechain'
import { ERC20 } from '../typechain'
import { sendTxn } from '../utils/helper'

task('add:liquidity', 'Add Liquidity')
  .addParam('token', 'token name')
  .addParam('amount', 'amount')
  .setAction(async function ({ token, amount }, { network, ethers: { getNamedSigner, getContract, getContractAt } }) {
    const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
    const deployer = await getNamedSigner('deployer')

    const glpManager = (await getContract('GlpManager', deployer)) as GlpManager
    console.log('glpManager address', glpManager.address)
    const rewardRouterV2 = (await getContract('RewardRouterV2', deployer)) as RewardRouterV2
    console.log('rewardRouterV2 address', rewardRouterV2.address)
    const tokenAddress = tokens[token].address
    const tokenInstance = (await getContractAt('TestERC20', tokenAddress, deployer)) as ERC20

    const decimals = await tokenInstance.decimals()
    const balance = await tokenInstance.balanceOf(deployer.address)
    console.log('balance', formatUnits(balance, decimals))

    await sendTxn(tokenInstance.approve(glpManager.address, parseUnits(amount, decimals)), 'approve')
    // await sendTxn(glpManager.addLiquidity(tokenAddress, parseUnits(amount, decimals), 0, 0), 'glpManager.addLiquidity')
    await sendTxn(
      rewardRouterV2.mintAndStakeGlp(tokenAddress, parseUnits(amount, decimals), 0, 0),
      'glpManager.addLiquidity',
    )

    console.log('addLiquidity successfully!')
  })
