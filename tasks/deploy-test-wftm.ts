import { task } from 'hardhat/config'

task('test:wftm:deploy', 'Deploy Test WFTM').setAction(async function (_, { deployments, getNamedAccounts }) {
  const { deploy } = deployments

  const { deployer } = await getNamedAccounts()
  // console.log('Deployer:', deployer)

  const { address } = await deploy('WrappedFtm', {
    from: deployer,
    log: true,
    deterministicDeployment: false,
    skipIfAlreadyDeployed: false,
    // waitConfirmations: 3,
    args: [],
  })

  console.log('WFTM deployed at ', address)
})
