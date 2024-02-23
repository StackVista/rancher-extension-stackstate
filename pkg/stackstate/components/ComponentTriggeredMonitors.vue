<script>
import HealthState from '../components/HealthState.vue';
import HealthDisc from '../components/HealthDisc.vue';
import { getSnapshot } from '../modules/stackstate';

export default {
  components: {
    HealthState,
    HealthDisc,
  },
  name:  'ComponentTriggeredMonitors',
  props: {
    componentType: {
      type:     String,
      required: true,
    },
    stackstateIdentifier: {
      type:     String,
      required: true,
    },
  },
  data() {
    return {
      component: {},
      loading:   true,
    };
  },
  computed: {
    componentTypes() {
      return this.$store.getters['stackstate/componentTypes'];
    },

    foundComponent() {
      return this.component.viewSnapshotResponse.components.length > 0;
    },

    tooManyComponents() {
      return this.component.viewSnapshotResponse.components.length > 1;
    },

    componentHealth() {
      return this.component.viewSnapshotResponse.components[0].state.healthState;
    },

    healthViolations() {
      return this.component.viewSnapshotResponse.components[0].failingChecks;
    },

    hasHealthViolations() {
      return this.healthViolations.length > 0;
    }
  },
  async fetch() {
    const resp = await getSnapshot(this.$store, `identifier = "${ this.stackstateIdentifier }"`);
    const data = await resp;

    this.component = data;

    this.loading = false;
  }
};
</script>
<template>
  <div v-if="loading">
    <p>Loading...</p>
  </div>
  <div v-else-if="!foundComponent">
    <p>Component is not found in StackState...</p>
  </div>
  <div v-else-if="tooManyComponents">
    <p>Too many components were returned, bug in the integration.</p>
  </div>
  <div v-else>
    <div>
      <div>
        <span>The health of the {{ componentType }} is</span>
        <span class="spacer">&nbsp;</span>
        <HealthState :state="componentHealth" />
      </div>
      <div v-if="hasHealthViolations" class="services-by-cluster-grid">
        {{ healthViolations.length }} health violations:
        <table>
          <thead>
            <tr>
              <th>Severity</th>
              <th>Monitors triggered</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="violation in healthViolations"
              :key="violation.id"
            >
              <td>
                <HealthState :state="violation.state.state" />
              </td>
              <td>
                <a :href="`https://jvanerp.gke-sandbox.gcp.stackstate.io/#/components/${encodeURIComponent(component.identifiers[0])}`" target="_blank">{{ violation.name }}</a>
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
