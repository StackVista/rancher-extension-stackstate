<script>
import { mapGetters } from "vuex";
import LiveDate from "@shell/components/formatter/LiveDate.vue";
import SortableTable from "@shell/components/SortableTable";

import {
  loadComponent,
  loadObservationStatus,
  ObservationStatus,
} from "../modules/suseObservability";
import { loadSuseObservabilitySettings, isCrdLoaded } from "../modules/rancher";
import { mapKind } from "../modules/urn";
import { MONITOR_HEADERS } from "../types/headers";

import HealthState from "./Health/HealthState.vue";

export default {
  name: "MonitorTab",
  components: {
    SortableTable,
    HealthState,
    LiveDate,
  },
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      MONITOR_HEADERS,
      observationStatus: ObservationStatus.Observed,
      ObservationStatus,
      urn: "",
      url: "",
      monitors: [],
      currResourceData: undefined,
    };
  },
  computed: {
    ...mapGetters(["currentCluster"]),

    clusterId() {
      return this.currentCluster?.id;
    },

    hasMonitors() {
      return this.monitors?.length > 0;
    },

    componentIdentifier() {
      const cluster = this.currentCluster?.spec.displayName;

      if (!cluster) {
        return "";
      }

      let identifier = `urn:kubernetes:/${cluster}`;

      const resourceData = this.resource?.metadata
        ? this.resource
        : this.currResourceData;

      if (resourceData?.metadata?.namespace) {
        identifier += `:${resourceData.metadata.namespace}`;
      }

      identifier += `:${mapKind(resourceData?.type?.toLowerCase())}/${
        resourceData?.metadata?.name
      }`;

      return identifier;
    },
  },
  async fetch() {
    if (!isCrdLoaded(this.$store)) {
      return;
    }

    if (!this.resource?.metadata) {
      const routeResource = this.$route?.params?.resource;
      const routeNamespace = this.$route?.params?.namespace;
      const routeResourceId = this.$route?.params?.id;

      const resourceId = routeNamespace
        ? `${routeNamespace}/${routeResourceId}`
        : routeResourceId;

      this.currResourceData = await this.$store.dispatch("cluster/find", {
        type: routeResource,
        id: resourceId,
      });
    }

    const settings = await loadSuseObservabilitySettings(this.$store);

    this.urn = this.componentIdentifier;

    try {
      const component = await loadComponent(settings, this.urn);
      this.monitors = component.syncedCheckStates;

      this.url = settings.url;
    } catch (e) {
      this.observationStatus = await loadObservationStatus(
        this.clusterId,
        settings,
      );
    }
  },
};
</script>
<template>
  <div v-if="observationStatus === ObservationStatus.NotDeployed">
    <div class="card">
      <span>{{ t("components.monitorTab.notEnabled") }}</span>
    </div>
  </div>
  <div v-else-if="observationStatus === ObservationStatus.ConnectionError">
    <div class="card">
      <span>{{ t("components.monitorTab.connectionError") }}</span>
    </div>
  </div>
  <div v-else-if="!hasMonitors">
    <div class="card">
      <span>{{ t("components.monitorTab.noMonitors") }}</span>
    </div>
  </div>
  <SortableTable
    v-else
    :rows="monitors"
    :headers="MONITOR_HEADERS"
    :table-actions="false"
    :row-actions="false"
    key-field="checkStateId"
    default-sort-by="state"
    :paging="true"
    :rows-per-page="40"
  >
    <template #col:state="{ row }">
      <td>
        <HealthState :health="row.health" />
      </td>
    </template>

    <template #col:monitor="{ row }">
      <td>
        <a
          :href="`${url}/#/components/${encodeURIComponent(urn)}`"
          target="_blank"
          rel="nofollow noopener noreferrer"
          >{{ row.name }}</a
        >
      </td>
    </template>

    <template #col:lastUpdate="{ row }">
      <td>
        <LiveDate :value="row.lastUpdateTimestamp" />
      </td>
    </template>
  </SortableTable>
</template>

<style lang="scss" scoped>
div.card {
  line-height: 19px;
  font-size: 14px;
  align-items: center;
  display: flex;
}

span.spacer {
  margin-left: 4px;
}
</style>
