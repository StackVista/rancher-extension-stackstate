<script>
import Loading from '@shell/components/Loading';
import CreateEditView from '@shell/mixins/create-edit-view';
import { _CREATE } from '@shell/config/query-params';
import { LabeledInput } from '@rancher/components';
import { DEFAULT_STS_SETTINGS } from '../models/stackstate.io.configuration';

export default {
  name:       'StackStateDashboard',
  components: { Loading, LabeledInput },
  mixins:     [CreateEditView],
  data() {
    return { loading: false };
  },
  computed: {
    stackStateURL() {
      return this.$store.getters['stackstate/apiURL'];
    },

    stackStateToken() {
      return this.$store.getters['stackstate/apiToken'];
    },

    isConfigured() {
      return this.stackStateURL && this.stackStateToken;
    },
  },
  methods: {
    async finish(event) {
      try {
        await this.save(event);
      } catch (e) {
        this.errors.push(e);
      }
    }
  },

  async fetch() {
    this.loading = true;
    console.log('fetching settings');
    const settings = await this.$store.dispatch('rancher/find', { type: 'stackstate.io.configuration', id: 'rancher-stackstate' });

    console.log('settings', settings);
    if (settings) {
      this.value = settings;
    } else {
      console.log('creating new settings');
      this.value = await this.$store.dispatch('rancher/create', merge({ metadata: { name: 'rancher-stackstate' } }, structuredClone(DEFAULT_STS_SETTINGS)));
    }

    this.loading = false;
  }
};
</script>

<template>
  <Loading v-if="loading" />
  <div v-else class="dashboard">
    <div class="banner">
      <div>
        <img src="../sts-color.svg" alt="StackState logo" />
      </div>
      <div>
        <h1>StackState Extension Configuration</h1>
      </div>
      <div>
        <LabeledInput
          v-model="value.spec.stackStateURL"
          label="StackState URL"
          placeholder="https://stackstate.example.com"
          required
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
          .banner {
          display: block;
          align-content: center;
          justify-content: center;
          text-align: center;
          margin-bottom: 2rem;
          }
          .banner img {
          height: 100px;
          width: auto;
          }
          .cluster-header {
          align-items: center;
          background: var(--header-bg);
          border-bottom: var(--header-border-size) solid var(--header-border);
          display: flex;
          height: var(--header-height);
          position: sticky;
          top: 0;
          }

          // HACK(cjshearer): this shouldn't be necessary, since the position:sticky in
          // the app-launcher page's header should make the header appear above its
          // siblings, but the AppLauncherCard's ButtonDropDown element seems to have the
          // wrong z-index by default, so we just force it to be below the header. See the
          // following slack conversation for previous discussion on this:
          // https://krumware.slack.com/archives/C053W936JAZ/p1691418985551309?thread_ts=1691099848.592889&cid=C053W936JAZ
          .hack-to-keep-header-above-app-launcher-card-dropdown-button {
          z-index: 1;
          }
          </style>
        </a>
      </div>
    </div>
  </div>
</template>
