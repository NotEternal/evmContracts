const hre = require('hardhat')

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const contractsToDeploy = [
    { name: 'Storage', args: [] },
    // { name: 'Dash', args: [] },
  ]

  for (let i = 0; i < contractsToDeploy.length; i += 1) {
    const { name, args } = contractsToDeploy[i]
    const instance = await hre.ethers.getContractFactory(name)
    const contract = await instance.deploy(...args)

    await contract.deployed()

    console.log(`${name} deployed to:`, contract.address)
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
