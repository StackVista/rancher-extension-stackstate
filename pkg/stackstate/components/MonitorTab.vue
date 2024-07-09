<script>
import { mapGetters } from 'vuex';
import LiveDate from '@shell/components/formatter/LiveDate.vue';
import { loadComponent, mapKind, loadStackStateSettings } from '../modules/stackstate';
import { isStackStateObserved } from '../modules/observed';
import HealthState from './Health/HealthState.vue';

export default {
  name:       'MonitorTab',
  components: { HealthState, LiveDate },
  props:      { resource: Object },
  data() {
    return {
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
      return this.monitors.length > 0;
    },

    componentIdentifier() {
      const cluster = this.currentCluster?.spec.displayName;

      if (!cluster) {
        return '';
      }

      let identifier = `urn:kubernetes:/${ cluster }`;

      if (this.resource.metadata.namespace) {
        identifier += `:${ this.resource.metadata.namespace }`;
      }

      identifier += `:${ mapKind(this.resource.type.toLowerCase()) }/${ this.resource.metadata.name }`;

      return identifier;
    },
  },
  async fetch() {
    const obs = await isStackStateObserved(this.$store, this.clusterId);

    this.observed = obs.length > 0;

    if (!this.observed) {
      return;
    }
    const creds = await loadStackStateSettings(this.$store);

    this.urn = this.componentIdentifier;

    const component = await loadComponent(this.$store, creds, this.urn);

    this.monitors = component.syncedCheckStates;

    this.url = creds.spec.url;
  },
};
</script>
<template>
  <div v-if="!observed">
    <div class="card">
      <span>Rancher Observability is not enabled for this cluster.</span>
    </div>
  </div>
  <div v-else-if="!hasMonitors">
    <div class="card">
      <span>No monitors found for this component.</span>
    </div>
  </div>
  <div v-else class="sortable-table-list-container">
    <table width="100%" class="sortable-table top-divider">
      <thead>
        <tr>
          <th align="left" class="sortable" width="110px">
            <div class="table-header-container">
              <span>State</span>
            </div>
          </th>
          <th align="left">
            <div class="table-header-container">
              <span>Monitor</span>
            </div>
          </th>
          <th align="left">
            <div class="table-header-container">
              <span>Last update</span>
            </div>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="mon in monitors"
          :key="mon.checkStateId"
          class="main-row"
        >
          <td class="col-badge-state-formatter" align="center">
            <HealthState :state="mon.health" />
          </td>
          <td>
            <a :href="`https://${url}/#/components/${encodeURIComponent(urn)}`" target="_blank">{{ mon.name }}</a>
          </td>
          <td><LiveDate :value="mon.lastUpdateTimestamp" /></td>
        </tr>
      </tbody>
    </table>
  </div>
  </div>
</template>
<style lang="scss" scoped>
table.sortable-table {
  border-collapse: collapse;
  width: 100%;
  outline: 1px solid var(--border);
  background: var(--sortable-table-bg);
}
div.card {
  line-height: 19px;
  font-size: 14px;
  align-items: center;
  display: flex;
}

span.spacer {
  margin-left: 4px;
}

.table-header-container span {
  line-height: 28px;
  height: 28px;
  font-weight: 400;
}

thead tr {
  background: var(--sortable-table-header-bg);
  border-bottom: 1px solid var(--border);
}

th:first-of-type {
  padding-left: 10px;
  padding-right: 5px;
  padding-top: 8px;
  padding-bottom: 8px
}

th {
  padding: 8px 5px;
}
</style>
