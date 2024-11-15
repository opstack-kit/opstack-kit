import { createPublicClient, http,
    parseEther
} from 'viem';
import { walletActionsL1 } from 'viem/op-stack';
import { privateKeyToAccount } from 'viem/accounts';

import type { Chain, ChainContract } from 'viem';
import type { DepositTransactionParameters } from 'viem/op-stack';

import { createSpinner } from 'nanospinner';
import { yellow, dim } from "colorette"

export async function depositTransaction(
    privateKey: `0x${string}`,
    amount: string,
    chainIdL1: number, rpcUrlL1: string,
    portal: `0x${string}`,
    scanL1Url: string | undefined,
    gasLimit?: bigint
) {
    const account = privateKeyToAccount(privateKey);

    const walletClientL1 = createPublicClient({
        chain: {
            id: chainIdL1,
            rpcUrls: {
                default: {
                    url: rpcUrlL1
                },
            },
            contracts: {
                portal: {
                    [chainIdL1]: {
                        address: portal,
                    },
                },
            },
            blockExplorers: {
                default: scanL1Url
            }
        } as unknown as Chain,
        transport: http(rpcUrlL1),
    }).extend(walletActionsL1());

    const spinner = createSpinner('Fetching transaction ...').start({ color: 'cyan' });

    try {
        const hash = await walletClientL1.depositTransaction({
            account,
            request: {
              gas: gasLimit || 21000n,
              to: account.address,
              value: parseEther(amount)
            },
            targetChain: walletClientL1.chain as unknown as {
                contracts: {
                    portal: { [key: number]: ChainContract };
                }
            },
          }) as unknown as DepositTransactionParameters;

          if (hash) {
            const scanLink = scanL1Url
                ? `${scanL1Url}/tx/${hash}`
                : `${yellow("undefined")} ${dim("'-s1, --scanL1Url <url>'")}`;

            console.log(`\n👉 depositTransaction. Transaction hash: ${hash}`);
            console.log(`👀 View on Scan: ${scanLink}`);
            // console.log('\n')
            spinner.success({ text: 'Transaction confirmed successfully!' });
        } else {
            throw new Error('Failed without a transaction hash.');
        }
    } catch (error) {
        console.error('\nError:', error);
        console.log('\n')
        spinner.error({ text: 'Error depositTransaction!' });
    } finally {
        spinner.clear();
    }
}
