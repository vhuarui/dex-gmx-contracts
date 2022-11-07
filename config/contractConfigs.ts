import { parseUnits } from 'ethers/lib/utils'
import { expandDecimals, toUsd } from '../utils/helper'

export const contractConfigs: { [networkName: string]: any } = {
  fantomtest: {
    vault: {
      fundingInterval: 60 * 60,
      fundingRateFactor: 100,
      stableFundingRateFactor: 100,
      mintBurnFeeBasisPoints: 25,
      swapFeeBasisPoints: 30,
      stableSwapFeeBasisPoints: 1,
      taxBasisPoints: 50,
      stableTaxBasisPoints: 5,
      marginFeeBasisPoints: 10,
      liquidationFeeUsd: toUsd(5),
      minProfitTime: 3 * 60 * 60,
      hasDynamicFees: true,
    },
    orderBook: {
      minExecutionFee: parseUnits('0.0003', 18),
      minPurchaseTokenAmountUsd: expandDecimals(10, 30),
    },
    fastPriceFeed: {
      priceDataInterval: 5 * 60,
      spreadBasisPointsIfInactive: 50,
      spreadBasisPointsIfChainError: 500,
      priceDuration: 5 * 60,
      maxPriceUpdateDelay: 60 * 60,
      maxDeviationBasisPoints: 750,
      minBlockInterval: 0,
      maxTimeDeviation: 60 * 60,
      minAuthorizations: 1,
      signer: ['0xDb521ed6606D2B41bAC64b2E1D081c48754B03A3'],
      updater: ['0xec501cf6Eebc5a35d417B972D66D1F0E20a91F62'],
      keeper: ['0x4555a5c7503314ccad80A40dCbACA06e889F1Fc8'],
    },
    positionManager: {
      depositFee: 30,
      orderKeeper: '0xC82cd982677CB0657D8f09146A880A47e0D9FD1E',
      liquidator: '0x809B16A805c46c5584752F22c984Fc98975CC6b3',
    },
    positionRouter: {
      depositFee: 30,
      minExecutionFee: parseUnits('0.0001', 18),
      minBlockDelayKeeper: 1,
      minTimeDelayPublic: 180,
      maxTimeDelay: 30 * 60,
    },
    glpManager: {
      cooldownDuration: 15 * 60,
    },
    tokenManager: {
      minAuthorizations: 1,
    },
    vaultTimeLock: {
      buffer: 24 * 60 * 60,
      maxTokenSupply: 0,
      maxMarginFeeBasisPoints: 500,
    },
    priceFeedTimelock: {
      buffer: 24 * 60 * 60,
    },
  },
  localhost: {
    vault: {
      fundingInterval: 60 * 60,
      fundingRateFactor: 100,
      stableFundingRateFactor: 100,
      mintBurnFeeBasisPoints: 25,
      swapFeeBasisPoints: 30,
      stableSwapFeeBasisPoints: 1,
      taxBasisPoints: 50,
      stableTaxBasisPoints: 5,
      marginFeeBasisPoints: 10,
      liquidationFeeUsd: toUsd(5),
      minProfitTime: 3 * 60 * 60,
      hasDynamicFees: true,
    },
    orderBook: {
      minExecutionFee: parseUnits('0.0003', 18),
      minPurchaseTokenAmountUsd: expandDecimals(10, 30),
    },
    fastPriceFeed: {
      priceDataInterval: 5 * 60,
      spreadBasisPointsIfInactive: 50,
      spreadBasisPointsIfChainError: 500,
      priceDuration: 5 * 60,
      maxPriceUpdateDelay: 60 * 60,
      maxDeviationBasisPoints: 750,
      minBlockInterval: 0,
      maxTimeDeviation: 60 * 60,
      minAuthorizations: 1,
      signer: ['0xDb521ed6606D2B41bAC64b2E1D081c48754B03A3'],
      updater: ['0xec501cf6Eebc5a35d417B972D66D1F0E20a91F62'],
      keeper: ['0x4555a5c7503314ccad80A40dCbACA06e889F1Fc8'],
    },
    positionManager: {
      depositFee: 30,
      orderKeeper: '0xC82cd982677CB0657D8f09146A880A47e0D9FD1E',
      liquidator: '0x809B16A805c46c5584752F22c984Fc98975CC6b3',
    },
    positionRouter: {
      depositFee: 30,
      minExecutionFee: parseUnits('0.0001', 18),
      minBlockDelayKeeper: 1,
      minTimeDelayPublic: 180,
      maxTimeDelay: 30 * 60,
    },
    glpManager: {
      cooldownDuration: 15 * 60,
    },
    tokenManager: {
      minAuthorizations: 1,
    },
    vaultTimeLock: {
      buffer: 24 * 60 * 60,
      maxTokenSupply: 0,
      maxMarginFeeBasisPoints: 500,
    },
    priceFeedTimelock: {
      buffer: 24 * 60 * 60,
    },
  },
}
