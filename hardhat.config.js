require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

const { SEPOLIA_RPC, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: '0.8.19',
  networks: {
    sepolia: {
      url: SEPOLIA_RPC || 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
};
