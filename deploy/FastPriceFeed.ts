import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn, expandDecimals } from '../utils/helper'

const deployFunction: DeployFunction = async function ({
  deployments,
  network,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running FastPriceFeed deploy script')

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { btc, eth, link, usdc, ftm } = tokens
  const tokenArr = [btc, eth, link, usdc, ftm]
  const fastPriceTokens = [btc, eth, link, ftm]
  if (fastPriceTokens.find((t) => !t.fastPricePrecision)) {
    throw new Error('Invalid price precision')
  }

  if (fastPriceTokens.find((t) => !t.maxCumulativeDeltaDiff)) {
    throw new Error('Invalid price maxCumulativeDeltaDiff')
  }

  const updater = [deployer]
  const keeper = [deployer]
  const updaters = updater.concat(keeper)

  const signers = [deployer]

  const fastPriceEvents = await ethers.getContract('FastPriceEvents')
  const tokenManager = await ethers.getContract('TokenManager')
  const positionRouter = await ethers.getContract('PositionRouter')
  const vaultPriceFeed = await ethers.getContract('VaultPriceFeed')
  const vault = await ethers.getContract('Vault')

  const { address } = await deploy('FastPriceFeed', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [
      5 * 60, // _priceDuration
      60 * 60, // _maxPriceUpdateDelay
      0, // _minBlockInterval
      750, // _maxDeviationBasisPoints
      fastPriceEvents.address, // _fastPriceEvents
      tokenManager.address, // _tokenManager
      positionRouter.address,
    ],
  })

  console.log('FastPriceFeed deployed at ', address)

  const secondaryPriceFeed = await ethers.getContract('FastPriceFeed')

  await sendTxn(secondaryPriceFeed.initialize(1, signers, updaters), 'secondaryPriceFeed.initialize')
  await sendTxn(secondaryPriceFeed.setMaxTimeDeviation(60 * 60), 'secondaryPriceFeed.setMaxTimeDeviation')

  await sendTxn(
    positionRouter.setPositionKeeper(secondaryPriceFeed.address, true),
    'positionRouter.setPositionKeeper(secondaryPriceFeed)',
  )

  await sendTxn(fastPriceEvents.setIsPriceFeed(secondaryPriceFeed.address, true), 'fastPriceEvents.setIsPriceFeed')

  await sendTxn(
    vaultPriceFeed.setSecondaryPriceFeed(secondaryPriceFeed.address),
    'vaultPriceFeed.setSecondaryPriceFeed',
  )
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), 'vaultPriceFeed.setIsAmmEnabled')

  await sendTxn(
    secondaryPriceFeed.setTokens(
      fastPriceTokens.map((t) => t.address),
      fastPriceTokens.map((t) => t.fastPricePrecision),
    ),
    'secondaryPriceFeed.setTokens',
  )
  await sendTxn(secondaryPriceFeed.setVaultPriceFeed(vaultPriceFeed.address), 'secondaryPriceFeed.setVaultPriceFeed')
  await sendTxn(secondaryPriceFeed.setMaxTimeDeviation(60 * 60), 'secondaryPriceFeed.setMaxTimeDeviation')
  await sendTxn(
    secondaryPriceFeed.setSpreadBasisPointsIfInactive(50),
    'secondaryPriceFeed.setSpreadBasisPointsIfInactive',
  )
  await sendTxn(
    secondaryPriceFeed.setSpreadBasisPointsIfChainError(500),
    'secondaryPriceFeed.setSpreadBasisPointsIfChainError',
  )
  await sendTxn(
    secondaryPriceFeed.setMaxCumulativeDeltaDiffs(
      fastPriceTokens.map((t) => t.address),
      fastPriceTokens.map((t) => t.maxCumulativeDeltaDiff),
    ),
    'secondaryPriceFeed.setMaxCumulativeDeltaDiffs',
  )
  await sendTxn(secondaryPriceFeed.setPriceDataInterval(5 * 60), 'secondaryPriceFeed.setPriceDataInterval')

  for (const token of tokenArr) {
    await sendTxn(
      vaultPriceFeed.setTokenConfig(
        token.address, // _token
        token.priceFeed, // _priceFeed
        token.priceDecimals, // _priceDecimals
        token.isStrictStable, // _isStrictStable
      ),
      `vaultPriceFeed.setTokenConfig(${token.name}) ${token.address} ${token.priceFeed}`,
    )

    await sendTxn(
      vault.setTokenConfig(
        token.address, // _token
        token.decimals, // _tokenDecimals
        token.tokenWeight, // _tokenWeight
        token.minProfitBps, // _minProfitBps
        expandDecimals(token.maxUsdgAmount, 18), // _maxUsdgAmount
        token.isStable, // _isStable
        token.isShortable, // _isShortable
        { gasLimit: 9000000 },
      ),
      `vault.setTokenConfig(${token.name}) ${token.address}`,
    )
  }
}

export default deployFunction

deployFunction.dependencies = ['InitVault', 'FastPriceEvents', 'TokenManager', 'PositionRouter', 'VaultPriceFeed']

deployFunction.tags = ['FastPriceFeed']
