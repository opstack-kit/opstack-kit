import { createPublicClient, http } from 'viem';
import { getTransactionReceipt } from 'viem/actions';
import { publicActionsL2, walletActionsL1, 
    getWithdrawals, finalizeWithdrawal } from 'viem/op-stack';
import { privateKeyToAccount } from 'viem/accounts';

import type { Chain, ChainContract } from 'viem';
import type { FinalizeWithdrawalParameters } from 'viem/op-stack';

import { createSpinner } from 'nanospinner';
import { dim, yellow } from 'colorette';

export async function finalize(
    privateKey: `0x${string}`,
    hash: `0x${string}`,
    chainIdL1: number, rpcUrlL1: string,
    chainIdL2: number, rpcUrlL2: string,
    scanL1Url: string | undefined,
    portal: `0x${string}`,
) {
    const account = privateKeyToAccount(privateKey);

    const publicClientL2 = createPublicClient({
        chain: {
            id: chainIdL2,
            rpcUrls: {
                default: {
                    url: rpcUrlL2
                },
            },
            contracts: {
                portal: {
                    [chainIdL1]: {
                        address: portal,
                    },
                },
            },
        } as unknown as Chain,
        transport: http(rpcUrlL2),
    }).extend(publicActionsL2());

    const walletClientL1 = createPublicClient({
        chain: {
            id: chainIdL1,
            rpcUrls: {
                default: {
                    url: rpcUrlL1
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
        const receipt = await getTransactionReceipt(publicClientL2, { hash });
        if (!receipt) {
            throw new Error('Transaction receipt not found on L2');
        }

        const [withdrawal] = getWithdrawals(receipt);
        if (!withdrawal) {
            throw new Error('No withdrawal found in L2 transaction receipt');
        }

        const finalizeHash = await finalizeWithdrawal(walletClientL1, {
            account,
            withdrawal,
            targetChain: publicClientL2.chain as unknown as {
                contracts: {
                    portal: { [key: number]: ChainContract };
                }
            },
        }) as unknown as FinalizeWithdrawalParameters;

        if (finalizeHash) {
            const scanLink = scanL1Url
                ? `${scanL1Url}/tx/${finalizeHash}`
                : `${yellow("undefined")} ${dim("'-s1, --scanL1Url <url>'")}`;

            console.log(`\n👉 finalizeWithdrawal. Transaction hash: ${finalizeHash}`);
            console.log(`👀 View on Scan: ${scanLink}`);
            // console.log('\n')
            spinner.success({ text: 'Transaction confirmed successfully!' });
        } else {
            throw new Error('Failed without a transaction hash.');
        }
    } catch (error) {
        console.error('\nError:', error);
        console.log('\n')
        spinner.error({ text: 'Error finalizeWithdrawal!' });
    } finally {
        spinner.clear();
    }
}
