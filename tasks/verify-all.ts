import { task } from 'hardhat/config'
import { NomicLabsHardhatPluginError } from 'hardhat/plugins'

task('verify:all', 'Verify all contracts', async (_, { ethers, run }) => {
  const network = process.env.HARDHAT_NETWORK || 'fantomtest'
  const tokens = require('../config/tokens.json')[network]
  const wftm = tokens.nativeToken
  const vault = await ethers.getContract('Vault')
  const usdg = await ethers.getContract('USDG')
  const router = await ethers.getContract('Router')
  const vaultPriceFeed = await ethers.getContract('VaultPriceFeed')
  const glp = await ethers.getContract('GLP')
  const glpManager = await ethers.getContract('GlpManager')
  const vaultErrorController = await ethers.getContract('VaultErrorController')
  const vaultUtils = await ethers.getContract('VaultUtils')
  const orderBook = await ethers.getContract('OrderBook')
  const positionManager = await ethers.getContract('PositionManager')
  const positionRouter = await ethers.getContract('PositionRouter')
  const tokenManager = await ethers.getContract('TokenManager')
  const fastPriceEvents = await ethers.getContract('FastPriceEvents')
  const fastPriceFeed = await ethers.getContract('FastPriceFeed')
  const referralStorage = await ethers.getContract('ReferralStorage')
  const referralReader = await ethers.getContract('ReferralReader')
  const orderBookReader = await ethers.getContract('OrderBookReader')
  const vaultReader = await ethers.getContract('VaultReader')
  const reader = await ethers.getContract('Reader')

  const contracts: {
    name: string
    address: string
    constructorArguments?: string[]
  }[] = [
    {
      name: 'Vault',
      address: vault.address,
      constructorArguments: [],
    },
    {
      name: 'USDG',
      address: usdg.address,
      constructorArguments: [vault.address],
    },
    {
      name: 'Router',
      address: router.address,
      constructorArguments: [vault.address, usdg.address, wftm.address],
    },
    {
      name: 'VaultPriceFeed',
      address: vaultPriceFeed.address,
      constructorArguments: [],
    },
    {
      name: 'GLP',
      address: glp.address,
      constructorArguments: [],
    },
    {
      name: 'GlpManager',
      address: glpManager.address,
      constructorArguments: [vault.address, usdg.address, glp.address, String(15 * 60)],
    },
    {
      name: 'VaultErrorController',
      address: vaultErrorController.address,
      constructorArguments: [],
    },
    {
      name: 'VaultUtils',
      address: vaultUtils.address,
      constructorArguments: [vault.address],
    },
    {
      name: 'OrderBook',
      address: orderBook.address,
      constructorArguments: [],
    },
    {
      name: 'PositionManager',
      address: positionManager.address,
      constructorArguments: [vault.address, router.address, wftm.address, '30', orderBook.address],
    },
    {
      name: 'PositionRouter',
      address: positionRouter.address,
      constructorArguments: [vault.address, router.address, wftm.address, '30', '300000000000000'],
    },
    {
      name: 'TokenManager',
      address: tokenManager.address,
      constructorArguments: ['1'],
    },
    {
      name: 'FastPriceEvents',
      address: fastPriceEvents.address,
      constructorArguments: [],
    },
    {
      name: 'FastPriceFeed',
      address: fastPriceFeed.address,
      constructorArguments: [
        String(5 * 60), // _priceDuration
        String(60 * 60), // _maxPriceUpdateDelay
        '0', // _minBlockInterval
        '750', // _maxDeviationBasisPoints
        fastPriceEvents.address, // _fastPriceEvents
        tokenManager.address, // _tokenManager
        positionRouter.address,
      ],
    },
    {
      name: 'ReferralStorage',
      address: referralStorage.address,
      constructorArguments: [],
    },
    {
      name: 'ReferralReader',
      address: referralReader.address,
      constructorArguments: [],
    },
    {
      name: 'OrderBookReader',
      address: orderBookReader.address,
      constructorArguments: [],
    },
    {
      name: 'VaultReader',
      address: vaultReader.address,
      constructorArguments: [],
    },
    {
      name: 'Reader',
      address: reader.address,
      constructorArguments: [],
    },
  ]

  for (const { address, constructorArguments } of contracts) {
    try {
      await run('verify:verify', {
        address,
        constructorArguments,
      })
    } catch (error) {
      if (error instanceof NomicLabsHardhatPluginError) {
        console.debug(error.message)
      }
    }
  }
})
