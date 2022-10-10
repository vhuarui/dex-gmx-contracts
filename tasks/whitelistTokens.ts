import { parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { Vault, VaultPriceFeed } from '../typechain'
import { expandDecimals, sendTxn } from '../utils/helper'

task('whitelist', 'whitelist').setAction(async function (
  _,
  { ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const deployer = await getNamedSigner('deployer')

  const network = process.env.HARDHAT_NETWORK || 'fantomtest'
  const tokens = require('../config/tokens.json')[network]

  const vaultPriceFeed = (await getContract('VaultPriceFeed', deployer)) as VaultPriceFeed
  const vault = (await getContract('Vault', deployer)) as Vault
  
  const { btc, eth, link, usdc, ftm } = tokens
  const tokenArr = [btc, eth, link, usdc, ftm]
  const fastPriceTokens = [btc, eth, link, ftm]

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
      ),
      `vault.setTokenConfig(${token.name}) ${token.address}`,
    )
  }
})
