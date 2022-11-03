import { ethers } from 'hardhat'
import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'
import { sendTxn, expandDecimals } from '../utils/helper'

const deployFunction: DeployFunction = async function ({
  deployments,
  network,
  getNamedAccounts,
}: HardhatRuntimeEnvironment) {
  console.log('Running VaultPriceFeed deploy script')
  const { deploy } = deployments
  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const { btc, eth, link, usdc, ftm } = tokens
  const tokenArr = [btc, eth, link, usdc, ftm]

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('VaultPriceFeed', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('VaultPriceFeed deployed at ', address)

  const vaultPriceFeed = await ethers.getContract('VaultPriceFeed')
  await sendTxn(
    vaultPriceFeed.setMaxStrictPriceDeviation(expandDecimals(1, 28)),
    'vaultPriceFeed.setMaxStrictPriceDeviation',
  ) // 0.01 USD
  await sendTxn(vaultPriceFeed.setPriceSampleSpace(1), 'vaultPriceFeed.setPriceSampleSpace')
  await sendTxn(vaultPriceFeed.setIsAmmEnabled(false), 'vaultPriceFeed.setIsAmmEnabled')

  for (const tokenItem of tokenArr) {
    if (tokenItem.spreadBasisPoints === undefined) {
      continue
    }
    await sendTxn(
      vaultPriceFeed.setSpreadBasisPoints(
        tokenItem.address, // _token
        tokenItem.spreadBasisPoints, // _spreadBasisPoints
      ),
      `vaultPriceFeed.setSpreadBasisPoints(${tokenItem.name}) ${tokenItem.spreadBasisPoints}`,
    )
  }

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
  }
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['VaultPriceFeed']
