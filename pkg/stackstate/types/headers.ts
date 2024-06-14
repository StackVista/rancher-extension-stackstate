import { TableColumn } from '@rancher/shell/core/types';

export const StackStateHealth: TableColumn = {
  labelKey: 'sts.health',
  getValue: (row: any) => {
    console.log('row', row);

    return 'CRITICAL';
  },
  sort:          ['stateSort'],
  formatter:     'ComponentLinkedHealthState',
  width:         100,
  formatterOpts: { arbitrary: true }
};
