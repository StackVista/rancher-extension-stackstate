<script>
import HealthState from '../components/HealthState';

export default {
  name:       'HealthStateBadge',
  components: { HealthState },
  props:      {
    value: {
      type:    String,
      default: ''
    },
  },

  computed: {
    color() {
      switch (this.value) {
      case 'active':
        return 'green';
      case 'inactive':
        return 'red';
      default:
        return '';
      }
    }
  },
};
</script>

<template>
  <HealthState :state="value" :color="color" />
</template>
