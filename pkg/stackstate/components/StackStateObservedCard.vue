<script>
import Loading from '@shell/components/Loading';
import { getSnapshot, loadStackStateSettings } from '../modules/stackstate';
import { isStackStateObserved } from '../modules/observed';
import HealthState from './HealthState.vue';
import HealthDisc from './HealthDisc.vue';

export default {
  name:       'StackStateObservedCard',
  components: {
    Loading, HealthState, HealthDisc
  },
  props:      { resource: Object },
  computed:   {
    countDeviating() {
      return this.deviating;
    },
    countHealthy() {
      return this.healthy;
    },
    countCritical() {
      return this.critical;
    },
    isObserved() {
      return this.observed.length > 0;
    },
  },
  data() {
    return {
      observed:  undefined,
      snapshot:  undefined,
      deviating: 0,
      critical:  0,
      healthy:   0,
      loading:   true,
    };
  },
  async fetch() {
    const obs = await isStackStateObserved(this.$store, this.resource.id);
    const creds = await loadStackStateSettings(this.$store);

    this.snapshot = await getSnapshot(this.$store, `not healthstate in ("CLEAR", "UNKNOWN") AND label = "cluster-name:${ this.resource.spec.displayName }"`, creds);
    for (const component of this.snapshot.viewSnapshotResponse.components) {
      if (component.state.healthState === 'DEVIATING') {
        this.deviating++;
      } else if (component.state.healthState === 'CRITICAL') {
        this.critical++;
      } else if (component.state.healthState === 'HEALTHY') {
        this.healthy++;
      }
    }
    this.observed = obs;
    this.loading = false;
  },
};
</script>
<template>
  <div v-if="loading">
    <Loading />
  </div>
  <div v-else-if="!isObserved">
    <div class="card">
      <span><img src="../sts.svg" alt="StackState logo" style="width: 50px;" /></span>
      <span class="spacer">&nbsp;</span>
      <div>
        <span>Cluster is</span>
        <span class="spacer">&nbsp;</span>
        <HealthState state="unobserved" color="grey" />
      </div>
    </div>
    <span>Cluster is not observed by StackState. Please <a :href="`/c/${resource.id}/apps/charts/chart?repo-type=cluster&repo=rancher-partner-charts&chart=stackstate-k8s-agent`">install</a> the agent</span>
  </div>
  <div v-else>
    <div class="card">
      <span><img src="../sts.svg" alt="StackState logo" style="width: 50px;" /></span>
      <span class="spacer">&nbsp;</span>
      <div>
        <span>Cluster health:</span>
        <span class="spacer">&nbsp;</span>
        <HealthState state="observed" color="green" />
      </div>
    </div>
    <div>
      <span>Component healths:</span>
    </div>
    <div>
      <HealthDisc state="DEVIATING" />
      Deviating:
      <span class="spacer">&nbsp;</span>
      {{ countDeviating }}
    </div>
    <div>
      <HealthDisc state="CRITICAL" />
      Critical:
      <span class="spacer">&nbsp;</span>
      {{ countCritical }}
    </div>
  </div>
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

  .alert {
    display: flex;
    align-items: center;
    padding: 10px;
    margin: 10px 0;
    border-radius: 5px;
  }
</style>
