<script>
import { FROM_CLUSTER } from "@shell/config/query-params";
import {
  getSnapshot,
  loadSuseObservabilitySettings,
  isCrdLoaded,
  loadObservationStatus,
  ObservationStatus,
  AgentStatus,
  loadAgentStatus,
} from "../modules/suseObservability";
import {
  HEALTH_STATE_TYPES,
  OBSERVABILITY_PRODUCT_NAME,
  BLANK_CLUSTER,
} from "../types/types";
import HealthState from "./Health/HealthState.vue";
import HealthDisc from "./Health/HealthDisc.vue";

export default {
  name: "ObservabilityClusterCard",
  components: { HealthState, HealthDisc },
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },
  computed: {
    countDeviating() {
      return this.deviating;
    },
    countCritical() {
      return this.critical;
    },
  },
  data() {
    return {
      observationStatus: ObservationStatus.Observed,
      agentStatus: AgentStatus.Installed,
      snapshot: undefined,
      deviating: 0,
      critical: 0,
      isConfigured: true,
      installUrl: undefined,
      HEALTH_STATE_TYPES,
      ObservationStatus,
      AgentStatus,
      extensionDashboardRoute: {
        name: `${OBSERVABILITY_PRODUCT_NAME}-c-cluster-dashboard`,
        params: { [FROM_CLUSTER]: BLANK_CLUSTER },
      },
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
    this.installUrl = `${settings.url}/#/stackpacks/kubernetes-v2`;

    this.observationStatus = await loadObservationStatus(
      this.$store,
      this.resource.spec.displayName,
      settings,
    );
    if (this.observationStatus === ObservationStatus.NotDeployed) {
      this.agentStatus = await loadAgentStatus(this.$store, this.resource.id);
    }

    try {
      this.snapshot = await getSnapshot(
        this.$store,
        `not healthstate in ("CLEAR", "UNKNOWN") AND label = "cluster-name:${this.resource.spec.displayName}"`,
        settings,
      );
      for (const component of this.snapshot.viewSnapshotResponse.components) {
        if (component.state.healthState === "DEVIATING") {
          this.deviating++;
        } else if (component.state.healthState === "CRITICAL") {
          this.critical++;
        }
      }
    } catch (e) {
      if (this.observationStatus === ObservationStatus.Observed) {
        logger.log(
          "ERROR: Unable to obtain topology, even though cluster is observed",
          e,
        );
      }
    }
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
        v-else-if="
          !isConfigured ||
          observationStatus === ObservationStatus.ConnectionError
        "
        class="flex-text"
      >
        <p>{{ t("observability.clusterCard.notConnectedPrepend") }}</p>
        <router-link :to="extensionDashboardRoute">
          {{ t("observability.clusterCard.notConnectedObservability") }}
        </router-link>
      </div>
      <div
        v-else-if="
          isConfigured && observationStatus === ObservationStatus.NotDeployed
        "
      >
        <p class="mb-20">
          {{ t("observability.clusterCard.clusterIs") }}
          <HealthState class="state-badge" health="unobserved" color="grey" />
        </p>
        <div v-if="agentStatus !== AgentStatus.Installed" class="flex-text">
          <p>
            {{ t("observability.clusterCard.notObservedPrepend") }}
            <a :href="installUrl">{{
              t("observability.clusterCard.notObservedInstall")
            }}</a>
            {{ t("observability.clusterCard.notObservedPostpend") }}
          </p>
        </div>
        <div v-else>
          <p>
            {{ t("observability.clusterCard.noDataPrepend") }}
            <a :href="installUrl">{{
              t("observability.clusterCard.noDataInstall")
            }}</a>
            {{ t("observability.clusterCard.noDataPostpend") }}
          </p>
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
            <span class="item-count" data-testid="obs-deviating-count">{{
              countDeviating
            }}</span>
          </p>
          <p>
            <HealthDisc :health="HEALTH_STATE_TYPES.CRITICAL" />
            {{ t("observability.clusterCard.critical") }}
            <span class="item-count" data-testid="obs-critical-count">{{
              countCritical
            }}</span>
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
