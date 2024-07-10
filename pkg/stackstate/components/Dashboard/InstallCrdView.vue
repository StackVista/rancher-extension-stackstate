<script>
import { mapGetters } from 'vuex';
import { OBSERVABILITY_CRD } from '../../types/types';
import { handleGrowl } from '../../utils/growl';

export default {
  computed:   { ...mapGetters(['currentCluster']) },
  methods:    {
    async installCrd() {
      try {
        const crd = await this.$store.dispatch('management/request',
          {
            url:    '/v1/apiextensions.k8s.io.customresourcedefinitions',
            method: 'POST',
            data:   OBSERVABILITY_CRD,
          });

        await this.$store.dispatch('observability/setMissingCrd', false);
      } catch (err) {
        console.error(err);
        handleGrowl(this.$store, {
          error: {
            message: 'Failed to install CRD',
            type:    'error',
          }
        });
      }
    },
  },
};
</script>
<template>
  <div class="install-crd">
    <button @click="installCrd">
      {{ t('observability.dashboard.installcrd') }}
    </button>
  </div>
</template>
<style lang="scss" scoped>
</style>
