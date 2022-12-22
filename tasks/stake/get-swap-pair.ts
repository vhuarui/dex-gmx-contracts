import { task } from 'hardhat/config'
import { sendTxn, toUsd } from '../../utils/helper'
import { GMX, IUniswapV2Factory, IUniswapV2Router02, WrappedFtm } from '../../typechain'
import { parseUnits } from 'ethers/lib/utils'
import { constants } from 'ethers'

task('get:pair', 'Get Swap Pair').setAction(async function (
  _,
  { network, ethers: { provider, getNamedSigner, getContract, getContractAt } },
) {
  const deployer = await getNamedSigner('deployer')
  const tokens = require('../../config/tokens.json')[network.name]
  const { nativeToken } = tokens
  console.log('WFTM', nativeToken.address)
  const gmx = (await getContract('GMX', deployer)) as GMX
  const wftm = (await getContractAt('WrappedFtm', nativeToken.address, deployer)) as WrappedFtm
  console.log('gmx', gmx.address)

  const swap_factor = (await getContractAt(
    'IUniswapV2Factory',
    '0xA67679b8281A43F46fc886e9825f743010eB552b',
  )) as IUniswapV2Factory
  const pair_address = await swap_factor.getPair(gmx.address, wftm.address)
  console.log('pair address', pair_address)
})
