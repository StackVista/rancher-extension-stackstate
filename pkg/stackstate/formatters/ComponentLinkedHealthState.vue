<script>
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
    componentIdentifier() {
      let identifier = `urn:kubernetes:/rke2-challenges-cluster`;

      if (this.row.metadata.namespace) {
        identifier += `:${ this.row.metadata.namespace }`;
      }

      identifier += `:${ mapKind(this.row.kind.toLowerCase()) }/${ this.row.metadata.name }`;

      return identifier;
    },

    componentHealth() {
      return nil;
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

    this.componentUrn = this.componentIdentifier;
    const component = await loadComponent(this.$store, creds, this.componentUrn);

    console.log('component', component);
    this.health = component.state.healthState;
    this.url = creds.spec.url;
  }
};
</script>

<template>
  <a :href="`https://${url}/#/components/${encodeURIComponent(componentIdentifier)}`" target="_blank"><HealthState :state="health" :color="color" /></a>
</template>
