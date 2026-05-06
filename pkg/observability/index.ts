import { importTypes } from "@rancher/auto-import";
import {
  CONFIG_MAP,
  MANAGEMENT,
  NAMESPACE,
  NODE,
  POD,
  PV,
  PVC,
  SECRET,
  SERVICE,
  WORKLOAD_TYPES,
} from "@shell/config/types";
import {
  CardLocation,
  IPlugin,
  PanelLocation,
  TableColumnLocation,
  TabLocation
} from "@shell/core/types";

import extensionRouting from "./routing/extension-routing";
import { ObservabilityHealth } from "./types/headers";

// Init the package
export default function (plugin: IPlugin): void {
  // Auto-import model, detail, edit from the folders
  importTypes(plugin);

  // Provide plugin metadata from package.json
  plugin.metadata = require("./package.json");

  // Load a product
  plugin.addProduct(require("./product"));

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
    ObservabilityHealth,
  );

  plugin.addCard(
    CardLocation.CLUSTER_DASHBOARD_CARD,
    {},
    {
      labelKey: "sts.observed",
      component: () => import("./components/ObservabilityClusterCard.vue"),
    },
  );

  plugin.addPanel(
    PanelLocation.DETAIL_TOP,
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
    { component: () => import("./components/ComponentHealth.vue") },
  );

  plugin.addTab(
    TabLocation.RESOURCE_DETAIL,
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
        MANAGEMENT.CLUSTER,
      ],
    },
    {
      name: "observability",
      labelKey: "observability.name",
      showHeader: false,
      component: () => import("./components/MonitorTab.vue"),
    },
  );

  // Add Vue Routes
  plugin.addRoutes(extensionRouting);
}
