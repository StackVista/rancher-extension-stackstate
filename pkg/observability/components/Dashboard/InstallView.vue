<script>
import { mapGetters } from 'vuex';
import { Banner } from '@components/Banner';
import { createObservabilityRepoIfNotPresent } from '../../modules/suseObservability';
import { OBSERVABILITY_CRD } from '../../types/types';
import { handleGrowl } from '../../utils/growl';
import { logger } from '../../utils/logger';

export default {
  computed: {
    ...mapGetters(['currentCluster']),
    missingCrd() {
      return this.$store.getters['observability/isCrdMissing'];
    },
    repoPresent() {
      return this.$store.getters['observability/isRepoPresent'];
    },
  },
  components: { Banner },
  methods:    {
    async install() {
      await this.installRepo();
      await this.installCrd();
    },

    async installRepo() {
      if (this.repoPresent) {
        return;
      }

      try {
        await createObservabilityRepoIfNotPresent(this.$store);

        await this.$store.dispatch('observability/setRepoPresent', true);
      } catch (err) {
        handleGrowl(this.$store, {
          message: `${ this.t('observability.errorMsg.failedRepo') } ${
            err.message ? `: ${ err.message }` : ''
          }`,
          type: 'error',
        });
      }
    },

    async installCrd() {
      if (!this.missingCrd) {
        return;
      }

      try {
        try {
          await this.$store.dispatch('management/request', {
            url:    '/v1/apiextensions.k8s.io.customresourcedefinitions',
            method: 'POST',
            data:   OBSERVABILITY_CRD,
          });
        } catch (err) {
          logger.log("Error creating CRD, attempting update");
          const currentCrd = await this.$store.dispatch('management/request', {
            url:    '/v1/apiextensions.k8s.io.customresourcedefinitions/configurations.observability.rancher.io',
            method: 'GET'
          });
          if (currentCrd) {
            OBSERVABILITY_CRD.metadata.resourceVersion = currentCrd.metadata.resourceVersion;
            await this.$store.dispatch('management/request', {
              url:    '/v1/apiextensions.k8s.io.customresourcedefinitions/configurations.observability.rancher.io',
              method: 'PUT',
              data:   OBSERVABILITY_CRD,
            });
          }
        }

        await this.$store.dispatch('observability/setMissingCrd', false);
      } catch (err) {
        handleGrowl(this.$store, {
          message: `${ this.t('observability.errorMsg.failedCrd') } ${
            err.message ? `: ${ err.message }` : ''
          }`,
          type: 'error',
        });
      }
    },
  },
};
</script>
<template>
  <div class="install-repo-main-container">
    <div class="row">
      <div class="col span-12">
        <Banner class="mt-20 mb-40" color="warning">
          <div class="install-repo">
            <span class="mb-20">{{
              t("observability.dashboard.error.repomissing")
            }}</span>
            <button class="btn role-primary" @click="install">
              {{ t("observability.dashboard.install") }}
            </button>
          </div>
        </Banner>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.install-repo-main-container {
  display: flex;
  justify-content: center;
  align-items: center;

  .install-repo {
    padding: 15px 30px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
