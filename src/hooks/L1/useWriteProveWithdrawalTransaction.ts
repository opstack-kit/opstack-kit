import { useMutation } from '@tanstack/react-query'
import {
  getWithdrawalMessages,
  simulateProveWithdrawalTransaction,
  writeProveWithdrawalTransaction,
} from 'opstack-kit-x-alpha/actions'
import {
  getProveWithdrawalTransactionArgs
} from 'opstack-kit-x-alpha-v3/actions'
import type { Chain, ChainContract, Hash } from 'viem'
import { getTransactionReceipt } from 'viem/actions'
import { getL2Output } from 'viem/op-stack'
import { type Config, useConfig } from 'wagmi'
import { getPublicClient, getWalletClient } from 'wagmi/actions'
import { optimismPortalABI } from '../../constants/abi.js'
import { useSwitchChain } from 'wagmi'

import type { UseWriteOPActionBaseParameters } from '../../types/UseWriteOPActionBaseParameters.js'
import type { UseWriteOPActionBaseReturnType } from '../../types/UseWriteOPActionBaseReturnType.js'
import type { WriteOPContractBaseParameters } from '../../types/WriteOPContractBaseParameters.js'
import { validateL2Chain, validatePortalContract } from '../../util/validateChains.js'
const ABI = optimismPortalABI
const FUNCTION = 'proveWithdrawalTransaction'

export type WriteProveWithdrawalTransactionParameters<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = number,
> = WriteOPContractBaseParameters<typeof ABI, typeof FUNCTION, config, chainId> & {
  args: {
    withdrawalTxHash: Hash
  }
  l2ChainId: number
}

export type UseWriteProveWithdrawalTransactionParameters<config extends Config = Config, context = unknown> =
  UseWriteOPActionBaseParameters<config, context>

export type UseWriteProveWithdrawalTransactionReturnType<config extends Config = Config, context = unknown> =
  & Omit<
    UseWriteOPActionBaseReturnType<WriteProveWithdrawalTransactionParameters, config, context>,
    'write' | 'writeAsync'
  >
  & {
    writeProveWithdrawalTransaction: UseWriteOPActionBaseReturnType<
      WriteProveWithdrawalTransactionParameters,
      config,
      context
    >['write']
    writeProveWithdrawalTransactionAsync: UseWriteOPActionBaseReturnType<
      WriteProveWithdrawalTransactionParameters,
      config,
      context
    >['writeAsync']
  }

type ProveWithdrawalTransactionMutationParameters = WriteProveWithdrawalTransactionParameters & {
  l1ChainId: number
  l2Chain: Chain
}

async function writeMutation(
  config: Config,
  { l1ChainId, l2Chain, l2ChainId, args, ...rest }: ProveWithdrawalTransactionMutationParameters,
) {
  const walletClient = await getWalletClient(config, { chainId: l1ChainId })
  const l1PublicClient = await getPublicClient(config, { chainId: l1ChainId })!
  const l2PublicClient = await getPublicClient(config, { chainId: l2ChainId })!

  const portal = validatePortalContract(l1ChainId, l2Chain).address

  const withdrawalMessages = await getWithdrawalMessages(l2PublicClient, {
    hash: args.withdrawalTxHash,
  })

  const receipt = await getTransactionReceipt(l2PublicClient, {
    hash: args.withdrawalTxHash,
  })

  const output = await getL2Output(l1PublicClient, {
    l2BlockNumber: receipt.blockNumber,
    targetChain: l2PublicClient.chain as unknown as { 
        contracts: { 
            portal: { [key: number]: ChainContract }; 
            l2OutputOracle: { [key: number]: ChainContract }; 
            disputeGameFactory: { [key: number]: ChainContract }; 
        }
      },
  })

  const proveWithdrawalTransactionArgs = await getProveWithdrawalTransactionArgs(l2PublicClient, {
    message: withdrawalMessages.messages[0],
    output: output,
  })

  await simulateProveWithdrawalTransaction(l1PublicClient, {
    args: proveWithdrawalTransactionArgs,
    account: walletClient.account.address,
    portal,
    ...rest,
  })

  return writeProveWithdrawalTransaction(walletClient, {
    args: proveWithdrawalTransactionArgs,
    account: walletClient.account.address,
    portal,
    ...rest,
  })
}

/**
 * Proves a withdrawal transaction using the OptimismPortal contract
 * @param parameters - {@link UseWriteProveWithdrawalTransactionParameters}
 * @returns wagmi [useWriteContract return type](https://alpha.wagmi.sh/react/api/hooks/useWriteContract#return-type). {@link UseWriteProveWithdrawalTransactionReturnType}
 */
export function useWriteProveWithdrawalTransaction<config extends Config = Config, context = unknown>(
  args: UseWriteProveWithdrawalTransactionParameters<config, context> = {},
): UseWriteProveWithdrawalTransactionReturnType<config, context> {
  const config = useConfig(args)
  const { switchChain } = useSwitchChain();

  const mutation = {
    mutationFn: async ({ l2ChainId, args, ...rest }: WriteProveWithdrawalTransactionParameters) => {
      const { l1ChainId, l2Chain } = validateL2Chain(config, l2ChainId);

      // Switch to the correct L1 chain
      await switchChain({ chainId: l1ChainId });

      return writeMutation(config, { args, l1ChainId, l2Chain, l2ChainId: l2ChainId, ...rest });
    },
    mutationKey: ['writeContract'],
  }

  const { mutate, mutateAsync, ...result } = useMutation(mutation)

  return {
    ...result,
    writeProveWithdrawalTransaction: mutate,
    writeProveWithdrawalTransactionAsync: mutateAsync,
  } as unknown as UseWriteProveWithdrawalTransactionReturnType<config, context>
}
