<script>
import { LabeledInput } from '@components/Form/LabeledInput';
import AsyncButton from '@shell/components/AsyncButton';
import { checkConnection } from '../../modules/stackstate';
import { handleGrowl } from '../../utils/growl';
import { OBSERVABILITY_CONFIGURATION_TYPE } from '../../models/observability.rancher.io.configuration';

export default {
  components: { LabeledInput, AsyncButton },
  props:      { mode: { type: String, default: 'edit' } },
  data:       () => ({
    stackStateURL:          '',
    stackStateServiceToken: '',
  }),
  methods: {
    async observabilityConfig() {
      const configs = await this.$store.dispatch('management/findAll', { type: OBSERVABILITY_CONFIGURATION_TYPE });

      if (configs) {
        for (const config of configs) {
          if (config.metadata.name !== 'stackstate') {
            continue;
          }

          return config;
        }
      }

      return null;
    },

    async save(btnCb) {
      const conn = await checkConnection(this.$store, { apiURL: this.stackStateURL, serviceToken: this.stackStateServiceToken });

      if (!conn) {
        handleGrowl(this.$store, {
          error: {
            message: 'Connection to StackState failed',
            type:    'error',
          }
        });

        btnCb(false);

        return;
      }

      let newConfig;

      if (this.mode === 'create') {
        const config = {
          metadata:   { name: `stackstate`, namespace: 'default' },
          spec:     {},
          type:     OBSERVABILITY_CONFIGURATION_TYPE,
        };

        newConfig = await this.$store.dispatch('management/create', config);
      } else {
        newConfig = await this.observabilityConfig();
      }

      newConfig.spec.url = this.stackStateURL;
      newConfig.spec.serviceToken = this.stackStateServiceToken;
      try {
        await newConfig.save();

        await this.$store.dispatch('observability/setConnectionInfo', {
          apiURL:       this.stackStateURL,
          serviceToken: this.stackStateServiceToken,
        });
        btnCb(true);
      } catch (err) {
        handleGrowl(this.$store, {
          error: {
            message: 'Failed to save configuration',
            type:    'error',
          }
        });
        btnCb(false);
      }
    },
  },
  async fetch() {
    const cfg = await this.observabilityConfig();

    if (cfg) {
      this.stackStateURL = cfg.spec.url;
      this.stackStateServiceToken = cfg.spec.serviceToken;
    }
  },
};
</script>
<template>
  <div>
    <div>
      <LabeledInput v-model="stackStateURL" label="StackState URL" required />
    </div>
    <div>
      <LabeledInput v-model="stackStateServiceToken" type="password" label="StackState Service Token" required />
    </div>
    <div>
      <AsyncButton @click="save">
        Save
      </AsyncButton>
    </div>
  </div>
</template>
<style lang="scss" scoped>
</style>
