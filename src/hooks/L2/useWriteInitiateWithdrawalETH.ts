import { type Config } from '@wagmi/core'
import { type WriteWithdrawInitiateParameters as WriteWithdrawETHActionParameters } from 'opstack-kit-x-alpha-v2/actions'
import type { ContractFunctionArgs } from 'viem'
import { useAccount, useConfig, useWriteContract, useSwitchChain } from 'wagmi'
import type { WriteContractVariables } from 'wagmi/query'
import { l2ToL1MessagePasserABI } from '../../constants/abi.js'

import type { UseWriteOPActionBaseParameters } from '../../types/UseWriteOPActionBaseParameters.js'
import type { UseWriteOPActionBaseReturnType } from '../../types/UseWriteOPActionBaseReturnType.js'
import type { WriteOPContractBaseParameters } from '../../types/WriteOPContractBaseParameters.js'

import { validateL2Chain, validatel2ToL1MessagePasserContract } from '../../util/validateChains.js'

const ABI = l2ToL1MessagePasserABI
const FUNCTION = 'initiateWithdrawal'

export type WriteWithdrawInitiateParameters<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = number,
> =
  & WriteOPContractBaseParameters<typeof ABI, typeof FUNCTION, config, chainId>
  & { args: Omit<Pick<WriteWithdrawETHActionParameters, 'args'>['args'], 'minGasLimit'> & { minGasLimit?: number } }
  & { chainId: number } & { amount: bigint }

export type UseWriteWithdrawInitiateParameters<config extends Config = Config, context = unknown> =
  UseWriteOPActionBaseParameters<config, context>

export type UseWriteWithdrawETHReturnType<config extends Config = Config, context = unknown> =
  & Omit<UseWriteOPActionBaseReturnType<WriteWithdrawInitiateParameters, config, context>, 'write' | 'writeAsync'>
  & {
    writeInitiateWithdrawalETH: UseWriteOPActionBaseReturnType<WriteWithdrawInitiateParameters, config, context>['write']
    writeWithdrawETHAsync: UseWriteOPActionBaseReturnType<WriteWithdrawInitiateParameters, config, context>['writeAsync']
  }

/**
 * Withdraws ETH to an L1 ERC20 address. (for "CustomGasToken")
 * @param parameters - {@link UseWriteWithdrawInitiateParameters}
 * @returns wagmi [useWriteContract return type](https://alpha.wagmi.sh/react/api/hooks/useWriteContract#return-type). {@link UseWriteWithdrawETHReturnType}
 */
export function useWriteInitiateWithdrawalETH<config extends Config = Config, context = unknown>(
  args: UseWriteWithdrawInitiateParameters<config, context> = {},
): UseWriteWithdrawETHReturnType<config, context> {
  const config = useConfig(args)
  const { writeContract, writeContractAsync, ...writeReturn } = useWriteContract(args)
  const account = useAccount(args)
  const { switchChain } = useSwitchChain()

  const writeInitiateWithdrawalETH: UseWriteWithdrawETHReturnType<config, context>['writeInitiateWithdrawalETH'] = async (
    { chainId, args, amount, ...rest },
    options,
  ) => {
    const { l2Chain } = validateL2Chain(config, chainId)
    const l2ToL1MessagePasser = validatel2ToL1MessagePasserContract(l2Chain).address

    // Switch to the correct L2 chain
    await switchChain({ chainId: l2Chain.id })

    return writeContract({
      chainId: l2Chain.id,
      address: l2ToL1MessagePasser,
      abi: ABI,
      functionName: FUNCTION,
      args: [args.target, args.gasLimit ?? 21000n, args.data ?? '0x'],
      value: amount,
      account: account.address,
      ...rest,
    } as unknown as WriteContractVariables<
      typeof ABI,
      typeof FUNCTION,
      ContractFunctionArgs<typeof ABI, 'payable', typeof FUNCTION>,
      config,
      config['chains'][number]['id']
    >, options)
  }

  const writeWithdrawETHAsync: UseWriteWithdrawETHReturnType<config, context>['writeWithdrawETHAsync'] = async (
    { chainId, args, amount, ...rest },
    options,
  ) => {
    const { l2Chain } = validateL2Chain(config, chainId)
    const l2ToL1MessagePasser = validatel2ToL1MessagePasserContract(l2Chain).address

    return writeContractAsync({
      chainId: l2Chain.id,
      address: l2ToL1MessagePasser,
      abi: ABI,
      functionName: FUNCTION,
      args: [args.target, args.gasLimit ?? 21000n, args.data ?? '0x'],
      value: amount,
      account: account.address,
      ...rest,
    } as unknown as WriteContractVariables<
      typeof ABI,
      typeof FUNCTION,
      ContractFunctionArgs<typeof ABI, 'payable', typeof FUNCTION>,
      config,
      config['chains'][number]['id']
    >, options)
  }

  return {
    writeInitiateWithdrawalETH,
    writeWithdrawETHAsync,
    ...writeReturn,
  } as unknown as UseWriteWithdrawETHReturnType<config, context>
}
