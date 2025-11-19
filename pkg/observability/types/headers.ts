import { TableColumn } from "@rancher/shell/core/types";

export const ObservabilityHealth: TableColumn = {
  labelKey: "observability.health",
  getValue: (row: any) => {
    return "UNCONFIGURED";
  },
  formatter: "ComponentLinkedHealthState",
  width: 100,
  formatterOpts: { arbitrary: true },
};

export const MONITOR_HEADERS = [
  {
    name: "state",
    value: "state",
    labelKey: "components.monitorTab.state",
    sort: "state",
  },
  {
    name: "monitor",
    value: "monitor",
    labelKey: "components.monitorTab.monitor",
    sort: "monitor",
  },
  {
    name: "lastUpdate",
    value: "lastUpdate",
    labelKey: "components.monitorTab.lastUpdate",
    sort: "lastUpdate",
  },
];
