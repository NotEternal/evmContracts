require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')

const config = require('dotenv').config()
const { ACCOUNT_PRIVATE_KEY, ETHERSCAN_API_KEY, BSCSCAN_API_KEY } =
  config.parsed

// https://hardhat.org/guides/create-task.html
task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners()

  for (const account of accounts) {
    console.log(account.address)
  }
})

// https://hardhat.org/config/
/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: '0.8.12',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
      {
        version: '0.8.10',
        settings: {
          optimizer: {
            enabled: true,
            runs: 99999,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {},
    rinkeby: {
      chainId: 4,
      url: 'https://rinkeby.infura.io/v3/3cb031735f9a46a69f2babab4fae3e0d',
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
  },
  mocha: {
    timeout: 40_000,
  },
  etherscan: {
    apiKey: {
      mainnet: ETHERSCAN_API_KEY,
      rinkeby: ETHERSCAN_API_KEY,
      bsc: BSCSCAN_API_KEY,
      bscTestnet: BSCSCAN_API_KEY,
      // polygon: "",
      // polygonMumbai: "",
      // heco: "",
      // hecoTestnet: "",
      // opera: "",
      // ftmTestnet: "",
      // optimisticEthereum: "",
      // optimisticKovan: "",
      // arbitrumOne: "",
      // arbitrumTestnet: "",
      // avalanche: "",
      // avalancheFujiTestnet: "",
      // moonbeam: "",
      // moonriver: "",
      // moonbaseAlpha: "",
      // harmony: "",
      // harmonyTest: "",
      // xdai: "",
      // sokol: "",
      // aurora: "",
      // auroraTestnet: "",
    },
  },
}
