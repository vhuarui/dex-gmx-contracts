import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn, expandDecimals } from '../utils/helper'
import { contractConfigs } from '../config/contractConfigs'

const deployFunction: DeployFunction = async function ({
  deployments,
  network,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running FastPriceFeed deploy script')

  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const contractConfig = contractConfigs[network.name || 'fantomtest']
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

  const updater = contractConfig.fastPriceFeed.updater
  const keeper = contractConfig.fastPriceFeed.keeper
  const updaters = updater.concat(keeper)

  const signers = contractConfig.fastPriceFeed.signer

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
      contractConfig.fastPriceFeed.priceDuration, // _priceDuration
      contractConfig.fastPriceFeed.maxPriceUpdateDelay, // _maxPriceUpdateDelay
      contractConfig.fastPriceFeed.minBlockInterval, // _minBlockInterval
      contractConfig.fastPriceFeed.maxDeviationBasisPoints, // _maxDeviationBasisPoints
      fastPriceEvents.address, // _fastPriceEvents
      tokenManager.address, // _tokenManager
      positionRouter.address,
    ],
  })

  console.log('FastPriceFeed deployed at ', address)

  const secondaryPriceFeed = await ethers.getContract('FastPriceFeed')

  await sendTxn(secondaryPriceFeed.initialize(contractConfig.fastPriceFeed.minAuthorizations, signers, updaters), 'secondaryPriceFeed.initialize')
  await sendTxn(secondaryPriceFeed.setMaxTimeDeviation(contractConfig.fastPriceFeed.maxTimeDeviation), 'secondaryPriceFeed.setMaxTimeDeviation')

  await sendTxn(
    positionRouter.setPositionKeeper(secondaryPriceFeed.address, true),
    'positionRouter.setPositionKeeper(secondaryPriceFeed)',
  )

  await sendTxn(fastPriceEvents.setIsPriceFeed(secondaryPriceFeed.address, true), 'fastPriceEvents.setIsPriceFeed')

  await sendTxn(
    vaultPriceFeed.setSecondaryPriceFeed(secondaryPriceFeed.address),
    'vaultPriceFeed.setSecondaryPriceFeed',
  )

  await sendTxn(
    secondaryPriceFeed.setTokens(
      fastPriceTokens.map((t) => t.address),
      fastPriceTokens.map((t) => t.fastPricePrecision),
    ),
    'secondaryPriceFeed.setTokens',
  )
  await sendTxn(secondaryPriceFeed.setVaultPriceFeed(vaultPriceFeed.address), 'secondaryPriceFeed.setVaultPriceFeed')
  await sendTxn(
    secondaryPriceFeed.setSpreadBasisPointsIfInactive(contractConfig.fastPriceFeed.spreadBasisPointsIfInactive),
    'secondaryPriceFeed.setSpreadBasisPointsIfInactive',
  )
  await sendTxn(
    secondaryPriceFeed.setSpreadBasisPointsIfChainError(contractConfig.fastPriceFeed.spreadBasisPointsIfChainError),
    'secondaryPriceFeed.setSpreadBasisPointsIfChainError',
  )
  await sendTxn(
    secondaryPriceFeed.setMaxCumulativeDeltaDiffs(
      fastPriceTokens.map((t) => t.address),
      fastPriceTokens.map((t) => t.maxCumulativeDeltaDiff),
    ),
    'secondaryPriceFeed.setMaxCumulativeDeltaDiffs',
  )
  await sendTxn(secondaryPriceFeed.setPriceDataInterval(contractConfig.fastPriceFeed.priceDataInterval), 'secondaryPriceFeed.setPriceDataInterval')

  for (const token of tokenArr) {
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
