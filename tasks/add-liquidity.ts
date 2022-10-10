import { parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { GlpManager } from '../typechain'
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
    const tokenAddress = tokens[token].address
    const tokenInstance = (await getContractAt(
      '@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20',
      tokenAddress,
      deployer,
    )) as ERC20

    const decimals = await tokenInstance.decimals()

    await sendTxn(tokenInstance.approve(glpManager.address, parseUnits(amount, decimals)), 'approve')
    await sendTxn(glpManager.addLiquidity(tokenAddress, parseUnits(amount, decimals), 0, 0), 'glpManager.addLiquidity')
    console.log('addLiquidity successfully!')
  })
