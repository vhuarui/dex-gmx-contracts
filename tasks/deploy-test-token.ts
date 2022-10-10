import { parseUnits } from 'ethers/lib/utils'
import { task } from 'hardhat/config'

task('test:token:deploy', 'Deploy Test Token')
  .addParam('name', 'token name')
  .addParam('symbol', 'token symbol')
  .addParam('decimals', 'decimals')
  .addParam('supply', 'initial supply')
  .setAction(async function ({ name, symbol, decimals, supply }, { deployments, getNamedAccounts }) {
    const { deploy } = deployments

    console.log(name, symbol, decimals, supply)
    const { deployer } = await getNamedAccounts()
    // console.log('Deployer:', deployer)

    const { address } = await deploy('TestERC20', {
      from: deployer,
      log: true,
      deterministicDeployment: false,
      skipIfAlreadyDeployed: false,
      // waitConfirmations: 3,
      args: [name, symbol, parseUnits(supply, decimals), decimals],
    })

    console.log(symbol, 'deployed at ', address)
  })
