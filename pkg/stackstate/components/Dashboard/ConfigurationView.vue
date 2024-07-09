<script>
import { LabeledInput } from '@components/Form/LabeledInput';
import AsyncButton from '@shell/components/AsyncButton';
import { checkConnection } from '../../modules/stackstate';
import { handleGrowl } from '../../utils/growl';
import { STACKSTATE_CONFIGURATION_TYPE } from '../../models/stackstate.io.configuration';

export default {
  components: { LabeledInput, AsyncButton },
  props:      { mode: { type: String, default: 'edit' } },
  data:       () => ({
    stackStateURL:          '',
    stackStateServiceToken: '',
  }),
  methods:    {
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
          type:     STACKSTATE_CONFIGURATION_TYPE,
        };

        newConfig = await this.$store.dispatch('management/create', config);
      } else {
        newConfig = await this.$store.dispatch('management/find', { type: STACKSTATE_CONFIGURATION_TYPE, id: 'stackstate' });
      }

      newConfig.spec.url = this.stackStateURL;
      newConfig.spec.serviceToken = this.stackStateServiceToken;
      try {
        await newConfig.save();

        await this.$store.dispatch('stackstate/setConnectionInfo', {
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
    const configs = await this.$store.dispatch('management/findAll', { type: STACKSTATE_CONFIGURATION_TYPE });

    if (configs) {
      for (const config of configs) {
        if (config.metadata.name !== 'stackstate') {
          continue;
        }
        this.stackStateURL = config.spec.url;
        this.stackStateServiceToken = config.spec.serviceToken;
        break;
      }
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
