require('@nomiclabs/hardhat-waffle')
require('@nomiclabs/hardhat-etherscan')

const config = require('dotenv').config()
const {
  ACCOUNT_PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  BSCSCAN_API_KEY,
  POLYGON_API_KEY,
} = config.parsed

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
    bsc: {
      chainId: 56,
      url: 'https://bsc-dataseed.binance.org',
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    bscTestnet: {
      chainId: 97,
      url: 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    polygon: {
      chainId: 137,
      url: 'https://polygon-rpc.com/',
      accounts: [ACCOUNT_PRIVATE_KEY],
    },
    polygonTestnet: {
      chainId: 80001,
      url: 'https://matic-mumbai.chainstacklabs.com',
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
      polygon: POLYGON_API_KEY,
      polygonMumbai: POLYGON_API_KEY,
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
