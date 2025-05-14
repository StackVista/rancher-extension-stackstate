<script>
import ConfigurationView from '../components/Dashboard/ConfigurationView';
import InstallView from '../components/Dashboard/InstallView';
import { ROLE_TEMPLATES } from '../types/rbac_types';

export default {
  name:       'ObservabilityDashboard',
  components: {
    ConfigurationView,
    InstallView,
  },

  computed: {
    isConfigured() {
      return this.$store.getters['observability/hasCredentials'];
    },
    missingCrd() {
      return this.$store.getters['observability/isCrdMissing'];
    },
    observabilityRepoPresent() {
      return this.$store.getters['observability/isRepoPresent'];
    },
  },
};
</script>

<template>
  <div class="dashboard">
    <div class="banner mt-40 mb-40">
      <div class="mb-20">
        <img src="../rancher-observability.svg" alt="SUSE Observability logo" />
      </div>
      <h1>{{ t("observability.name") }}</h1>
      <p>{{ t("observability.dashboard.description") }}</p>
    </div>
    <InstallView v-if="(missingCrd || !observabilityRepoPresent)" class="mt-40" />
    <ConfigurationView v-else :mode="isConfigured ? 'edit' : 'create'" />
  </div>
</template>

<style lang="scss" scoped>
.banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.banner img {
  height: 85px;
  width: auto;
}
</style>
