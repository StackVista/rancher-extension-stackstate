import { importTypes } from '@rancher/auto-import';
import { CardLocation, IPlugin, OnNavToPackage, TableColumnLocation } from '@shell/core/types';
// @ts-ignore
import { FORMATTERS } from '@shell/components/SortableTable';
import {
  NODE, POD, SERVICE, WORKLOAD_TYPES, NAMESPACE,
  SECRET,
  CONFIG_MAP,
  STORAGE_CLASS,
  PV,
  PVC
} from '@shell/config/types';

// @ts-ignore
import ComponentLinkedHealthStateFormatter from './formatters/ComponentLinkedHealthState';
import { loadComponentTypes, loadConnectionInfo } from './modules/stackstate';
import extensionRouting from './routing/extension-routing';
import stackstateStore from './store';
import { StackStateHealth } from './types/headers';

const onEnter: OnNavToPackage = async(store) => {
  await loadComponentTypes(store);
  await loadConnectionInfo(store);
};

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  FORMATTERS[ComponentLinkedHealthStateFormatter.name] = ComponentLinkedHealthStateFormatter;

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // Load a product
  plugin.addProduct(require('./product'));

  plugin.addDashboardStore(stackstateStore.config.namespace, stackstateStore.specifics, stackstateStore.config, (store: any, ctx: any) => {
    loadComponentTypes(store);
    loadConnectionInfo(store);
  });
  plugin.addNavHooks(onEnter);

  plugin.addTableColumn(
    TableColumnLocation.RESOURCE,
    {
      resource: [
        POD,
        WORKLOAD_TYPES.CRON_JOB,
        WORKLOAD_TYPES.DAEMON_SET,
        WORKLOAD_TYPES.DEPLOYMENT,
        WORKLOAD_TYPES.JOB,
        WORKLOAD_TYPES.STATEFUL_SET,
        SERVICE,
        NODE,
        NAMESPACE,
        SECRET,
        CONFIG_MAP,
        PV,
        PVC,
      ],
    },
    StackStateHealth
  );

  plugin.addCard(CardLocation.CLUSTER_DASHBOARD_CARD, {}, {
    labelKey:  'sts.observed',
    component: () => import('./components/StackStateObservedCard.vue'),
  });

  // Add Vue Routes
  plugin.addRoutes(extensionRouting);
}
