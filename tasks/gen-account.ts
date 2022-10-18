import { task } from 'hardhat/config'
import { randomHex } from '../utils/encoding'

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task('gen-account', 'Gen Account', async (_, { ethers }) => {
  const provider = ethers.provider
  const privateKey = randomHex(32)
  const newAccount = new ethers.Wallet(privateKey, provider)
  console.log('privateKey', privateKey)
  console.log('Account', newAccount.address)
})
