#!/usr/bin/env node
import { Command, Option } from 'commander';

import { depositTransaction } from './commands/depositTransaction.js';
import { initiateWithdrawal } from './commands/initiateWithdrawal.js';
import { prove } from './commands/prove.js';
import { finalize } from './commands/finalize.js';

import { privateKeyToAccount } from 'viem/accounts';
import { bgBlueBright, blue, bold, dim, italic, magenta, red, yellow } from "colorette"


const program = new Command();

console.info(red(`
  ╔═══╗         ╔╗          ╔╗      ╔╗╔═╗   ╔╗ 
  ║╔═╗║        ╔╝╚╗         ║║      ║║║╔╝  ╔╝╚╗
  ║║ ║║╔══╗╔══╗╚╗╔╝╔══╗ ╔══╗║║╔╗    ║╚╝╝ ╔╗╚╗╔╝
  ║║ ║║║╔╗║║══╣ ║║ ╚ ╗║ ║╔═╝║╚╝╝    ║╔╗║ ╠╣ ║║ 
  ║╚═╝║║╚╝║╠══║ ║╚╗║╚╝╚╗║╚═╗║╔╗╗    ║║║╚╗║║ ║╚╗
  ╚═══╝║╔═╝╚══╝ ╚═╝╚═══╝╚══╝╚╝╚╝    ╚╝╚═╝╚╝ ╚═╝
       ║║                                      
       ╚╝
`));
console.info(`\n 🔴 opstack-kit v\x1b]8;;https://opstack-kit.pages.dev/docs/cli.html\x1b\\${"1.7.0"}\x1b]8;;\x1b\\ 🔴`);



program
  .name('ok')
  .description('CLI command development tools for fast testing and simplification.')
  .version(`\x1b]8;;https://opstack-kit.pages.dev/docs/cli.html\x1b\\${"1.7.0"}\x1b]8;;\x1b\\`, "-v, --version")
  .helpCommand(false)
  .addOption(new Option('-h, --help').hideHelp())


program
  .command('depositTransaction <Amount>')
  .description('Deposit ETH, "OptimismPortal.depositTransaction" address.')
    .option('-pk, --privateKey <key>', 'Private key for signing the transaction')
    .option('-c1, --chainIdL1 <id>', 'Chain ID for Layer 1', parseInt)
    .option('-r1, --rpcUrlL1 <url>', 'RPC URL for Layer 1')
    .option('-p, --portal <address>', 'Portal contract address on Layer 1')
    .option('-g, --gasLimit <gas>', 'Gas limit for Transaction', '21000') //
    .option('-s1, --scanL1Url <url>', 'Block Explorer URL for Layer 1')
    .action(async (amount, options) => {
      try {
        const account = privateKeyToAccount(options.privateKey);
        console.log(`\n${("Call:")} ${italic("depositTransaction <Amount>")}`);
        console.log(`${("Address:")} ${italic(account.address)}`);
        console.log(`${("Amount:")} ${bold(italic(amount))}`);

        console.log(`\n${bgBlueBright(bold("-- depositTransaction --"))}`);
        console.log(`${magenta("Private Key")} '-pk, --privateKey': ${options.privateKey ? options.privateKey : red('undefined')}`);
        console.log(`${magenta("Chain ID L1")} '-c1, --chainIdL1': ${options.chainIdL1 ? options.chainIdL1 : red('undefined')}`);
        console.log(`${magenta("RPC URL L1")} '-r1, --rpcUrlL1': ${options.rpcUrlL1 ? options.rpcUrlL1 : red('undefined')}`);
        console.log(`${magenta("Portal Address")} '-p, --portal': ${options.portal ? options.portal : red('undefined')}`);
        console.log(`${yellow("Gas Limit Transaction")} '-g, --gasLimit': ${options.gasLimit ? options.gasLimit : yellow('undefined')}`);
        console.log(`${yellow("Block Explorer URL L1")} '-s1, --scanL1Url': ${options.scanL1Url ? options.scanL1Url : yellow('undefined')}`);
        console.log(dim(`
              Note: 🟣 Required 🟡 Optional
                      ${bold("Powered by")} ${blue('\x1b]8;;https://github.com/nidz-the-fact\x1b\\Nidz\x1b]8;;\x1b\\')}
  Donations: 0xB6Be617b1D6fE5DbdD21A6AcFD9e97A35ddCEfF5
                  Next step to the Future

-- Read more: https://opstack-kit.pages.dev/docs/cli.html#deposittransaction --
                  `));
  
        const missingOptions = [];
        if (!options.privateKey) missingOptions.push(`'-pk, --privateKey'`);
        if (!options.chainIdL1) missingOptions.push(`'-c1, --chainIdL1'`);
        if (!options.rpcUrlL1) missingOptions.push(`'-r1, --rpcUrlL1'`);
        if (!options.portal) missingOptions.push(`'-p, --portal'`);
  
        if (missingOptions.length > 0) {
          console.error(`\n⛔ Check: Missing required option: ${missingOptions.join(', ')}
💡 Usage: ok depositTransaction <Amount> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --portal <address> --gasLimit <gas> --scanL1Url <url>        
          `);
        }

        await depositTransaction(
          options.privateKey,
          amount,
          options.chainIdL1,
          options.rpcUrlL1,
          options.portal,
          options.scanL1Url,
          options.gasLimit //
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('\n❌ Error:', error.message);
          console.log('💡 Usage: ok depositTransaction <Amount> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --portal <address> --gasLimit <gas> --scanL1Url <url>');
          if (error.message.includes('unknown option')) {
            console.log('\nUsage: ok depositTransaction <Amount> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --portal <address> --gasLimit <gas> --scanL1Url <url>');
          }
        } else {
          console.error('An unknown error occurred.');
        }
      }
    });

program
  .command('initiateWithdrawal <Amount>')
  .description('Withdraw ETH, "L2ToL1MessagePasser.initiateWithdrawal" address.')
    .option('-pk, --privateKey <key>', 'Private key for signing the transaction')
    .option('-c2, --chainIdL2 <id>', 'Chain ID for Layer 2', parseInt)
    .option('-r2, --rpcUrlL2 <url>', 'RPC URL for Layer 2')
    .option('-g, --gasLimit <gas>', 'Gas limit for Transaction', '21000') //
    .option('-s2, --scanL2Url <url>', 'Block Explorer URL for Layer 2')
    // .option('-t, --toAddress <address>', 'Target address on L1 to receive funds')
    .action(async (amount, options) => {
      try {
        const account = privateKeyToAccount(options.privateKey);
        console.log(`\n${("Call:")} ${italic("initiateWithdrawal <Amount>")}`);
        console.log(`${("Address:")} ${italic(account.address)}`);
        console.log(`${("Amount:")} ${bold(italic(amount))}`);
  
        console.log(`\n${bgBlueBright(bold("-- initiateWithdrawal --"))}`);
        console.log(`${magenta("Private Key")} '-pk, --privateKey': ${options.privateKey ? options.privateKey : red('undefined')}`);
        console.log(`${magenta("Chain ID L2")} '-c2, --chainIdL2': ${options.chainIdL2 ? options.chainIdL2 : red('undefined')}`);
        console.log(`${magenta("RPC URL L2")} '-r2, --rpcUrlL2': ${options.rpcUrlL2 ? options.rpcUrlL2 : red('undefined')}`);
        console.log(`${yellow("Gas Limit Transaction")} '-g, --gasLimit': ${options.gasLimit ? options.gasLimit : yellow('undefined')}`);
        console.log(`${yellow("Block Explorer URL L2")} '-s2, --scanL2Url': ${options.scanL2Url ? options.scanL2Url : yellow('undefined')}`);
        // console.log(`Receive to Address '-t, --toAddress': ${options.to}`);
        console.log(dim(`
          Note: 🟣 Required 🟡 Optional
                  ${bold("Powered by")} ${blue('\x1b]8;;https://github.com/nidz-the-fact\x1b\\Nidz\x1b]8;;\x1b\\')}
Donations: 0xB6Be617b1D6fE5DbdD21A6AcFD9e97A35ddCEfF5
              Next step to the Future

-- Read more: https://opstack-kit.pages.dev/docs/cli.html#initiatewithdrawal --
              `));
  
        const missingOptions = [];
        if (!options.privateKey) missingOptions.push(`'-pk, --privateKey'`);
        if (!options.chainIdL2) missingOptions.push(`'-c2, --chainIdL2'`);
        if (!options.rpcUrlL2) missingOptions.push(`'-r2, --rpcUrlL2'`);
  
        if (missingOptions.length > 0) {
          console.error(`\n⛔ Check: Missing required option: ${missingOptions.join(', ')}
💡 Usage: ok initiateWithdrawal <Amount> --privateKey <key> --chainIdL2 <id> --rpcUrlL2 <url> --gasLimit <gas> --scanL2Url <url>
          `);
        }
  
        await initiateWithdrawal(
          options.privateKey,
          amount,
          options.chainIdL2,
          options.rpcUrlL2,
          options.scanL2Url,
          options.gasLimit //
          // options.to,
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('\n❌ Error:', error.message);
          console.log('💡 Usage: ok initiateWithdrawal <Amount> --privateKey <key> --chainIdL2 <id> --rpcUrlL2 <url> -gasLimit <gas> --scanL2Url <url>');
          if (error.message.includes('unknown option')) {
            console.log('\nUsage: ok initiateWithdrawal <Amount> --privateKey <key> --chainIdL2 <id> --rpcUrlL2 <url> -gasLimit <gas> --scanL2Url <url>');
          }
        } else {
          console.error('An unknown error occurred.');
        }
      }
    });

program
  .command('prove <WithdrawalTxHashL2>')
  .description('Prove withdrawal using transaction hash, "OptimismPortal.proveWithdrawal" address.')
    .option('-pk, --privateKey <key>', 'Private key for signing the transaction')
    .option('-c1, --chainIdL1 <id>', 'Chain ID for Layer 1', parseInt)
    .option('-r1, --rpcUrlL1 <url>', 'RPC URL for Layer 1')
    .option('-c2, --chainIdL2 <id>', 'Chain ID for Layer 2', parseInt)
    .option('-r2, --rpcUrlL2 <url>', 'RPC URL for Layer 2')
    .option('-p, --portal <address>', 'Portal contract address')
    .option('-o, --l2OutputOracle <address>', 'L2 Output Oracle contract address')
    .option('-d, --disputeGameFactory <address>', 'Dispute Game Factory contract address')
    .option('-s1, --scanL1Url <url>', 'Block Explorer URL for Layer 1')
    .action(async (WithdrawalTxHashL2, options) => {
      try {
        const account = privateKeyToAccount(options.privateKey);
        console.log(`\n${("Call:")} ${italic("prove <WithdrawalTxHashL2>")}`);
        console.log(`${("Address:")} ${italic(account.address)}`);
        console.log(`${("WithdrawalTxHashL2:")} ${bold(italic(WithdrawalTxHashL2))}`);
  
        console.log(`\n${bgBlueBright(bold("-- proveWithdrawal --"))}`);
        console.log(`${magenta("Private Key")} '-pk, --privateKey': ${options.privateKey ? options.privateKey : red('undefined')}`);
        console.log(`${magenta("Chain ID L1")} '-c1, --chainIdL1': ${options.chainIdL1 ? options.chainIdL1 : red('undefined')}`);
        console.log(`${magenta("RPC URL L1")} '-r1, --rpcUrlL1': ${options.rpcUrlL1 ? options.rpcUrlL1 : red('undefined')}`);
        console.log(`${magenta("Chain ID L2")} '-c2, --chainIdL2': ${options.chainIdL2 ? options.chainIdL2 : red('undefined')}`);
        console.log(`${magenta("RPC URL L2")} '-r2, --rpcUrlL2': ${options.rpcUrlL2 ? options.rpcUrlL2 : red('undefined')}`);
        console.log(`${magenta("Portal contract address")} '-p, --portal': ${options.portal ? options.portal : red('undefined')}`);
        console.log(`${magenta("L2 Output Oracle contract address")} '-o, --l2OutputOracle': ${options.l2OutputOracle ? options.l2OutputOracle : red('undefined')}`);
        console.log(`${magenta("Dispute Game Factory contract address")} '-d, --disputeGameFactory': ${options.disputeGameFactory ? options.disputeGameFactory : red('undefined')}`);
        console.log(`${yellow("Block Explorer URL L1")} '-s1, --scanL1Url': ${options.scanL1Url ? options.scanL1Url : yellow('undefined')}`);
        // console.log(`Receive to Address '-t, --toAddress': ${options.to}`);
        console.log(dim(`
          Note: 🟣 Required 🟡 Optional
Non-Fault proofs: disputeGameFactory = 0x_l2OutputOracle
Fault proofs: l2OutputOracle = 0x_disputeGameFactory
                  ${bold("Powered by")} ${blue('\x1b]8;;https://github.com/nidz-the-fact\x1b\\Nidz\x1b]8;;\x1b\\')}
Donations: 0xB6Be617b1D6fE5DbdD21A6AcFD9e97A35ddCEfF5
              Next step to the Future

-- Read more: https://opstack-kit.pages.dev/docs/cli.html#prove-provewithdrawal --
              `));
  
        const missingOptions = [];
        if (!options.privateKey) missingOptions.push(`'-pk, --privateKey'`);
        if (!options.chainIdL1) missingOptions.push(`'-c1, --chainIdL1'`);
        if (!options.rpcUrlL1) missingOptions.push(`'-r1, --rpcUrlL1'`);
        if (!options.chainIdL2) missingOptions.push(`'-c2, --chainIdL2'`);
        if (!options.rpcUrlL2) missingOptions.push(`'-r2, --rpcUrlL2'`);
        if (!options.portal) missingOptions.push(`'-p, --portal'`);
        if (!options.l2OutputOracle) missingOptions.push(`'-o, --l2OutputOracle'`);
        if (!options.disputeGameFactory) missingOptions.push(`'-d, --disputeGameFactory'`);
  
        if (missingOptions.length > 0) {
          console.error(`\n⛔ Check: Missing required option: ${missingOptions.join(', ')}
💡 Usage: ok prove <WithdrawalTxHashL2> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --chainIdL2 <id> --rpcUrlL2 <url> --portal <address> --l2OutputOracle <address> --disputeGameFactory <address> --scanL1Url <url>
          `);
        }

        await prove(
          options.privateKey,
          WithdrawalTxHashL2,
          options.chainIdL1,
          options.rpcUrlL1,
          options.chainIdL2,
          options.rpcUrlL2,
          options.portal,
          options.l2OutputOracle,
          options.disputeGameFactory,
          options.scanL1Url,
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('\n❌ Error:', error.message);
          console.log('💡 Usage: ok prove <WithdrawalTxHashL2> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --chainIdL2 <id> --rpcUrlL2 <url> --portal <address> --l2OutputOracle <address> --disputeGameFactory <address> --scanL1Url <url>');
          if (error.message.includes('unknown option')) {
            console.log('\nUsage: ok prove <WithdrawalTxHashL2> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --chainIdL2 <id> --rpcUrlL2 <url> --portal <address> --l2OutputOracle <address> --disputeGameFactory <address> --scanL1Url <url>');
          }
        } else {
          console.error('An unknown error occurred.');
        }
      }
    });

program
  .command('finalize <WithdrawalTxHashL2>')
  .description('Finalize withdrawal using transaction hash after proving, "OptimismPortal.finalizeWithdrawal" address.')
    .option('-pk, --privateKey <key>', 'Private key for signing the transaction')
    .option('-c1, --chainIdL1 <id>', 'Chain ID for Layer 1', parseInt)
    .option('-r1, --rpcUrlL1 <url>', 'RPC URL for Layer 1')
    .option('-c2, --chainIdL2 <id>', 'Chain ID for Layer 2', parseInt)
    .option('-r2, --rpcUrlL2 <url>', 'RPC URL for Layer 2')
    .option('-p, --portal <address>', 'Portal contract address')
    .option('-s1, --scanL1Url <url>', 'Block Explorer URL for Layer 1')
    .action(async (WithdrawalTxHashL2, options) => {
      try {
        const account = privateKeyToAccount(options.privateKey);
        console.log(`\n${("Call:")} ${italic("finalize <WithdrawalTxHashL2>")}`);
        console.log(`${("Address:")} ${italic(account.address)}`);
        console.log(`${("WithdrawalTxHashL2:")} ${bold(italic(WithdrawalTxHashL2))}`);
  
        console.log(`\n${bgBlueBright(bold("-- finalizeWithdrawal --"))}`);
        console.log(`${magenta("Private Key")} '-pk, --privateKey': ${options.privateKey ? options.privateKey : red('undefined')}`);
        console.log(`${magenta("Chain ID L1")} '-c1, --chainIdL1': ${options.chainIdL1 ? options.chainIdL1 : red('undefined')}`);
        console.log(`${magenta("RPC URL L1")} '-r1, --rpcUrlL1': ${options.rpcUrlL1 ? options.rpcUrlL1 : red('undefined')}`);
        console.log(`${magenta("Chain ID L2")} '-c2, --chainIdL2': ${options.chainIdL2 ? options.chainIdL2 : red('undefined')}`);
        console.log(`${magenta("RPC URL L2")} '-r2, --rpcUrlL2': ${options.rpcUrlL2 ? options.rpcUrlL2 : red('undefined')}`);
        console.log(`${magenta("Portal contract address")} '-p, --portal': ${options.portal ? options.portal : red('undefined')}`);
        console.log(`${yellow("Block Explorer URL L1")} '-s1, --scanL1Url': ${options.scanL1Url ? options.scanL1Url : yellow('undefined')}`);
        console.log(dim(`
          Note: 🟣 Required 🟡 Optional
                  ${bold("Powered by")} ${blue('\x1b]8;;https://github.com/nidz-the-fact\x1b\\Nidz\x1b]8;;\x1b\\')}
Donations: 0xB6Be617b1D6fE5DbdD21A6AcFD9e97A35ddCEfF5
              Next step to the Future

-- Read more: https://opstack-kit.pages.dev/docs/cli.html#finalize-finalizewithdrawal --
              `));

        const missingOptions = [];
        if (!options.privateKey) missingOptions.push(`'-pk, --privateKey'`);
        if (!options.chainIdL1) missingOptions.push(`'-c1, --chainIdL1'`);
        if (!options.rpcUrlL1) missingOptions.push(`'-r1, --rpcUrlL1'`);
        if (!options.chainIdL2) missingOptions.push(`'-c2, --chainIdL2'`);
        if (!options.rpcUrlL2) missingOptions.push(`'-r2, --rpcUrlL2'`);
        if (!options.portal) missingOptions.push(`'-p, --portal'`);
  
        if (missingOptions.length > 0) {
          console.error(`\n⛔ Check: Missing required option: ${missingOptions.join(', ')}
💡 Usage: ok finalize <WithdrawalTxHashL2> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --chainIdL2 <id> --rpcUrlL2 <url> --portal <address> --scanL1Url <url>
          `);
        }

        await finalize(
          options.privateKey,
          WithdrawalTxHashL2,
          options.chainIdL1,
          options.rpcUrlL1,
          options.chainIdL2,
          options.rpcUrlL2,
          options.portal,
          options.scanL1Url,
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('\n❌ Error:', error.message);
          console.log('💡 Usage: ok finalize <WithdrawalTxHashL2> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --chainIdL2 <id> --rpcUrlL2 <url> --portal <address> --scanL1Url <url>');
          if (error.message.includes('unknown option')) {
            console.log('\nUsage: ok finalize <WithdrawalTxHashL2> --privateKey <key> --chainIdL1 <id> --rpcUrlL1 <url> --chainIdL2 <id> --rpcUrlL2 <url> --portal <address> --scanL1Url <url>');
          }
        } else {
          console.error('An unknown error occurred.');
        }
      }
    });

program.parse(process.argv);
