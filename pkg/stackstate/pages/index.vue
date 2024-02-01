<script>
import { MANAGEMENT } from '@shell/config/types';
import Loading from '@shell/components/Loading';
import HealthState from '../components/HealthState.vue';
import HealthDisc from '../components/HealthDisc.vue';

export default {
  components: {
    Loading,
    HealthState,
    HealthDisc,
  },
  data() {
    return {
      stackStateClusters: [],
      violationsByCluster: {},
      componentTypes: {},
      loading: true,
    };
  },
  async fetch() {
    const allClusters = await this.$store.dispatch(`management/findAll`, {
      type: MANAGEMENT.CLUSTER,
    });

    this.stackStateClusters = await Promise.all(
      allClusters
        .filter((cluster) => cluster.isReady)
        .map(async (cluster) => ({
          name: cluster.spec.displayName,
          id: cluster.id,
          observed: (
            await this.$store.dispatch('cluster/request', {
              url: `/k8s/clusters/${cluster.id}/v1/apps.deployments`,
            })
          ).data.filter(depl => depl.metadata.labels['app.kubernetes.io/name'] === 'stackstate-k8s-agent'),
        }))
    );

    const allComponentTypes = await this.$store.dispatch(`management/request`, {
      url: `meta/proxy/XXXXXXXXX/api/node/ComponentType`,
      method: 'GET',
      headers: { 'Content-Type': 'application/json', 'X-API-Auth-Header': 'ApiKey XXXXXXXX' },
    });
    const componentTypes = await allComponentTypes;

    for (const componentType of componentTypes) {
      this.componentTypes[componentType.id] = componentType.name;
    }

    for (const cluster of this.stackStateClusters) {
      const resp = await this.$store.dispatch('management/request', {
        url: `meta/proxy/XXXXXXXXX/api/snapshot`,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Auth-Header': 'ApiKey XXXXXXXX' },
        data: {
          query: `not healthstate in ("CLEAR", "UNKNOWN") AND label = "cluster-name:${cluster.name}"`,
          queryVersion: '1.0',
          metadata: {
            groupingEnabled: false,
            showIndirectRelations: false,
            minGroupSize: 10,
            groupedByLayer: false,
            groupedByDomain: false,
            groupedByRelation: false,
            autoGrouping: false
          }
        },
      });
      const data = await resp;

      this.violationsByCluster[cluster.id] = data;
    }
    this.loading = false;
  },
  layout: 'plain',
};
</script>

<template>
  <Loading v-if="loading" />
  <div v-else>
    <div
      v-for="cluster in stackStateClusters"
      :key="cluster.id"
      style="margin-bottom: 2rem"
    >
      <h1
        class="cluster-header hack-to-keep-header-above-app-launcher-card-dropdown-button"
      >
        <strong>{{ cluster.name }}</strong>
      </h1>
      <div v-if="cluster.observed.length === 0">
        <p>No StackState agents found in this cluster.</p>
      </div>
      <div v-else>
        <div>
          StackState Agent deployed to namespace
          <span class="spacer">&nbsp;</span>
          <code>{{ cluster.observed[0].metadata.namespace }}</code>
        </div>
        <div>
          <div v-if="violationsByCluster[cluster.id].viewSnapshotResponse.components.length === 0">
            <span>The health of the cluster is</span>
            <span class="spacer">&nbsp;</span>
            <HealthState state="CLEAR" />
          </div>
          <div v-else class="services-by-cluster-grid">
            {{ violationsByCluster[cluster.id].viewSnapshotResponse.components.length }} health violations:
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
                  v-for="component in violationsByCluster[cluster.id].viewSnapshotResponse.components"
                  :key="component.id"
                >
                  <td>
                    <HealthState :state="component.state.healthState" />
                    <!-- <div :class="`healthstate-${component.state.healthState}`">
                      <span>{{ component.state.healthState }}</span>
                    </div> -->
                  </td>
                  <td>
                    <a :href="`https://jvanerp.gke-sandbox.gcp.stackstate.io/#/components/${encodeURIComponent(component.identifiers[0])}`" target="_blank">{{ component.name }}</a>
                  </td>
                  <td>
                    {{ componentTypes[component.type] }}
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
    </div>
  </div>
</template>

<style lang="scss" scoped>
.services-by-cluster-grid {
}
.cluster-header {
  align-items: center;
  background: var(--header-bg);
  border-bottom: var(--header-border-size) solid var(--header-border);
  display: flex;
  height: var(--header-height);
  position: sticky;
  top: 0;
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
// HACK(cjshearer): this shouldn't be necessary, since the position:sticky in
// the app-launcher page's header should make the header appear above its
// siblings, but the AppLauncherCard's ButtonDropDown element seems to have the
// wrong z-index by default, so we just force it to be below the header. See the
// following slack conversation for previous discussion on this:
// https://krumware.slack.com/archives/C053W936JAZ/p1691418985551309?thread_ts=1691099848.592889&cid=C053W936JAZ
.hack-to-keep-header-above-app-launcher-card-dropdown-button {
  z-index: 1;
}
</style>
