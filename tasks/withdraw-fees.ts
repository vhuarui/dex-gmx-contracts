import { task } from 'hardhat/config'
import { Timelock, Vault } from '../typechain'
import { sendTxn, toUsd } from '../utils/helper'

task('withdraw:fees', 'Set Vault Fees').setAction(async function (
  _,
  { network, ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const deployer = await getNamedSigner('deployer')

  const vault = (await getContract('Vault', deployer)) as Vault
  const timelock = (await getContractAt('Timelock', await vault.gov(), deployer)) as Timelock

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  
  const { btc, eth, link, usdc, ftm } = tokens

  const tokenArr = [btc, eth, link, usdc, ftm]

  for (let i = 0; i < tokenArr.length; i++) {
    const token = await getContractAt('Token', tokenArr[i].address)
    const poolAmount = await vault.poolAmounts(token.address)
    const feeReserve = await vault.feeReserves(token.address)
    const balance = await token.balanceOf(vault.address)
    const vaultAmount = poolAmount.add(feeReserve)

    if (vaultAmount.gt(balance)) {
      throw new Error(`vaultAmount > vault.balance, ${vaultAmount.toString()}, ${balance.toString()}`)
    }
  }

  await sendTxn(
    timelock.batchWithdrawFees(
      vault.address,
      tokenArr.map((t) => t.address),
    ),
    `timelock.batchWithdrawFees`,
  )
})
