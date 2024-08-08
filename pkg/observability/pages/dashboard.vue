<script>
import Loading from '@shell/components/Loading';
import ConfigurationView from '../components/Dashboard/ConfigurationView';
import InstallCrdView from '../components/Dashboard/InstallCrdView';

export default {
  name:       'ObservabilityDashboard',
  components: {
    Loading,
    ConfigurationView,
    InstallCrdView,
  },

  data() {
    return { loading: false };
  },
  computed: {
    stackStateURL() {
      return this.$store.getters['observability/apiURL'];
    },

    isConfigured() {
      return this.$store.getters['observability/hasCredentials'];
    },
    missingCrd() {
      return this.$store.getters['observability/isCrdMissing'];
    },
  },
  async fetch() {
    await this.$store.dispatch('observability/setMissingCrd', this.missingCrd);
    this.loading = false;
  },
};
</script>

<template>
  <div class="dashboard">
    <div class="banner mt-40 mb-40">
      <div class="mb-20">
        <img src="../rancher-observability.svg" alt="StackState logo" />
      </div>
      <h1>{{ t("observability.name") }}</h1>
      <p>{{ t("observability.dashboard.description") }}</p>
    </div>
    <Loading v-if="$fetchState.pending" />
    <div v-else-if="missingCrd">
      <InstallCrdView class="mt-40" />
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
