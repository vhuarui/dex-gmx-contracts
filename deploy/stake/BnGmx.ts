import { DeployFunction } from 'hardhat-deploy/types'
import { HardhatRuntimeEnvironment } from 'hardhat/types'

const deployFunction: DeployFunction = async function ({ deployments, getNamedAccounts }: HardhatRuntimeEnvironment) {
  console.log('Running BnGmx deploy script')
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('BnGMX', {
    contract: 'MintableBaseToken',
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: ["Bonus GMX", "bnGMX", 0],
  })

  console.log('BnGmx deployed at ', address)
}

export default deployFunction

deployFunction.dependencies = []

deployFunction.tags = ['Stake', 'BnGmx']
