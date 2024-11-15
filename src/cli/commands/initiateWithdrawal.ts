import { createPublicClient, http,
    parseEther
} from 'viem';
import { walletActionsL2 } from 'viem/op-stack';
import { privateKeyToAccount } from 'viem/accounts';

import type { Chain } from 'viem';
import type { InitiateWithdrawalParameters } from 'viem/op-stack';

import { createSpinner } from 'nanospinner';
import { yellow, dim } from "colorette"

export async function initiateWithdrawal(
    privateKey: `0x${string}`,
    amount: string,
    chainIdL2: number, rpcUrlL2: string,
    scanL2Url: string | undefined,
    gasLimit?: bigint
    // to: `0x${string}`
) {
    const account = privateKeyToAccount(privateKey);

    const walletClientL2 = createPublicClient({
        chain: {
            id: chainIdL2,
            rpcUrls: {
                default: {
                    url: rpcUrlL2
                },
            },
            blockExplorers: {
                default: scanL2Url
            }
        } as unknown as Chain,
        transport: http(rpcUrlL2),
    }).extend(walletActionsL2());

    const spinner = createSpinner('Fetching transaction ...').start({ color: 'cyan' });

    try {
        const hash = await walletClientL2.initiateWithdrawal({
            account,
            request: {
              gas: gasLimit || 21000n,
              to: account.address,
              value: parseEther(amount)
            },
          }) as unknown as InitiateWithdrawalParameters;

        if (hash) {
            const scanLink = scanL2Url
                ? `${scanL2Url}/tx/${hash}`
                : `${yellow("undefined")} ${dim("'-s2, --scanL2Url <url>'")}`;

            console.log(`\n👉 initiateWithdrawal. Transaction hash: ${hash}`);
            console.log(`👀 View on Scan: ${scanLink}`);
            // console.log('\n')
            spinner.success({ text: 'Transaction confirmed successfully!' });
        } else {
            throw new Error('Failed without a transaction hash.');
        }
    } catch (error) {
        console.error('\nError:', error);
        console.log('\n')
        spinner.error({ text: 'Error initiateWithdrawal!' });
    } finally {
        spinner.clear();
    }
}
