import * as commander from 'commander';
import doctor from './commands/doctor';

commander
  .command('doctor')
  .description('Looks for issues related to modules dependencies and provider usages')
  .option('-v, --verbose', 'Prints debug information', false)
  .action((cmd: { verbose: boolean }) => {
    doctor(process.cwd(), './src/**/*.ts', cmd.verbose);
  });

commander.command('*').action(() => commander.help());

commander.parse(process.argv);
