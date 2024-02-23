<script>
import HealthState from '../components/HealthState.vue';
import HealthDisc from '../components/HealthDisc.vue';
import { getSnapshot } from '../modules/stackstate';

export default {
  components: {
    HealthState,
    HealthDisc,
  },
  name:  'TriggeredMonitors',
  props: { clusterName: String },
  data() {
    return {
      triggeredMonitors: [],
      loading:           true,
    };
  },
  computed: {
    componentTypes() {
      return this.$store.getters['stackstate/componentTypes'];
    },

    stackStateURL() {
      return this.$store.getters['stackstate/apiURL'];
    },

    stackStateToken() {
      return this.$store.getters['stackstate/apiToken'];
    },
  },

  async fetch() {
    const resp = await getSnapshot(this.$store, `not healthstate in ("CLEAR", "UNKNOWN") AND label = "cluster-name:${ this.clusterName }"`);
    const data = await resp;

    this.triggeredMonitors = data;

    console.log('ComponentTypes', this.componentTypes);

    this.loading = false;
  }
};
</script>
<template>
  <div v-if="loading">
    <p>Loading...</p>
  </div>
  <div v-else>
    <div>
      <div v-if="triggeredMonitors.viewSnapshotResponse.components.length === 0">
        <span>The health of the cluster is</span>
        <span class="spacer">&nbsp;</span>
        <HealthState state="CLEAR" />
      </div>
      <div v-else class="services-by-cluster-grid">
        {{ triggeredMonitors.viewSnapshotResponse.components.length }} health violations:
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Component</th>
              <th>Type</th>
              <th>Monitors triggered</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="component in triggeredMonitors.viewSnapshotResponse.components"
              :key="component.id"
            >
              <td>
                <HealthState :state="component.state.healthState" />
              </td>
              <td>
                <a :href="`https://jvanerp.gke-sandbox.gcp.stackstate.io/#/components/${encodeURIComponent(component.identifiers[0])}`" target="_blank">{{ component.name }}</a>
              </td>
              <td>
                {{ componentTypes.get(component.type) }}
              </td>
              <td>
                <div v-for="failingCheck in component.failingChecks" :key="failingCheck.id" class="monitor">
                  <HealthDisc :state="failingCheck.state.state" /><span class="spacer">&nbsp;</span>{{ failingCheck.name }}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.services-by-cluster-grid {
}
.services-by-cluster-grid table {
  margin-top: 8px;
  margin-left: 8px;
}

.services-by-cluster-grid table tr th {
  text-align: left;
  padding: 8px 16px;
}

.services-by-cluster-grid table tr td {
  padding: 4px 16px;
  vertical-align: text-top;
}

.services-by-cluster-grid table tr td a {
  line-height: 19px;
}

span.spacer {
  margin-left: 4px;
}

.monitor {
  margin-bottom: 8px;
}

</style>
