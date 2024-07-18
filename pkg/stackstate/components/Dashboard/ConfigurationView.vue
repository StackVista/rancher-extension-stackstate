<script>
import { LabeledInput } from "@components/Form/LabeledInput";
import AsyncButton from "@shell/components/AsyncButton";
import { Banner } from "@components/Banner";
import { checkConnection } from "../../modules/stackstate";
import { handleGrowl } from "../../utils/growl";
import { OBSERVABILITY_CONFIGURATION_TYPE } from "../../types/types";

export default {
  components: {
    LabeledInput,
    AsyncButton,
    Banner,
  },
  props: { mode: { type: String, default: "edit" } },
  async fetch() {
    const cfg = await this.observabilityConfig();

    if (cfg) {
      this.stackStateURL = cfg.spec.url;
      this.stackStateServiceToken = cfg.spec.serviceToken;
    }
  },
  data: () => ({
    stackStateURL: "",
    stackStateServiceToken: "",
    showSuccessfulSave: false,
    showEditInterface: false,
  }),
  computed: {
    isCreateMode() {
      return this.mode === "create";
    },
  },
  methods: {
    async observabilityConfig() {
      const configs = await this.$store.dispatch("management/findAll", {
        type: OBSERVABILITY_CONFIGURATION_TYPE,
      });

      if (configs) {
        for (const config of configs) {
          if (config.metadata.name !== "stackstate") {
            continue;
          }

          return config;
        }
      }

      return null;
    },

    async save(btnCb) {
      const conn = await checkConnection(this.$store, {
        apiURL: this.stackStateURL,
        serviceToken: this.stackStateServiceToken,
      });

      if (!conn) {
        handleGrowl(this.$store, {
          error: {
            message: this.t("observability.errorMsg.connectionFailed"),
            type: "error",
          },
        });

        btnCb(false);

        return;
      }

      let newConfig;

      if (this.isCreateMode) {
        const config = {
          metadata: { name: `stackstate`, namespace: "default" },
          spec: {},
          type: OBSERVABILITY_CONFIGURATION_TYPE,
        };

        newConfig = await this.$store.dispatch("management/create", config);
      } else {
        newConfig = await this.observabilityConfig();
      }

      newConfig.spec.url = this.stackStateURL;
      newConfig.spec.serviceToken = this.stackStateServiceToken;

      try {
        await newConfig.save();

        await this.$store.dispatch("observability/setConnectionInfo", {
          apiURL: this.stackStateURL,
          serviceToken: this.stackStateServiceToken,
        });

        this.showEditInterface = false;
        this.showSuccessfulSave = true;

        setTimeout(() => {
          this.showSuccessfulSave = false;
        }, 2000);
        btnCb(true);
      } catch (err) {
        handleGrowl(this.$store, {
          error: {
            message: this.t("observability.errorMsg.failedSave"),
            type: "error",
          },
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
            <a :href="`https://${stackStateURL}/`"> {{ stackStateURL }}</a>
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
            v-model="stackStateURL"
            class="mb-20"
            :label="t('observability.configuration.url')"
            required
          />
          <LabeledInput
            v-model="stackStateServiceToken"
            class="mb-20"
            type="password"
            :label="t('observability.configuration.serviceToken')"
            required
          />
          <div class="configuration-actions">
            <div v-if="!showEditInterface"></div>
            <button
              v-if="showEditInterface"
              class="btn role-secondary"
              @click="showEditInterface = !showEditInterface"
            >
              {{ t("observability.dashboard.cancelEditConfig") }}
            </button>
            <AsyncButton @click="save">
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
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .configuration-actions {
    display: flex;
    justify-content: space-between;
  }
}
</style>
