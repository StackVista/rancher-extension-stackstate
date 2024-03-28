<script>
import ComponentTriggeredMonitors from '../components/ComponentTriggeredMonitors.vue';

export default {
  name:       'StackstateCertificate',
  components: { ComponentTriggeredMonitors },
  props:      {
    value: {
      type:     Object,
      required: true,
    },
  },
  computed: {
    observed() {
      return this.value.stackstateIdentifier;
    },

    configured() {
      return this.$store.getters['stackstate/hasCredentials'];
    }
  },
};
</script>
<template>
  <div v-if="!configured">
    <div class="alert alert-warning">
      StackState is not configured.
    </div>
  </div>
  <div v-else-if="observed">
    <ComponentTriggeredMonitors :component-type="value.stackstateType" :stackstate-identifier="value.stackstateIdentifier" />
  </div>
  <div v-else>
    <div>
      This cluster is not being observed by StackState. Please deploy the StackState Agent to this cluster.
    </div>
  </div>
</template>
<style  lang="scss" scoped>
</style>
