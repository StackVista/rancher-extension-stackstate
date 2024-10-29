<script>
import Loading from '@shell/components/Loading';
import ConfigurationView from '../components/Dashboard/ConfigurationView';
import InstallView from '../components/Dashboard/InstallView';

export default {
  name:       'ObservabilityDashboard',
  components: {
    Loading,
    ConfigurationView,
    InstallView,
  },

  data() {
    return { loading: false };
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
  async fetch() {
    await this.$store.dispatch('observability/setMissingCrd', this.missingCrd);
    await this.$store.dispatch('observability/setRepoPresent', this.observabilityRepoPresent);
    this.loading = false;
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
    <Loading v-if="$fetchState.pending" />
    <div v-else-if="(missingCrd || !observabilityRepoPresent) ">
      <InstallView class="mt-40" />
    </div>
    <div v-else-if="!isConfigured">
      <ConfigurationView mode="create" />
    </div>
    <div v-else>
      <ConfigurationView mode="edit" />
    </div>
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
