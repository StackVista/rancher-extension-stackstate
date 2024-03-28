<script>
import Loading from '@shell/components/Loading';
import TriggeredMonitors from '../components/TriggeredMonitors.vue';

export default {
  name:       'StackStateDashboard',
  components: { Loading },

  data() {
    return {
      stackStateClusters:  [],
      loading:             false,
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
        <img src="../sts-color.svg" alt="StackState logo" />
      </div>
      <div>
        <h1>StackState</h1>
      </div>
      <div>Welcome to StackState!</div>
      <div>Using StackState, you can monitor the health of your Kubernetes clusters.</div>
    </div>
    <div v-if="!isConfigured">
      <p>
        StackState is not configured. Please configure StackState in the
        <router-link to="/management/stackstate">
          management
        </router-link> page.
      </p>
    </div>
    <Loading v-else-if="loading" />
    <div v-else>
      <div>
        Rancher is connected to StackState at
        <a :href="`https://${stackStateURL}/`">
          {{ stackStateURL }}</a>.
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
