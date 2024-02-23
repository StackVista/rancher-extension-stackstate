import { importTypes } from '@rancher/auto-import';
import { IPlugin, OnNavToPackage } from '@shell/core/types';
// @ts-ignore
import { FORMATTERS } from '@shell/components/SortableTable';
import { loadComponentTypes } from './modules/stackstate';
import extensionRouting from './routing/extension-routing';
// @ts-ignore
import HealthStateBadgeFormatter from './formatters/HealthStateBadge';
// @ts-ignore
import CodeFormatter from './formatters/Code';
import stackstateStore from './store';

const onEnter: OnNavToPackage = async(store) => {
  await loadComponentTypes(store);
};

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);
  FORMATTERS[HealthStateBadgeFormatter.name] = HealthStateBadgeFormatter;
  FORMATTERS[CodeFormatter.name] = CodeFormatter;

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // Load a product
  plugin.addProduct(require('./product'));

  plugin.addDashboardStore(stackstateStore.config.namespace, stackstateStore.specifics, stackstateStore.config);

  plugin.addNavHooks(onEnter);

  // Add Vue Routes
  plugin.addRoutes(extensionRouting);
}
