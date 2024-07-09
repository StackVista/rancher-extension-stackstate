<script>
import Loading from '@shell/components/Loading';
import ConfigurationView from '../components/Dashboard/ConfigurationView';

export default {
  name:       'StackStateDashboard',
  components: { Loading, ConfigurationView },

  data() {
    return {
      loading: false,
      editing: false,
    };
  },
  computed: {
    stackStateURL() {
      return this.$store.getters['stackstate/apiURL'];
    },

    isConfigured() {
      return this.$store.getters['stackstate/hasCredentials'];
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
        <h1>Rancher Prime Observability</h1>
      </div>
      <div>Welcome to Rancher Prime Observability powered by StackState by SUSE.</div>
      <div>Using StackState by SUSE, you can monitor the health of all clusters managed by Rancher and the workloads running on them.</div>
    </div>
    <Loading v-if="loading" />
    <div v-else-if="!isConfigured">
      <div><span>The connection details for StackState by SUSE have not been configured yet. Please enter them here to start using Rancher Prime Observability.</span></div>
      <ConfigurationView mode="create" />
    </div>
    <div v-else>
      <div style="text-align: center;">
        Rancher is connected to StackState at
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
