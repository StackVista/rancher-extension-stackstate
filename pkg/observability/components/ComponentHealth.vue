<script>
import { mapGetters } from 'vuex';
import { isCrdLoaded, loadComponent, loadSuseObservabilitySettings } from '../modules/suseObservability';
import { buildUrn } from '../modules/urn';
import { isObserved } from '../modules/observed';
import { HEALTH_STATE_TYPES } from '../types/types';
import HealthState from './Health/HealthState.vue';

export default {
  name:       'ComponentHealth',
  components: { HealthState },
  props:      {
    resource: {
      type:     Object,
      required: true,
    }
  },
  data() {
    return {
      observed: false,
      health:   HEALTH_STATE_TYPES.UNKNOWN,
      urn:      '',
    };
  },
  computed: {
    ...mapGetters(['currentCluster']),

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
    const obs = await isObserved(this.$store, this.clusterId);

    this.observed = obs.length > 0;

    if (!this.observed) {
      return;
    }

    const settings = await loadSuseObservabilitySettings(this.$store);

    this.urn = this.componentIdentifier;
    if (!this.urn || !settings) {
      return;
    }

    const component = await loadComponent(this.$store, settings, this.urn);

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
