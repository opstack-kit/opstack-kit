import { createPublicClient, http } from 'viem';
import { publicActionsL1, publicActionsL2, walletActionsL1, 
    getWithdrawals, buildProveWithdrawal, proveWithdrawal } from 'viem/op-stack';
import { getTransactionReceipt } from 'viem/actions';
import { privateKeyToAccount } from 'viem/accounts';

import type { Chain, ChainContract } from 'viem';
import type { ProveWithdrawalParameters } from 'viem/op-stack';

import { createSpinner } from 'nanospinner';
import { dim, yellow } from 'colorette';

export async function prove (
    privateKey: `0x${string}`,
    hash: `0x${string}`,
    chainIdL1: number, rpcUrlL1: string,
    chainIdL2: number, rpcUrlL2: string,
    portal: `0x${string}`,
    l2OutputOracle: `0x${string}`,
    disputeGameFactory: `0x${string}`,
    scanL1Url: string | undefined
) {
    const account = privateKeyToAccount(privateKey);

    const publicClientL1 = createPublicClient({
        chain: {
            id: chainIdL1,
            rpcUrls: {
                default: rpcUrlL1,
            },
            blockExplorers: {
                default: scanL1Url
            }
        } as unknown as Chain,
        transport: http(rpcUrlL1),
    }).extend(publicActionsL1());

    const publicClientL2 = createPublicClient({
        chain: {
            id: chainIdL2,
            rpcUrls: {
                default: rpcUrlL2,
            },
            contracts: {
                portal: {
                    [chainIdL1]: {
                        address: portal,
                    },
                },
                l2OutputOracle: {
                    [chainIdL1]: {
                        address: l2OutputOracle,
                    },
                },
                disputeGameFactory: {
                    [chainIdL1]: {
                        address: disputeGameFactory,
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
                default: rpcUrlL1,
            },
        } as unknown as Chain,
        transport: http(rpcUrlL1),
    }).extend(walletActionsL1());

    const spinner = createSpinner('Fetching transaction ...').start({ color: 'cyan' });

    try {
        const receipt = await getTransactionReceipt(publicClientL2, { hash });
        if (!receipt) {
            throw new Error('Transaction receipt not found');
        }

        const [withdrawal] = getWithdrawals(receipt);
        if (!withdrawal) {
            throw new Error('No withdrawal found in receipt');
        }

        const output = await publicClientL1.getL2Output({
            l2BlockNumber: receipt.blockNumber,
            targetChain: publicClientL2.chain as unknown as {
                contracts: {
                    portal: { [key: number]: ChainContract };
                    l2OutputOracle: { [key: number]: ChainContract };
                    disputeGameFactory: { [key: number]: ChainContract };
                }
            },
        });

        const args = await buildProveWithdrawal(publicClientL2, {
            account,
            output,
            withdrawal,
        }) as unknown as ProveWithdrawalParameters;

        const proveHash = await proveWithdrawal(walletClientL1, args);

        if (proveHash) {
            const scanLink = scanL1Url
                ? `${scanL1Url}/tx/${proveHash}`
                : `${yellow("undefined")} ${dim("'-s1, --scanL1Url <url>'")}`;
            
            console.log(`\n👉 proveWithdrawal. Transaction hash: ${proveHash}`);
            console.log(`👀 View on Scan: ${scanLink}`);
            // console.log('\n')
            spinner.success({ text: 'Transaction confirmed successfully!' });
        } else {
            throw new Error('Failed without a transaction hash.');
        }
    } catch (error) {
        console.error('\nError:', error);
        console.log('\n')
        spinner.error({ text: 'Error proveWithdrawal!' });
    } finally {
        spinner.clear();
    }
}
