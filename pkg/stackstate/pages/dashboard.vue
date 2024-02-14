<script>
import { MANAGEMENT } from '@shell/config/types';
import Loading from '@shell/components/Loading';
import TriggeredMonitors from '../components/TriggeredMonitors.vue';

export default {
  name:       'StackStateDashboard',
  components: {
    Loading,
    TriggeredMonitors
  },

  data() {
    return {
      stackStateClusters:  [],
      loading:             true,
    };
  },
  computed: {
    stackStateURL() {
      return this.$store.getters['stackstate/apiURL'];
    },

    stackStateToken() {
      return this.$store.getters['stackstate/apiToken'];
    },

    isConfigured() {
      return this.stackStateURL && this.stackStateToken;
    },
  },
  async fetch() {
    const allClusters = await this.$store.dispatch(`management/findAll`, { type: MANAGEMENT.CLUSTER });

    this.stackStateClusters = await Promise.all(
      allClusters
        .filter(cluster => cluster.isReady)
        .map(async cluster => ({
          name:     cluster.spec.displayName,
          id:       cluster.id,
          observed: (
            await this.$store.dispatch('cluster/request', { url: `/k8s/clusters/${ cluster.id }/v1/apps.deployments` })
          ).data.filter(depl => depl.metadata.labels['app.kubernetes.io/name'] === 'stackstate-k8s-agent'),
        }))
    );

    this.loading = false;
  },
};
</script>

<template>
  <div v-if="!isConfigured">
    <p>
      StackState is not configured. Please configure StackState in the
      <router-link to="/management/stackstate">
        management
      </router-link> page.
    </p>
  </div>
  <Loading v-else-if="loading" />
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
        <TriggeredMonitors :cluster-name="cluster.name" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cluster-header {
  align-items: center;
  background: var(--header-bg);
  border-bottom: var(--header-border-size) solid var(--header-border);
  display: flex;
  height: var(--header-height);
  position: sticky;
  top: 0;
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
