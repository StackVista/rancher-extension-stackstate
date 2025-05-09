<script>
import { mapGetters } from 'vuex';
import { Banner } from '@components/Banner';
import { createObservabilityRepoIfNotPresent } from '../../modules/suseObservability';
import { OBSERVABILITY_CRD } from '../../types/types';
import { ROLE_TEMPLATES } from '../../types/rbac_types';
import { handleGrowl } from '../../utils/growl';

export default {
  computed: {
    ...mapGetters(['currentCluster']),
    missingCrd() {
      return this.$store.getters['observability/isCrdMissing'];
    },
    repoPresent() {
      return this.$store.getters['observability/isRepoPresent'];
    },
    roleTemplates() {
      return this.$store.getters['observability/roleTemplates'];
    }
  },
  components: { Banner },
  methods:    {
    async install() {
      await this.installRepo();
      await this.installCrd();
      await this.installRoleTemplates();
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
        await this.$store.dispatch('management/request', {
          url:    '/v1/apiextensions.k8s.io.customresourcedefinitions',
          method: 'POST',
          data:   OBSERVABILITY_CRD,
        });

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

    async installRoleTemplates() {
      try {
        const missingTemplates = new Set(ROLE_TEMPLATES.keys().filter(roleTemplateName => !this.roleTemplates.has(roleTemplateName)));

        for (const roleTemplateName of missingTemplates) {
          const rT = await this.$store.dispatch('management/create', ROLE_TEMPLATES.get(roleTemplateName));

          await rT.save({ url: 'apis/management.cattle.io/v3/roletemplates' });
          await this.$store.dispatch('observability/setRoleTemplate', roleTemplateName);
        }
      } catch (err) {
        handleGrowl(this.$store, {
          message: `${ this.t('observability.errorMsg.failedRoleTemplate') } ${
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
  <div class="install-crd-main-container">
    <div class="row">
      <div class="col span-12">
        <Banner class="mt-20 mb-40" color="warning">
          <div class="install-crd">
            <span class="mb-20">{{
              t("observability.dashboard.error.crdmissing")
            }}</span>
            <button class="btn role-primary" @click="install">
              {{ t("observability.dashboard.installcrd") }}
            </button>
          </div>
        </Banner>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.install-crd-main-container {
  display: flex;
  justify-content: center;
  align-items: center;

  .install-crd {
    padding: 15px 30px;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
}
</style>
