<script>
import TriggeredMonitors from '../components/TriggeredMonitors.vue';
export default {
  name:       'StackstateCluster',
  components: { TriggeredMonitors },
  props:      {
    value: {
      type:     Object,
      required: true,
    },
  },
  computed: {
    observed() {
      return this.value.stackstate.length > 0;
    },

    isConfigured() {
      const sts = this.$store.getters['stackstate/hasCredentials'];

      return sts;
    }
  },
};
</script>
<template>
  <div v-if="!isConfigured">
    <div class="alert alert-warning">
      StackState is not configured.
    </div>
  </div>
  <div v-else-if="observed">
    <TriggeredMonitors :cluster-name="value.spec.displayName" />
  </div>
  <div v-else>
    <div>
      This cluster is not being observed by StackState. Please deploy the StackState Agent to this cluster.
    </div>
  </div>
</template>
<style  lang="scss" scoped>
</style>
