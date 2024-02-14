import { importTypes } from '@rancher/auto-import';
import { IPlugin, OnNavToPackage } from '@shell/core/types';
import { getComponentTypes } from './modules/componentTypes';
import extensionRouting from './routing/extension-routing';
import stackstateStore from './store';

const onEnter: OnNavToPackage = async(store) => {
  await getComponentTypes(store);
};

// Init the package
export default function(plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require('./package.json');

  // Load a product
  plugin.addProduct(require('./product'));

  plugin.addDashboardStore(stackstateStore.config.namespace, stackstateStore.specifics, stackstateStore.config);

  plugin.addNavHooks(onEnter);

  // Add Vue Routes
  plugin.addRoutes(extensionRouting);
}
