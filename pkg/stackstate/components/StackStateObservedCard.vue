<script>
import {
  getSnapshot,
  loadStackStateSettings,
  isCrdLoaded,
} from '../modules/stackstate';
import { isStackStateObserved } from '../modules/observed';
import { HEALTH_STATE_TYPES } from '../types/types';
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
  },
  data() {
    return {
      observed:     [],
      snapshot:     undefined,
      deviating:    0,
      critical:     0,
      healthy:      0,
      isConfigured: true,
      HEALTH_STATE_TYPES,
    };
  },
  async fetch() {
    this.isMissingCrd = !isCrdLoaded(this.$store);
    if (this.isMissingCrd) {
      this.isConfigured = false;

      return;
    }

    const creds = await loadStackStateSettings(this.$store);

    if (!creds) {
      this.isConfigured = false;

      return;
    }

    const obs = await isStackStateObserved(this.$store, this.resource.id);

    if (!obs) {
      return;
    }

    this.snapshot = await getSnapshot(
      this.$store,
      `not healthstate in ("CLEAR", "UNKNOWN") AND label = "cluster-name:${ this.resource.spec.displayName }"`,
      creds
    );
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
  <div class="stackstate-card">
    <div class="logo" />
    <div class="stackstate-card-content">
      <p v-if="$fetchState.pending">
        {{ t("observability.clusterCard.connecting") }}
      </p>
      <p
        v-else-if="!isConfigured"
        v-clean-html="t('observability.clusterCard.notConnected', {}, true)"
      />
      <div v-else-if="isConfigured && !isObserved">
        <p class="mb-20">
          {{ t("observability.clusterCard.clusterIs") }}
          <HealthState class="state-badge" state="unobserved" color="grey" />
        </p>
        <p
          v-clean-html="
            t(
              'observability.clusterCard.notObserved',
              { id: resource.id },
              true
            )
          "
        />
      </div>
      <div v-else>
        <p class="mb-20">
          {{ t("observability.clusterCard.clusterHealth") }}
          <HealthState state="observed" color="green" />
        </p>
        <div>
          <p>{{ t("observability.clusterCard.componentsHealth") }}</p>
          <p>
            <HealthDisc :state="HEALTH_STATE_TYPES.DEVIATING" />
            {{ t("observability.clusterCard.deviating") }}
            <span class="item-count">{{ countDeviating }}</span>
          </p>
          <p>
            <HealthDisc :state="HEALTH_STATE_TYPES.CRITICAL" />
            {{ t("observability.clusterCard.critical") }}
            <span class="item-count">{{ countCritical }}</span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.stackstate-card {
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
  }

  .stackstate-card-content {
    display: flex;
    flex-direction: column;

    .state-badge {
      margin-left: 6px;
    }

    .item-count {
      margin-left: 8px;
    }
  }
}

.theme-light div.logo {
  background-image: url("../sts-color.svg");
}

.theme-dark div.logo {
  background-image: url("../sts.svg");
}
</style>
