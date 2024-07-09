<script>
import { getSnapshot, loadStackStateSettings } from '../modules/stackstate';
import { isStackStateObserved } from '../modules/observed';
import HealthState from './Health/HealthState.vue';
import HealthDisc from './Health/HealthDisc.vue';

export default {
  name:       'StackStateObservedCard',
  components: { HealthState, HealthDisc },
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
    isConfigured() {
      return this.$store.getters['stackstate/hasCredentials'];
    },
  },
  data() {
    return {
      observed:  undefined,
      snapshot:  undefined,
      deviating: 0,
      critical:  0,
      healthy:   0,
    };
  },
  async fetch() {
    if (!this.isConfigured) {
      return;
    }
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
  },
};
</script>
<template>
  <div class="card">
    <div>
      <span><div class="logo" /></span>
    </div>
    <span class="spacer">&nbsp;</span>
    <div class="col">
      <div v-if="$fetchState.pending">
        <div>
          <span>
            Connecting to Observability Plane...
          </span>
        </div>
      </div>
      <div v-else-if="!isConfigured">
        <div>
          <span>
            Connection to StackState has not been configured, please go to the <a :href="`/stackstate/c/_/stackstate.io.dashboard`">StackState Configuration</a>
          </span>
        </div>
      </div>
      <div v-else-if="!isObserved">
        <div>
          <span>Cluster is</span>
          <span class="spacer">&nbsp;</span>
          <HealthState state="unobserved" color="grey" />
        </div>
        <div><span class="spacer">&nbsp;</span></div>
        <div><span>Cluster is not observed by StackState. Please <a :href="`/c/${resource.id}/apps/charts/chart?repo-type=cluster&repo=rancher-partner-charts&chart=stackstate-k8s-agent`">install</a> the agent</span></div>
      </div>
      <div v-else>
        <div>
          <span>
            Cluster health:
          </span>
          <span class="spacer">&nbsp;</span>
          <HealthState state="observed" color="green" />
        </div>
        <div><span class="spacer">&nbsp;</span></div>
        <div>
          <span>Component healths:</span>
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
      </div>
    </div>
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

span.header {
  font-size: 18px;
}

div.coldiv {
  padding-top: 10px;
}

div.col {
  display: flex;
  flex-direction: column;
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

div.logo {
  background-size: contain;
  background-repeat: no-repeat;
  width: 100px;
  height: 100px;
}

.theme-light div.logo {
  background-image: url('../sts-color.svg');
}

.theme-dark div.logo {
  background-image: url('../sts.svg');
}
</style>
