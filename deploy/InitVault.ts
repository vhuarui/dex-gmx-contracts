import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn, toUsd } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running Vault init script')

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const vault = await ethers.getContract('Vault')
  const router = await ethers.getContract('Router')
  const usdg = await ethers.getContract('USDG')
  const vaultPriceFeed = await ethers.getContract('VaultPriceFeed')

  await sendTxn(
    vault.initialize(
      router.address, // router
      usdg.address, // usdg
      vaultPriceFeed.address, // priceFeed
      toUsd(2), // liquidationFeeUsd
      100, // fundingRateFactor
      100, // stableFundingRateFactor
    ),
    'vault.initialize',
  )

  await sendTxn(vault.setFundingRate(60 * 60, 100, 100), 'vault.setFundingRate')
  await sendTxn(
    vault.setFees(
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
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'Router', 'USDG', 'VaultPriceFeed', 'VaultUtils']

deployFunction.tags = ['InitVault']
