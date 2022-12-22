import { task } from 'hardhat/config'
import { sendTxn, toUsd } from '../../utils/helper'
import { GMX, IUniswapV2Factory, IUniswapV2Router02, WrappedFtm } from '../../typechain'
import { parseUnits } from 'ethers/lib/utils'
import { constants } from 'ethers'

task('init:pair', 'Init Swap Pair').setAction(async function (
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

  async function getBlockTime() {
    const blockNumber = await provider.getBlockNumber()
    const block = await provider.getBlock(blockNumber)
    return block.timestamp
  }

  // Mint GMX
  await sendTxn(await gmx.setMinter(deployer.address, true), 'gmx.setMinter(deployer.address')
  await sendTxn(await gmx.mint(deployer.address, parseUnits('12')), 'gmx.mint(deployer.address')
  const swap_router = (await getContractAt(
    'IUniswapV2Router02',
    '0x9491a53405a2Bb91Ce812897fBE31dDa3c5a1F3F',
  )) as IUniswapV2Router02
  await sendTxn(await gmx.approve(swap_router.address, constants.MaxInt256), 'gmx approve router')
  await sendTxn(await wftm.approve(swap_router.address, constants.MaxInt256), 'wftm approve router')
  await wftm.deposit({ value: parseUnits('0.01') })
  await sendTxn(
    await swap_router.addLiquidity(
      gmx.address,
      wftm.address,
      parseUnits('12'),
      parseUnits('0.01'),
      0,
      0,
      deployer.address,
      (await getBlockTime()) + 120,
    ),
    'addLiquidity',
  )
})
