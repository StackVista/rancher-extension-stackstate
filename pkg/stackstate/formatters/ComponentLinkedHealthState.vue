<script>
import { mapGetters } from 'vuex';
import HealthState from '../components/HealthState';
import { loadStackStateSettings, mapKind, loadComponent } from '../modules/stackstate';

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

      if (!cluster) {
        return '';
      }

      let identifier = `urn:kubernetes:/${ cluster }`;

      if (this.row.metadata.namespace) {
        identifier += `:${ this.row.metadata.namespace }`;
      }

      identifier += `:${ mapKind(this.row.type.toLowerCase()) }/${ this.row.metadata.name }`;

      return identifier;
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
    }
    const component = await loadComponent(this.$store, creds, this.componentUrn);

    this.health = component.state.healthState;
    this.url = creds.spec.url;
  }
};
</script>

<template>
  <a :href="`https://${url}/#/components/${encodeURIComponent(componentIdentifier)}`" target="_blank"><HealthState :state="health" :color="color" /></a>
</template>
