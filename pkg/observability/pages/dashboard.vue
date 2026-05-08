<script>
import ConfigurationView from "../components/Dashboard/ConfigurationView";
import { loadSuseObservabilitySettings } from "../modules/rancher";

export default {
  name: "ObservabilityDashboard",
  components: {
    ConfigurationView,
  },

  data: () => ({
    isConfigured: true,
  }),
  async fetch() {
    this.isConfigured =
      (await loadSuseObservabilitySettings(this.$store)) !== undefined;
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
    <ConfigurationView :mode="isConfigured ? 'edit' : 'create'" />
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
