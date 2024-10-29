<script>
import { LabeledInput } from '@components/Form/LabeledInput';
import AsyncButton from '@shell/components/AsyncButton';
import { Banner } from '@components/Banner';
import { loadSuseObservabilitySettings, checkConnection, ensureObservabilityUrlWhitelisted } from '../../modules/suseObservability';
import { handleGrowl } from '../../utils/growl';
import { OBSERVABILITY_CONFIGURATION_TYPE } from '../../types/types';

export default {
  components: {
    LabeledInput,
    AsyncButton,
    Banner,
  },
  props: { mode: { type: String, default: 'edit' } },
  async fetch() {
    await this.fetchFormValues();
  },
  data: () => ({
    suseObservabilityURL:          '',
    suseObservabilityServiceToken: '',
    showSuccessfulSave:            false,
    showEditInterface:             false,
    urlError:                      false
  }),
  watch: {
    suseObservabilityURL(neu) {
      if (neu?.length && (neu.startsWith('http://') || neu.startsWith('https://'))) {
        this.urlError = true;
      } else {
        this.urlError = false;
      }
    },

  },
  computed: {
    isCreateMode() {
      return this.mode === 'create';
    },
  },
  methods: {
    async fetchFormValues() {
      const settings = await loadSuseObservabilitySettings(this.$store);

      if (settings) {
        this.suseObservabilityURL = settings.spec.url;
        this.suseObservabilityServiceToken = settings.spec.serviceToken;
      }
    },

    async cancel() {
      this.showEditInterface = false;

      // reset the form values when the user cancels the edit
      await this.fetchFormValues();
    },

    async save(btnCb) {
      const whitelisted = await ensureObservabilityUrlWhitelisted(this.$store, this.suseObservabilityURL);

      if (!whitelisted) {
        handleGrowl(this.$store, {
          message: this.t('observability.errorMsg.urlNotWhitelisted'),
          type:    'error',
        });

        btnCb(false);

        return;
      }

      const conn = await checkConnection(this.$store, {
        apiURL:       this.suseObservabilityURL,
        serviceToken: this.suseObservabilityServiceToken,
      });

      if (!conn) {
        handleGrowl(this.$store, {
          message: this.t('observability.errorMsg.connectionFailed'),
          type:    'error',
        });

        btnCb(false);

        return;
      }

      let newConfig;

      if (this.isCreateMode) {
        const config = {
          metadata: { name: `suse-observability`, namespace: 'default' },
          spec:     {},
          type:     OBSERVABILITY_CONFIGURATION_TYPE,
        };

        newConfig = await this.$store.dispatch('management/create', config);
      } else {
        newConfig = await loadSuseObservabilitySettings(this.$store);
      }

      newConfig.spec.url = this.suseObservabilityURL;
      newConfig.spec.serviceToken = this.suseObservabilityServiceToken;

      try {
        await newConfig.save();

        await this.$store.dispatch('observability/setConnectionInfo', {
          apiURL:       this.suseObservabilityURL,
          serviceToken: this.suseObservabilityServiceToken,
        });

        this.showEditInterface = false;
        this.showSuccessfulSave = true;

        setTimeout(() => {
          this.showSuccessfulSave = false;
        }, 2000);
        btnCb(true);
      } catch (err) {
        handleGrowl(this.$store, {
          message: this.t('observability.errorMsg.failedSave'),
          type:    'error',
        });
        btnCb(false);
      }
    },
  },
};
</script>
<template>
  <div class="configuration-view-main-container">
    <div class="row">
      <div
        class="col"
        :class="{ 'span-12': !isCreateMode, 'span-8': isCreateMode }"
      >
        <p v-if="isCreateMode" class="mt-20 mb-20">
          {{ t("observability.dashboard.error.notconfigured") }}
        </p>
        <Banner
          v-if="!isCreateMode"
          class="connected-banner mt-20 mb-40"
          color="info"
        >
          <div class="banner-info">
            <p>{{ t("observability.dashboard.connected") }}</p>
            <!-- reserve a line when the url is an empty string so UI won't jump on change -->
            <a :href="`https://${suseObservabilityURL}/`">{{ suseObservabilityURL || '&nbsp;' }}</a>
          </div>
        </Banner>

        <div
          v-if="!isCreateMode && !showEditInterface"
          class="edit-config-action-container"
        >
          <button
            class="btn role-primary edit-btn"
            @click="showEditInterface = !showEditInterface"
          >
            {{ t("observability.dashboard.editConfig") }}
          </button>
          <p v-show="showSuccessfulSave" class="mt-20">
            {{ t("observability.dashboard.saveSuccess") }}
          </p>
        </div>

        <div
          v-show="isCreateMode || (!isCreateMode && showEditInterface)"
          class="configuration-inputs"
        >
          <LabeledInput
            v-model="suseObservabilityURL"
            :label="t('observability.configuration.url')"
            class="url-input"
            :class="{'error': urlError }"
            required
          />
          <div class="pt-10 pb-10">
            <p
              v-show="urlError"
              class="url-error mb-10"
            >
              {{ t('observability.configuration.urlError') }}
            </p>
          </div>
          <LabeledInput
            v-model="suseObservabilityServiceToken"
            class="mb-20"
            type="password"
            :label="t('observability.configuration.serviceToken')"
            required
          />
          <div class="configuration-actions">
            <!-- don't delete this empty view as it's necessary to align to the right the controls -->
            <div v-if="!showEditInterface"></div>
            <button
              v-if="showEditInterface"
              class="btn role-secondary"
              @click="cancel"
            >
              {{ t("observability.dashboard.cancelEditConfig") }}
            </button>
            <AsyncButton :disabled="urlError" @click="save">
              {{ t("observability.configuration.save") }}
            </AsyncButton>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.configuration-view-main-container {
  display: flex;
  justify-content: center;
  align-items: center;

  .url-input.error::deep input {
    border-color: var(--error) !important;
  }

  .url-error {
    color: var(--error);
    font-size: 13px;
  }

  .row {
    justify-content: center;
  }

  .edit-config-action-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .banner-info {
    padding: 15px 30px;
    width: 100%;
    max-width: 480px;
  }

  .configuration-actions {
    display: flex;
    justify-content: space-between;
  }
}
</style>
