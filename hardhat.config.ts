import 'dotenv/config'
import 'hardhat-spdx-license-identifier'
import '@nomicfoundation/hardhat-toolbox'
import 'hardhat-deploy'
import 'hardhat-contract-sizer'

import type { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

const privateKey = process.env.PRIVATE_KEY
const mnemonic = 'test test test test test test test test test test test junk'
let accounts
if (privateKey) {
  accounts = [privateKey]
} else {
  accounts = {
    mnemonic,
  }
}

const namedAccounts = {
  deployer: {
    default: 0,
  },
  admin: {
    default: 0,
  },
  dev: {
    default: 0,
  },
}

export type Signers = { [name in keyof typeof namedAccounts]: SignerWithAddress }

import './tasks'

import { HardhatUserConfig } from 'hardhat/config'

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: '0.8.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1,
          },
        },
      },
      {
        version: '0.5.16',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    sources: './contracts',
    // sources: "./flat",
    tests: './test',
    cache: './cache',
    artifacts: './artifacts',
  },
  namedAccounts,
  networks: {
    hardhat: {
      forking: {
        url: 'https://rpc.testnet.fantom.network',
      },
    },
    bsctest: {
      url: `https://data-seed-prebsc-1-s1.binance.org:8545/`,
      accounts,
      verify: {
        etherscan: {
          apiKey: process.env.BSC_SCAN_KEY ? process.env.BSC_SCAN_KEY : '',
        },
      },
    },
    bscmainnet: {
      url: `https://bsc-dataseed.binance.org/`,
      accounts,
      verify: {
        etherscan: {
          apiKey: process.env.BSC_SCAN_KEY ? process.env.BSC_SCAN_KEY : '',
        },
      },
    },
    fantomtest: {
      url: `https://rpc.testnet.fantom.network`,
      accounts,
      verify: {
        etherscan: {
          apiKey: process.env.FANTOMSCAN_API_KEY ? process.env.FANTOMSCAN_API_KEY : '',
        },
      },
    },
    localhost: {
      url: `http://localhost:8545`,
      accounts,
    },
    truffle: {
      url: `http://localhost:24012/rpc`,
      timeout: 60 * 60 * 1000,
    },
  },
  typechain: {
    outDir: 'typechain',
    target: 'ethers-v5',
  },
  gasReporter: {
    enabled: true,
    currency: 'USD',
  },
}
export default config
