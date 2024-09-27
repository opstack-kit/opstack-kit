import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";

const sourceId = 17000 // Ethereum mainnet

export const garnetHolesky = defineChain({
  ...chainConfig,
  name: 'Garnet Holesky (Redstone)',
  id: 17069,
  sourceId,
  nativeCurrency: { decimals: 18, name: 'Ether', symbol: 'ETH' },
  rpcUrls: {
    default: {
      http: ['https://rpc.garnetchain.com'],
      webSocket: ['wss://rpc.garnetchain.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://explorer.garnetchain.com',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0xCb8E7AC561b8EF04F2a15865e9fbc0766FEF569B',
      },
    },
    portal: {
        [sourceId]: {
          address: '0x57ee40586fbE286AfC75E67cb69511A6D9aF5909',
        },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x09bcDd311FE398F80a78BE37E489f5D440DB95DE',
      },
    },
  },
})