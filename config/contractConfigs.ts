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
      signer: ['0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1'],
      updater: ['0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1'],
      keeper: ['0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1'],
    },
    positionManager: {
      depositFee: 30,
      orderKeeper: '0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1',
      liquidator: '0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1',
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
      signer: ['0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1'],
      updater: ['0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1'],
      keeper: ['0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1'],
    },
    positionManager: {
      depositFee: 30,
      orderKeeper: '0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1',
      liquidator: '0x184683Fb55958Fe7f663cd3E421cD41CafC79dE1',
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
  },
}
