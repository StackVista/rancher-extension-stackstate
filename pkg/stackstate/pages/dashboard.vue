<script>
import Loading from '@shell/components/Loading';
import ConfigurationView from '../components/Dashboard/ConfigurationView';
import InstallCrdView from '../components/Dashboard/InstallCrdView';

export default {
  name:       'ObservabilityDashboard',
  components: {
    Loading, ConfigurationView, InstallCrdView
  },

  data() {
    return {
      loading: false,
      editing: false,
    };
  },
  computed: {
    stackStateURL() {
      return this.$store.getters['observability/apiURL'];
    },

    isConfigured() {
      return this.$store.getters['observability/hasCredentials'];
    },
    isCrdMissing() {
      return this.$store.getters['observability/isCrdMissing'];
    },
  },
};
</script>

<template>
  <div class="dashboard">
    <div class="banner">
      <div>
        <img src="../rancher-observability.svg" alt="StackState logo" />
      </div>
      <div>
        <h1>{{ t('observability.name') }}</h1>
      </div>
      <div>{{ t('observability.dashboard.description') }}</div>
    </div>
    <Loading v-if="loading" />
    <div v-else-if="isCrdMissing">
      <div><span>{{ t('observability.dashboard.error.crdmissing') }}</span></div>
      <InstallCrdView />
    </div>
    <div v-else-if="!isConfigured">
      <div><span>{{ t('observability.dashboard.error.notconfigured') }}</span></div>
      <ConfigurationView mode="create" />
    </div>
    <div v-else>
      <div style="text-align: center;">
        {{ t('observability.dashboard.connected') }}
        <a :href="`https://${stackStateURL}/`">
          {{ stackStateURL }}</a>.
      </div>
      <div style="padding-top: 15px;">
        <ConfigurationView v-if="editing" mode="editing" />
        <button @click="editing = !editing">
          {{ editing ? 'Cancel' : 'Edit' }}
        </button>
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
