import { TableColumn } from '@rancher/shell/core/types';

export const ObservabilityHealth: TableColumn = {
  labelKey: 'observability.health',
  getValue: (row: any) => {
    return 'UNKNOWN';
  },
  sort:          ['stateSort'],
  formatter:     'ComponentLinkedHealthState',
  width:         100,
  formatterOpts: { arbitrary: true }
};
