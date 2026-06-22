<script>
import { mapGetters } from "vuex";
import HealthState from "../components/Health/HealthState";
import {
  loadSuseObservabilitySettings,
  loadAgentStatus,
} from "../modules/rancher";
import {
  ConnectionStatus,
  FetchError,
  loadComponent,
} from "../modules/suseObservability";
import { buildUrn } from "../modules/urn";
import { HEALTH_STATE_TYPES } from "../types/types";

export default {
  name: "ComponentLinkedHealthState",
  components: { HealthState },
  props: {
    value: {
      type: String,
      default: "",
    },
    row: {
      type: Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters(["currentCluster"]),

    color() {
      switch (this.value) {
        case "active":
          return "green";
        case "inactive":
          return "grey";
        default:
          return "";
      }
    },
  },
  data() {
    return {
      HEALTH_STATE_TYPES,
      isLoading: true,
      error: null,
      data: null,
    };
  },

  async fetch() {
    const agentStatus = await loadAgentStatus(
      this.$store,
      this.currentCluster?.id,
    );
    const clusterName =
      agentStatus.clusterName ?? this.currentCluster.spec.displayName;
    const componentIdentifier = buildUrn(this.row, clusterName);

    if (!componentIdentifier) {
      this.isLoading = false;

      return;
    }

    try {
      const settings = await loadSuseObservabilitySettings(this.$store);

      const component = await loadComponent(settings, componentIdentifier);

      this.data = {
        health: component.state.healthState,
        href: `${settings.url}/#/components/${encodeURIComponent(
          componentIdentifier,
        )}`,
      };
    } catch (error) {
      this.error = error;

      if (error instanceof FetchError) {
        if (error.status === ConnectionStatus.Unconfigured) {
          this.data = {
            health: HEALTH_STATE_TYPES.UNCONFIGURED,
          };
          return;
        }
      }

      this.data = {
        health: HEALTH_STATE_TYPES.CONNECTION_ERROR,
      };
    } finally {
      this.isLoading = false;
    }
  },
};
</script>

<template>
  <HealthState v-if="isLoading" :color="color" />

  <a
    v-else-if="data"
    :href="data.href"
    target="_blank"
    rel="nofollow noopener noreferrer"
  >
    <HealthState :health="data.health" :color="color" />
  </a>

  <HealthState
    v-else
    :health="HEALTH_STATE_TYPES.UNCONFIGURED"
    :color="color"
  />
</template>
