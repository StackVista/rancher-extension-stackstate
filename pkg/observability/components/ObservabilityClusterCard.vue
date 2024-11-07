<script>
import {
  REPO_TYPE,
  REPO,
  CHART,
  FROM_CLUSTER,
} from '@shell/config/query-params';
import {
  getSnapshot,
  loadSuseObservabilitySettings,
  isCrdLoaded,
} from '../modules/suseObservability';
import { isObserved } from '../modules/observed';
import { HEALTH_STATE_TYPES, OBSERVABILITY_PRODUCT_NAME, BLANK_CLUSTER } from '../types/types';
import HealthState from './Health/HealthState.vue';
import HealthDisc from './Health/HealthDisc.vue';

export default {
  name:       'ObservabilityClusterCard',
  components: { HealthState, HealthDisc },
  props:      {
    resource: {
      type:     Object,
      required: true,
    }
  },
  computed:   {
    countDeviating() {
      return this.deviating;
    },
    countCritical() {
      return this.critical;
    },
    isObserved() {
      return this.observed.length > 0;
    },
    chartRoute() {
      return {
        name:   'c-cluster-apps-charts-chart',
        params: { [FROM_CLUSTER]: this.resource?.id },
        query:  {
          [REPO_TYPE]: 'cluster',
          [REPO]:      'rancher-partner-charts',
          [CHART]:     'stackstate-k8s-agent',
        }
      };
    }
  },
  data() {
    return {
      observed:                [],
      snapshot:                undefined,
      deviating:               0,
      critical:                0,
      isConfigured:            true,
      HEALTH_STATE_TYPES,
      extensionDashboardRoute: {
        name:   `${ OBSERVABILITY_PRODUCT_NAME }-c-cluster-dashboard`,
        params: { [FROM_CLUSTER]: BLANK_CLUSTER },
      }
    };
  },
  async fetch() {
    this.isMissingCrd = !isCrdLoaded(this.$store);
    if (this.isMissingCrd) {
      this.isConfigured = false;

      return;
    }

    const settings = await loadSuseObservabilitySettings(this.$store);

    if (!settings) {
      this.isConfigured = false;

      return;
    }

    const obs = await isObserved(this.$store, this.resource.id);

    if (!obs) {
      return;
    }

    this.snapshot = await getSnapshot(
      this.$store,
      `not healthstate in ("CLEAR", "UNKNOWN") AND label = "cluster-name:${ this.resource.spec.displayName }"`,
      settings
    );
    for (const component of this.snapshot.viewSnapshotResponse.components) {
      if (component.state.healthState === 'DEVIATING') {
        this.deviating++;
      } else if (component.state.healthState === 'CRITICAL') {
        this.critical++;
      }
    }
    this.observed = obs;
  },
};
</script>
<template>
  <div class="observability-card">
    <div class="logo" />
    <div class="observability-card-content">
      <p v-if="$fetchState.pending">
        {{ t("observability.clusterCard.connecting") }}
      </p>
      <div
        v-else-if="!isConfigured"
        class="flex-text"
      >
        <p>{{ t('observability.clusterCard.notConnectedPrepend') }}</p>
        <router-link :to="extensionDashboardRoute">
          {{ t('observability.clusterCard.notConnectedObservability') }}
        </router-link>
      </div>
      <div v-else-if="isConfigured && !isObserved">
        <p class="mb-20">
          {{ t("observability.clusterCard.clusterIs") }}
          <HealthState class="state-badge" health="unobserved" color="grey" />
        </p>
        <div class="flex-text">
          <p>{{ t('observability.clusterCard.notObservedPrepend') }}</p>
          <router-link :to="chartRoute">
            {{ t('observability.clusterCard.notObservedInstall') }}
          </router-link>
          <p>{{ t('observability.clusterCard.notObservedPostpend') }}</p>
        </div>
      </div>
      <div v-else>
        <p class="mb-20">
          {{ t("observability.clusterCard.clusterHealth") }}
          <HealthState health="observed" color="green" />
        </p>
        <div>
          <p>{{ t("observability.clusterCard.componentsHealth") }}</p>
          <p>
            <HealthDisc :health="HEALTH_STATE_TYPES.DEVIATING" />
            {{ t("observability.clusterCard.deviating") }}
            <span class="item-count">{{ countDeviating }}</span>
          </p>
          <p>
            <HealthDisc :health="HEALTH_STATE_TYPES.CRITICAL" />
            {{ t("observability.clusterCard.critical") }}
            <span class="item-count">{{ countCritical }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.observability-card {
  line-height: 19px;
  font-size: 14px;
  align-items: center;
  display: flex;
  margin-top: 30px;

  .logo {
    background-size: contain;
    background-repeat: no-repeat;
    width: 100px;
    height: 100px;
    margin-right: 16px;
    background-image: url("../rancher-observability.svg");
  }

  .observability-card-content {
    display: flex;
    flex-direction: column;

    .state-badge {
      margin-left: 6px;
    }

    .flex-text {
      display: flex;

      a {
        margin: 0 3px;
      }
    }

    .item-count {
      margin-left: 8px;
    }
  }
}

.theme-dark div.logo {
  background-image: url("../rancher-observability.svg");
  filter: invert(1);
}
</style>
