<script>
import { mapGetters } from "vuex";
import { loadComponent, loadStackStateSettings } from "../modules/stackstate";
import { buildUrn } from "../modules/urn";
import { isStackStateObserved } from "../modules/observed";
import { HEALTH_STATE_TYPES } from "../types/types";
import HealthState from "./Health/HealthState.vue";

export default {
  name: "ComponentHealth",
  components: { HealthState },
  props: { resource: Object },
  data() {
    return {
      observed: false,
      health: HEALTH_STATE_TYPES.NOT_MONITORED,
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
    const obs = await isStackStateObserved(this.$store, this.clusterId);

    this.observed = obs.length > 0;

    if (!this.observed) {
      return;
    }
    const creds = await loadStackStateSettings(this.$store);

    this.urn = this.componentIdentifier;
    if (!this.urn) {
      return;
    }

    const component = await loadComponent(this.$store, creds, this.urn);

    this.health = component.state.healthState;
  },
};
</script>
<template>
  <div class="card">
    <p>{{ t("components.componentHealth.title") }}</p>
    <HealthState class="health-state-block" :state="health" />
  </div>
  <!-- <div class="card">
    <div>
      <span>{{ t("components.componentHealth.title") }}</span>
      <span class="spacer">&nbsp;</span>
      <HealthState :state="health" />
    </div>
  </div> -->
</template>
<style lang="scss" scoped>
div.card {
  line-height: 19px;
  font-size: 14px;
  align-items: center;
  display: flex;

  .health-state-block {
    margin-left: 4px;
  }
}

span.spacer {
  margin-left: 4px;
}
</style>
