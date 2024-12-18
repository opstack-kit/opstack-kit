import { useMutation } from '@tanstack/react-query';
import {
  getWithdrawalMessages,
  simulateFinalizeWithdrawalTransaction,
  writeFinalizeWithdrawalTranasction,
} from 'opstack-kit-x-alpha/actions';
import type { Chain, Hash } from 'viem';
import { type Config, useConfig } from 'wagmi';
import { getPublicClient, getWalletClient } from 'wagmi/actions';
import { optimismPortalABI } from '../../constants/abi.js';
import type { UseWriteOPActionBaseParameters } from '../../types/UseWriteOPActionBaseParameters.js';
import type { UseWriteOPActionBaseReturnType } from '../../types/UseWriteOPActionBaseReturnType.js';
import type { WriteOPContractBaseParameters } from '../../types/WriteOPContractBaseParameters.js';
import { validateL2Chain, validatePortalContract } from '../../util/validateChains.js';
import { useSwitchChain } from 'wagmi';

const ABI = optimismPortalABI;
const FUNCTION = 'finalizeWithdrawalTransaction';

export type WriteFinalizeWithdrawalTransactionParameters<
  config extends Config = Config,
  chainId extends config['chains'][number]['id'] = number,
> = WriteOPContractBaseParameters<typeof ABI, typeof FUNCTION, config, chainId> & {
  args: {
    withdrawalTxHash: Hash;
  };
  l2ChainId: number;
};

export type UseWriteFinalizeWithdrawalTransactionParameters<config extends Config = Config, context = unknown> =
  UseWriteOPActionBaseParameters<config, context>;

export type UseWriteFinalizeWithdrawalTransactionReturnType<config extends Config = Config, context = unknown> =
  & Omit<
    UseWriteOPActionBaseReturnType<WriteFinalizeWithdrawalTransactionParameters, config, context>,
    'write' | 'writeAsync'
  >
  & {
    writeFinalizeWithdrawalTransaction: UseWriteOPActionBaseReturnType<
      WriteFinalizeWithdrawalTransactionParameters,
      config,
      context
    >['write'];
    writeFinalizeWithdrawalTransactionAsync: UseWriteOPActionBaseReturnType<
      WriteFinalizeWithdrawalTransactionParameters,
      config,
      context
    >['writeAsync'];
  };

type FinalizeWithdrawalTransactionMutationParameters = {
  l1ChainId: number;
  l2Chain: Chain;
} & WriteFinalizeWithdrawalTransactionParameters;

async function writeMutation(
  config: Config,
  { l1ChainId, l2Chain, args, ...rest }: FinalizeWithdrawalTransactionMutationParameters,
) {
  const walletClient = await getWalletClient(config, { chainId: l1ChainId });
  const l1PublicClient = await getPublicClient(config, { chainId: l1ChainId })!;
  const l2PublicClient = await getPublicClient(config, { chainId: l2Chain.id })!;
  const portal = validatePortalContract(l1ChainId, l2Chain).address;

  const withdrawalMessages = await getWithdrawalMessages(l2PublicClient, {
    hash: args.withdrawalTxHash,
  });

  await simulateFinalizeWithdrawalTransaction(l1PublicClient, {
    withdrawal: withdrawalMessages.messages[0],
    account: walletClient.account.address,
    portal,
    ...rest,
  });
  return writeFinalizeWithdrawalTranasction(walletClient, {
    args: { withdrawal: withdrawalMessages.messages[0] },
    account: walletClient.account.address,
    portal,
    ...rest,
  });
}

/**
 * Finalizes a withdrawal transaction on the Optimism Portal contract
 * @param parameters - {@link UseWriteFinalizeWithdrawalTransactionParameters}
 * @returns wagmi [useWriteContract return type](https://alpha.wagmi.sh/react/api/hooks/useWriteContract#return-type). {@link UseWriteFinalizeWithdrawalTransactionReturnType}
 */
export function useWriteFinalizeWithdrawalTransaction<config extends Config = Config, context = unknown>(
  args: UseWriteFinalizeWithdrawalTransactionParameters<config, context> = {},
): UseWriteFinalizeWithdrawalTransactionReturnType<config, context> {
  const config = useConfig(args);
  const { switchChain } = useSwitchChain();

  const mutation = useMutation({
    mutationFn: async ({ l2ChainId, args, ...rest }: WriteFinalizeWithdrawalTransactionParameters) => {
      const { l2Chain, l1ChainId } = validateL2Chain(config, l2ChainId);

      // Switch to the correct L1 chain
      await switchChain({ chainId: l1ChainId });

      return writeMutation(config, { args, l1ChainId, l2Chain, l2ChainId: l2Chain.id, ...rest });
    },
    mutationKey: ['writeContract'],
  });

  const { mutate, mutateAsync, ...result } = mutation;

  return {
    ...result,
    writeFinalizeWithdrawalTransaction: mutate,
    writeFinalizeWithdrawalTransactionAsync: mutateAsync,
  } as unknown as UseWriteFinalizeWithdrawalTransactionReturnType<config, context>;
}
