<script>
import { mapGetters } from 'vuex';
import LiveDate from '@shell/components/formatter/LiveDate.vue';
import SortableTable from '@shell/components/SortableTable';

import { loadComponent, mapKind, loadStackStateSettings } from '../modules/stackstate';
import { isStackStateObserved } from '../modules/observed';
import { MONITOR_HEADERS } from '../types/headers';

import HealthState from './Health/HealthState.vue';

export default {
  name:       'MonitorTab',
  components: {
    SortableTable, HealthState, LiveDate
  },
  props:      {
    resource: {
      type:     Object,
      required: true,
    }
  },
  data() {
    return {
      MONITOR_HEADERS,
      observed: false,
      urn:      '',
      url:      '',
      monitors: [],
    };
  },
  computed:   {
    ...mapGetters(['currentCluster']),

    clusterId() {
      return this.currentCluster?.id;
    },

    hasMonitors() {
      return this.monitors?.length > 0;
    },

    componentIdentifier() {
      const cluster = this.currentCluster?.spec.displayName;

      if (!cluster) {
        return '';
      }

      let identifier = `urn:kubernetes:/${ cluster }`;

      if (this.resource?.metadata?.namespace) {
        identifier += `:${ this.resource.metadata.namespace }`;
      }

      identifier += `:${ mapKind(this.resource?.type?.toLowerCase()) }/${ this.resource?.metadata?.name }`;

      return identifier;
    },
  },
  async fetch() {
    const obs = await isStackStateObserved(this.$store, this.clusterId);

    this.observed = obs?.length > 0;

    if (!this.observed) {
      return;
    }
    const creds = await loadStackStateSettings(this.$store);

    this.urn = this.componentIdentifier;

    const component = await loadComponent(this.$store, creds, this.urn);

    if (!component) {
      return;
    }

    this.monitors = component.syncedCheckStates;

    this.url = creds.spec.url;
  },
};
</script>
<template>
  <div v-if="!observed">
    <div class="card">
      <span>{{ t('components.monitorTab.notEnabled') }}</span>
    </div>
  </div>
  <div v-else-if="!hasMonitors">
    <div class="card">
      <span>{{ t('components.monitorTab.noMonitors') }}</span>
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
    <template #col:state="{row}">
      <td>
        <HealthState :state="row.health" />
      </td>
    </template>

    <template #col:monitor="{row}">
      <td>
        <a :href="`https://${url}/#/components/${encodeURIComponent(urn)}`" target="_blank">{{ row.name }}</a>
      </td>
    </template>

    <template #col:lastUpdate="{row}">
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
