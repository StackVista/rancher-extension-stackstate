<script>
import { HEALTH_STATE_TYPES } from "../../types/types";

export default {
  name: "HealthState",
  props: {
    health: { type: String, default: null },
    color: { type: String, default: null },
  },

  computed: {
    badgeColor() {
      if (this.color) {
        return this.color;
      }

      switch (this.health) {
        case HEALTH_STATE_TYPES.CLEAR:
          return "green";
        case HEALTH_STATE_TYPES.DEVIATING:
          return "orange";
        case HEALTH_STATE_TYPES.CRITICAL:
          return "red";
        case HEALTH_STATE_TYPES.UNKNOWN:
        case HEALTH_STATE_TYPES.UNCONFIGURED:
          return "grey";
        default:
          return "skeleton";
      }
    },
  },
};
</script>
<template>
  <span :class="`healthstate healthstate-${badgeColor}`">
    {{ health ?? "LOADING" }}
  </span>
</template>

<style lang="scss" scoped>
.healthstate-green {
  color: rgb(43, 158, 64);
}

.healthstate-orange {
  color: rgb(255, 138, 30);
}

.healthstate-red {
  color: rgb(235, 87, 87);
}

.healthstate-grey {
  color: rgb(135, 142, 152);
}

.healthstate-skeleton {
  cursor: wait;
  color: rgb(217, 217, 217);
  background-color: transparent;
}

.healthstate {
  display: inline-block;
  border-width: 1px;
  border-style: solid;
  border-radius: 20px;
  padding: 2px 10px;
  height: 21px;
  line-height: 16px;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.3px;
  font-weight: 500;
}
</style>
