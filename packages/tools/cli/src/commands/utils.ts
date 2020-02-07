import { bold, gray } from 'chalk';

export function print(...msg: any[]) {
  // tslint:disable-next-line
  console.log(...msg);
}

export function printCyclePath(cyclePath: { name: string; filePath: string }[]) {
  const lastTimeIndex = cyclePath.length - 1;
  const lastDep = cyclePath[lastTimeIndex];
  const firstTimeIndex = cyclePath.findIndex(p => p.name === lastDep.name);

  print(
    cyclePath
      .map((dep, index) => {
        let prefix = '';
        let highlight = false;
        let between = false;

        if (index === firstTimeIndex) {
          prefix = '┌';
          highlight = true;
        } else if (index === lastTimeIndex) {
          prefix = '└';
          highlight = true;
        } else if (index > firstTimeIndex && index < lastTimeIndex) {
          prefix = '│';
          between = true;
        }

        if (!between && !highlight) {
          return null;
        }

        prefix = prefix + new Array(index + 1).join(!highlight ? '  ' : '──');

        return prefix + (highlight ? bold(dep.name) : between ? dep.name : gray(dep.name));
      })
      .filter(Boolean)
      .join('\n')
  );
}
