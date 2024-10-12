import { defineChain } from "viem";
import { chainConfig } from "viem/op-stack";

const sourceId = 11_155_111 // sepolia

export const unichainSepolia = /*#__PURE__*/ defineChain({
  ...chainConfig,
  id: 1301,
  name: 'Unichain Sepolia',
  network: 'unichain-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Unichain Sepolia',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://sepolia.unichain.org'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Unichain Sepolia Explorer',
      url: 'https://sepolia.uniscan.xyz',
      apiUrl: 'https://sepolia.uniscan.xyz/api',
    },
  },
  contracts: {
    ...chainConfig.contracts,
    disputeGameFactory: { //
      [sourceId]: {
        address: '0xeff73e5aa3B9AEC32c659Aa3E00444d20a84394b', 
      },
    },
    portal: {
      [sourceId]: {
        address: '0x0d83dab629f0e0F9d36c0Cbc89B69a489f0751bD',
      },
    },
    l1StandardBridge: {
      [sourceId]: {
        address: '0xea58fcA6849d79EAd1f26608855c2D6407d54Ce2',
      },
    },
  },
  sourceId,
  testnet: true,
})
