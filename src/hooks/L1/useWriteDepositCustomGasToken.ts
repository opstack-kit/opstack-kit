import { type Config } from '@wagmi/core'
import { type WriteDepositCustomGasParameters as WriteDepositCustomGasActionParameters } from 'opstack-kit-x-alpha-v2/actions'
import type { ContractFunctionArgs } from 'viem'
import { } from 'wagmi'
import { useAccount, useConfig, useWriteContract, useSwitchChain } from 'wagmi'
import type { WriteContractVariables } from 'wagmi/query'
import { optimismPortalABI } from '../../constants/abi.js'

import type { UseWriteOPActionBaseParameters } from '../../types/UseWriteOPActionBaseParameters.js'
import type { UseWriteOPActionBaseReturnType } from '../../types/UseWriteOPActionBaseReturnType.js'
import type { WriteOPContractBaseParameters } from '../../types/WriteOPContractBaseParameters.js'
import { validatePortalContract, validateL2Chain } from '../../util/validateChains.js'

const ABI = optimismPortalABI
const FUNCTION = 'depositERC20Transaction'

export type WriteDepositCustomGasParameters<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = number,
> =
  & WriteOPContractBaseParameters<typeof ABI, typeof FUNCTION, config, chainId>
  // The L1CrossDomainMessenger will add the L2 gas we need, so we can pass 0 to the contract by default & make the argument optional
  & { args: Omit<Pick<WriteDepositCustomGasActionParameters, 'args'>['args'], 'minGasLimit'> & { minGasLimit?: number } }
  & { l2ChainId: number }

export type UseWriteDepositCustomGasParameters<config extends Config = Config, context = unknown> =
  UseWriteOPActionBaseParameters<config, context>

export type UseWriteDepositERC20ReturnType<config extends Config = Config, context = unknown> =
  & Omit<UseWriteOPActionBaseReturnType<WriteDepositCustomGasParameters, config, context>, 'write' | 'writeAsync'>
  & {
    writeDepositCustomGasToken: UseWriteOPActionBaseReturnType<WriteDepositCustomGasParameters, config, context>['write']
    writeDepositERC20Async: UseWriteOPActionBaseReturnType<
      WriteDepositCustomGasParameters,
      config,
      context
    >['writeAsync']
  }

/**
 * Deposits ERC20 tokens to L2 using the standard bridge
 * @param parameters - {@link UseWriteDepositCustomGasParameters}
 * @returns wagmi [useWriteContract return type](https://alpha.wagmi.sh/react/api/hooks/useWrtieContract#return-type). {@link UseWriteDepositERC20ReturnType}
 */
export function useWriteDepositCustomGasToken<config extends Config = Config, context = unknown>(
  args: UseWriteDepositCustomGasParameters<config, context> = {},
): UseWriteDepositERC20ReturnType<config, context> {
  const config = useConfig(args)
  const { writeContract, writeContractAsync, ...writeReturn } = useWriteContract(args)
  const account = useAccount(args)
  const { switchChain } = useSwitchChain()

  const writeDepositCustomGasToken: UseWriteDepositERC20ReturnType<config, context>['writeDepositCustomGasToken'] = async (
    { l2ChainId, args, ...rest },
    options,
  ) => {
    const { l2Chain, l1ChainId } = validateL2Chain(config, l2ChainId)
    const portal = validatePortalContract(l1ChainId, l2Chain).address
    
    // Switch to the correct L1 chain
    await switchChain({ chainId: l1ChainId })

    return writeContract(
      {
        chainId: l1ChainId,
        address: portal,
        abi: ABI,
        functionName: FUNCTION,
        args: [args.to, args.mint, args.value, args.gasLimit ?? 21000n, args.isCreation ?? false, args.data ?? '0x'],
        account: account.address,
        ...rest,
      } as unknown as WriteContractVariables<
        typeof ABI,
        typeof FUNCTION,
        ContractFunctionArgs<typeof ABI, 'nonpayable', typeof FUNCTION>,
        config,
        config['chains'][number]['id']
      >,
      options,
    )
  }

  const writeDepositERC20Async: UseWriteDepositERC20ReturnType<config, context>['writeDepositERC20Async'] = async (
    { l2ChainId, args, ...rest },
    options,
  ) => {
    const { l2Chain, l1ChainId } = validateL2Chain(config, l2ChainId)
    const portal = validatePortalContract(l1ChainId, l2Chain).address

    return writeContractAsync({
      chainId: l1ChainId,
      address: portal,
      abi: ABI,
      functionName: FUNCTION,
      args: [args.to, args.mint, args.value, args.gasLimit ?? 21000n, args.isCreation ?? false, args.data ?? '0x'],
      account: account.address,
      ...rest,
    } as unknown as WriteContractVariables<
      typeof ABI,
      typeof FUNCTION,
      ContractFunctionArgs<typeof ABI, 'nonpayable', typeof FUNCTION>,
      config,
      config['chains'][number]['id']
    >, options)
  }

  return {
    writeDepositCustomGasToken,
    writeDepositERC20Async,
    ...writeReturn,
  } as unknown as UseWriteDepositERC20ReturnType<config, context>
}
