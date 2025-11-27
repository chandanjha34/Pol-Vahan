import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import dotenv from "dotenv";

dotenv.config();

console.log("Private key from env:", process.env.PRIVATE_KEY);

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    polygon_amoy: {
      url: "https://rpc-amoy.polygon.technology",
      accounts: [process.env.PRIVATE_KEY] as string[],
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      PolygonTestnet: "not-needed",
    },
    customChains: [
      {
        network: "PolygonTestnet",
        chainId: 845320009,
        urls: {
          apiURL: "https://Polygon-explorer-testnet.appchain.base.org/api",
          browserURL: "https://Polygon-explorer-testnet.appchain.base.org"
        }
      }
    ]
  }
};


export default config;
