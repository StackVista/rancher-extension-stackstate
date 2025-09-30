<script>
import { LabeledInput } from "@components/Form/LabeledInput";
import AsyncButton from "@shell/components/AsyncButton";
import { Banner } from "@components/Banner";
import {
  checkConnection,
  ConnectionStatus,
} from "../../modules/suseObservability";
import {
  findNodeDrivers,
  loadSuseObservabilitySettings,
  saveSuseObservabilitySettings,
} from "../../modules/rancher";
import { STACKSTATEMACHINES_CRD } from "../../types/types";
import { logger } from "../../utils/logger";
import { handleGrowl } from "../../utils/growl";

export default {
  components: {
    LabeledInput,
    AsyncButton,
    Banner,
  },
  props: { mode: { type: String, default: "edit" } },
  async fetch() {
    await this.fetchFormValues();
    try {
      this.nodeDrivers = await findNodeDrivers(this.$store);
    } catch (e) {
      logger.log(
        `ERROR: Unable to determine presence of SUSE Observability NodeDrivers ${e}`,
      );
    }
  },
  data: () => ({
    suseObservabilityURL: "",
    suseObservabilityServiceToken: "",
    showSuccessfulSave: false,
    showEditInterface: false,
    urlError: false,
    nodeDrivers: [],
    migratedSettings: false,
  }),
  watch: {
    suseObservabilityURL(neu) {
      if (
        neu?.length &&
        !neu.startsWith("http://") &&
        !neu.startsWith("https://")
      ) {
        this.urlError = true;
      } else {
        this.urlError = false;
      }
    },
  },
  computed: {
    isCreateMode() {
      return this.mode === "create";
    },
  },
  methods: {
    async fetchFormValues() {
      const settings = await loadSuseObservabilitySettings(this.$store);

      if (settings) {
        this.suseObservabilityURL = settings.url;
        this.suseObservabilityServiceToken = settings.serviceToken;
        this.migratedSettings = settings.migrated;
      }
    },

    async cancel() {
      this.showEditInterface = false;

      // reset the form values when the user cancels the edit
      await this.fetchFormValues();
    },

    async save(btnCb) {
      const conn = await checkConnection(this.$store, {
        apiURL: this.suseObservabilityURL,
        serviceToken: this.suseObservabilityServiceToken,
      });

      switch (conn) {
        case ConnectionStatus.InvalidToken:
          handleGrowl(this.$store, {
            message: this.t("observability.errorMsg.connectionFailed"),
            type: "error",
          });
          btnCb(false);
          return;
        case ConnectionStatus.CrossOriginError:
          handleGrowl(this.$store, {
            message: this.t("observability.errorMsg.connectionError"),
            type: "error",
          });
          btnCb(false);
          return;
        default:
        // pass
      }

      try {
        await saveSuseObservabilitySettings(this.$store, {
          url: this.suseObservabilityURL,
          serviceToken: this.suseObservabilityServiceToken,
        });

        await this.$store.dispatch("observability/setConnectionInfo", {
          apiURL: this.suseObservabilityURL,
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
          message: this.t("observability.errorMsg.failedSave"),
          type: "error",
        });
        btnCb(false);
      }
    },
    async upgrade(btnCb) {
      try {
        if (this.nodeDrivers.length > 0) {
          await this.$store.dispatch("management/request", {
            url: "/v1/apiextensions.k8s.io.customresourcedefinitions",
            method: "POST",
            data: STACKSTATEMACHINES_CRD,
          });
          await Promise.all(
            this.nodeDrivers.map(async (driver) => {
              await driver.remove();
            }),
          );
          await this.$store.dispatch("management/request", {
            url: "/v1/apiextensions.k8s.io.customresourcedefinitions/stackstatemachines.rke-machine.cattle.io",
            method: "DELETE",
          });
          this.nodeDrivers = [];
        }

        if (this.migratedSettings) {
          await saveSuseObservabilitySettings(this.$store, {
            url: this.suseObservabilityURL,
            serviceToken: this.suseObservabilityServiceToken,
          });
          this.migratedSettings = false;
        }

        btnCb(true);
      } catch (err) {
        handleGrowl(this.$store, {
          message: this.t("observability.errorMsg.failedUpgrade"),
          type: "error",
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
            <a :href="`${suseObservabilityURL}/`">{{
              suseObservabilityURL || "&nbsp;"
            }}</a>
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
            v-model:value="suseObservabilityURL"
            :label="t('observability.configuration.url')"
            class="url-input"
            :class="{ error: urlError }"
            required
          />
          <div class="pt-10 pb-10">
            <p v-show="urlError" class="url-error mb-10">
              {{ t("observability.configuration.urlError") }}
            </p>
          </div>
          <LabeledInput
            v-model:value="suseObservabilityServiceToken"
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

        <Banner
          v-if="nodeDrivers.length > 0 || migratedSettings"
          class="connected-banner mt-50"
          color="warning"
        >
          <div class="banner-info row">
            <div class="col span-9 mr-10">
              <p>{{ t("observability.dashboard.upgrade") }}</p>
            </div>
            <div class="col span-3">
              <AsyncButton
                @click="upgrade"
                actionColor="role-tertiary"
                :action-label="t('observability.configuration.upgrade')"
                :waiting-label="
                  t('observability.configuration.upgradeProgress')
                "
                :success-label="t('observability.configuration.upgradeSuccess')"
                :error-label="t('observability.configuration.upgradeFailed')"
              />
            </div>
          </div>
        </Banner>
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
