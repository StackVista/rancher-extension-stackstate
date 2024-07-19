<script>
import { mapGetters } from 'vuex';
import HealthState from '../components/Health/HealthState';
import { loadStackStateSettings, loadComponent, isCrdLoaded } from '../modules/stackstate';
import { buildUrn } from '../modules/urn';
import { HEALTH_STATE_TYPES } from '../types/types';

export default {
  name:       'ComponentLinkedHealthState',
  components: { HealthState },
  props:      {
    value: {
      type:    String,
      default: '',
    },
    row: {
      type:     Object,
      required: true,
    },
  },

  computed: {
    ...mapGetters(['currentCluster']),

    componentIdentifier() {
      const cluster = this.currentCluster?.spec.displayName;

      return buildUrn(this.row, cluster);
    },

    color() {
      switch (this.value) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'grey';
      default:
        return '';
      }
    },
  },
  data() {
    return {
      health:       HEALTH_STATE_TYPES.UNKNOWN,
      url:          '',
      componentUrn: '',
    };
  },

  async fetch() {
    if (!isCrdLoaded(this.$store)) {
      return;
    }

    const creds = await loadStackStateSettings(this.$store);

    this.componentUrn = this.componentIdentifier;
    if (!this.componentUrn) {
      return;
    }
    const component = await loadComponent(
      this.$store,
      creds,
      this.componentUrn
    );

    this.health = component.state.healthState;
    this.url = creds.spec.url;
  },
};
</script>

<template>
  <div v-if="componentUrn">
    <a
      :href="`https://${url}/#/components/${encodeURIComponent(
        componentIdentifier
      )}`"
      target="_blank"
    >
      <HealthState :state="health" :color="color" />
    </a>
  </div>
  <div v-else>
    <HealthState :state="health" :color="color" />
  </div>
</template>
