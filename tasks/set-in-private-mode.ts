import { parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { GlpManager } from '../typechain'
import { sendTxn } from '../utils/helper'

task('glp_manager:private_mode:off', 'glp_manager:private_mode:off').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const deployer = await getNamedSigner('deployer')

  const glpManager = (await getContract('GlpManager', deployer)) as GlpManager
  await sendTxn(glpManager.setInPrivateMode(false), 'glpManager.setInPrivateMode(false)')
  console.log('addLiquidity successfully!')
})
