<script>
import { mapGetters } from "vuex";
import { loadComponent } from "../modules/suseObservability";
import { isCrdLoaded, loadSuseObservabilitySettings } from "../modules/rancher";
import { buildUrn } from "../modules/urn";
import { HEALTH_STATE_TYPES } from "../types/types";
import HealthState from "./Health/HealthState.vue";

export default {
  name: "ComponentHealth",
  components: { HealthState },
  props: {
    resource: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      health: HEALTH_STATE_TYPES.UNKNOWN,
      urn: "",
    };
  },
  computed: {
    ...mapGetters(["currentCluster"]),

    clusterId() {
      return this.currentCluster?.id;
    },

    componentIdentifier() {
      const cluster = this.currentCluster?.spec.displayName;

      return buildUrn(this.resource, cluster);
    },
  },
  async fetch() {
    if (!isCrdLoaded(this.$store)) {
      return;
    }

    const settings = await loadSuseObservabilitySettings(this.$store);

    this.urn = this.componentIdentifier;
    if (!this.urn || !settings) {
      return;
    }

    const component = await loadComponent(settings, this.urn);
    this.health = component.state.healthState;
  },
};
</script>
<template>
  <div class="health-block">
    <p>{{ t("components.componentHealth.title") }}</p>
    <HealthState class="health-state-block" :health="health" />
  </div>
</template>
<style lang="scss" scoped>
.health-block {
  line-height: 19px;
  font-size: 14px;
  align-items: center;
  display: flex;

  .health-state-block {
    margin-left: 12px;
  }
}
</style>
