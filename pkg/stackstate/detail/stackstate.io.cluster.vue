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
    stackStateURL() {
      return this.$store.getters['stackstate/apiURL'];
    },

    stackStateToken() {
      return this.$store.getters['stackstate/apiToken'];
    },

    notConfigured() {
      return !this.stackStateURL || !this.stackStateToken;
    }
  },
};
</script>
<template>
  <div v-if="notConfigured">
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
