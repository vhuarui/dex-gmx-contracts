import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { contractConfigs } from '../config/contractConfigs'
import { sendTxn, toUsd } from '../utils/helper'

const deployFunction: DeployFunction = async function ({ network, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running Vault init script')

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)
  const contractConfig = contractConfigs[network.name || 'fantomtest']

  const vault = await ethers.getContract('Vault')
  const router = await ethers.getContract('Router')
  const usdg = await ethers.getContract('USDG')
  const vaultPriceFeed = await ethers.getContract('VaultPriceFeed')

  await sendTxn(
    vault.initialize(
      router.address, // router
      usdg.address, // usdg
      vaultPriceFeed.address, // priceFeed
      contractConfig.vault.liquidationFeeUsd, // liquidationFeeUsd
      contractConfig.vault.fundingRateFactor, // fundingRateFactor
      contractConfig.vault.stableFundingRateFactor, // stableFundingRateFactor
    ),
    'vault.initialize',
  )

  await sendTxn(vault.setFundingRate(60 * 60, 100, 100), 'vault.setFundingRate')
  await sendTxn(
    vault.setFundingRate(
      contractConfig.vault.fundingInterval,
      contractConfig.vault.fundingRateFactor,
      contractConfig.vault.stableFundingRateFactor,
    ),
    'vault.setFundingRate',
  )
  await sendTxn(
    vault.setFees(
      contractConfig.vault.taxBasisPoints, // _taxBasisPoints
      contractConfig.vault.stableTaxBasisPoints, // _stableTaxBasisPoints
      contractConfig.vault.mintBurnFeeBasisPoints, // _mintBurnFeeBasisPoints
      contractConfig.vault.swapFeeBasisPoints, // _swapFeeBasisPoints
      contractConfig.vault.stableSwapFeeBasisPoints, // _stableSwapFeeBasisPoints
      contractConfig.vault.marginFeeBasisPoints, // _marginFeeBasisPoints
      contractConfig.vault.liquidationFeeUsd, // _liquidationFeeUsd
      contractConfig.vault.minProfitTime, // _minProfitTime
      contractConfig.vault.hasDynamicFees, // _hasDynamicFees
    ),
    'vault.setFees',
  )
}

export default deployFunction

deployFunction.dependencies = ['Vault', 'Router', 'USDG', 'VaultPriceFeed', 'VaultUtils']

deployFunction.tags = ['InitVault']
