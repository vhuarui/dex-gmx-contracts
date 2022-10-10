import { parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'
import { TestERC20, GlpManager, PositionRouter, Router, Vault } from '../typechain'
import { sendTxn, toUsd } from '../utils/helper'

task('test:task', 'Test Task').setAction(async function (
  _,
  { network, ethers: { getNamedSigner, getContract, getContractAt } },
) {
  const tokens = require('../config/tokens.json')[network.name || 'fantomtest']
  const deployer = await getNamedSigner('deployer')
  const admin = await getNamedSigner('admin')

  const glpManager = (await getContract('GlpManager', deployer)) as GlpManager
  const vault = (await getContract('Vault', deployer)) as Vault
  console.log('getMinPrice', (await vault.getMinPrice(tokens.btc.address)).toString())
  return
  console.log('glpManager address', glpManager.address)

  const positionRouter = (await getContract('PositionRouter', deployer)) as PositionRouter
  const router = (await getContract('Router', deployer)) as Router
  const token = (await getContractAt(
    'TestERC20',
    tokens.btc.address,
    deployer,
  )) as TestERC20

  await sendTxn(positionRouter.setPositionKeeper(admin.address, true), 'positionRouter.setPositionKeeper')

  const executionFee = await positionRouter.minExecutionFee()

  const referralCode = '0x0000000000000000000000000000000000000000000000000000000000000000'

  await sendTxn(router.approvePlugin(positionRouter.address), 'router.approvePlugin')
  await sendTxn(token.approve(router.address, parseUnits('1', 18)), 'btc.approve ')
  await sendTxn(
    positionRouter.createIncreasePosition(
      [token.address], // _path
      token.address, // _indexToken
      parseUnits('1', 18), // _amountIn
      parseUnits('0.1', 18), // _minOut
      toUsd(21000), // _sizeDelta
      true, // _isLong
      toUsd(30000), // _acceptablePrice
      executionFee,
      referralCode,
      {
        value: executionFee,
      },
    ),
    'createIncreasePosition long..',
  )
})
