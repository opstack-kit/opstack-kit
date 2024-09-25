import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";

const sourceId = 11_155_111 // sepolia

export const soneiumMinato = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1946,
  network: 'soneium-minato',
  name: 'Soneium Minato',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://rpc.minato.soneium.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscan',
      url: 'https://explorer-testnet.soneium.org',
      apiUrl: 'https://explorer-testnet.soneium.org/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    l2OutputOracle: {
      [sourceId]: {
        address: '0x710e5286C746eC38beeB7538d0146f60D27be343',
      },
    },
    portal: {
      [sourceId]: {
        address: '0x65ea1489741A5D72fFdD8e6485B216bBdcC15Af3',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0x5f5a404A5edabcDD80DB05E8e54A78c9EBF000C2',
      },
    },
  },
  testnet: true,
  sourceId,
})