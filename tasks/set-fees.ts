import { task } from 'hardhat/config'
import { Timelock, Vault } from '../typechain'
import { sendTxn, toUsd } from '../utils/helper'

task('set:fees', 'Set Vault Fees').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const deployer = await getNamedSigner('deployer')

  const vault = (await getContract('Vault', deployer)) as Vault
  const timelock = (await getContractAt('Timelock', await vault.gov(), deployer)) as Timelock

  await sendTxn(
    timelock.setFees(
      vault.address,
      50, // _taxBasisPoints
      5, // _stableTaxBasisPoints
      25, // _mintBurnFeeBasisPoints
      30, // _swapFeeBasisPoints
      1, // _stableSwapFeeBasisPoints
      10, // _marginFeeBasisPoints
      toUsd(5), // _liquidationFeeUsd
      3 * 60 * 60, // _minProfitTime
      true, // _hasDynamicFees
    ),
    'vault.setFees',
  )
  console.log('SetFees successfully!')
})
