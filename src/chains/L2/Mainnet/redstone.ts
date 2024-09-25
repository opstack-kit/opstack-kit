import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";

const sourceId = 1 // 

export const redstone = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 690,
  network: 'redstone',
  name: 'Redstone',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.redstonechain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.redstone.xyz/',
      apiUrl: 'https://explorer.redstone.xyz/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0xa426A052f657AEEefc298b3B5c35a470e4739d69',
      },
    },
    portal: {
      [sourceId]: {
        address: '0xC7bCb0e8839a28A1cFadd1CF716de9016CdA51ae',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xc473ca7E02af24c129c2eEf51F2aDf0411c1Df69',
      },
    },
  },
  testnet: true,
  sourceId,
})