<script>
import { mapGetters } from 'vuex';
import HealthState from '../components/HealthState';
import { loadStackStateSettings, mapKind, loadComponent } from '../modules/stackstate';
import { buildUrn } from '../modules/urn';

export default {
  name:       'ComponentLinkedHealthState',
  components: { HealthState },
  props:      {
    value: {
      type:    String,
      default: ''
    },
    row: {
      type:     Object,
      required: true
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
    }
  },
  data() {
    return {
      health:       '',
      url:          '',
      componentUrn: ''
    };
  },

  async fetch() {
    const creds = await loadStackStateSettings(this.$store);

    this.health = 'UNKNOWN';

    this.componentUrn = this.componentIdentifier;
    if (!this.componentUrn) {
      this.health = 'UNKNOWN';

      return;
    }
    const component = await loadComponent(this.$store, creds, this.componentUrn);

    this.health = component.state.healthState;
    this.url = creds.spec.url;
  }
};
</script>

<template>
  <a v-if="componentUrn" :href="`https://${url}/#/components/${encodeURIComponent(componentIdentifier)}`" target="_blank"><HealthState :state="health" :color="color" /></a>
</template>
