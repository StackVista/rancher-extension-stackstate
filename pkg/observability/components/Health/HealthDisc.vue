<script>
import { HEALTH_STATE_TYPES } from "../../types/types";

export default {
  name: "HealthDisc",
  props: { health: { type: String, default: HEALTH_STATE_TYPES.UNCONFIGURED } },
};
</script>
<template>
  <div :class="`healthdisc-${health}`" />
</template>
<style lang="scss" scoped>
.healthdisc-CLEAR {
  background-color: rgb(43, 158, 64);
}
.healthdisc-DEVIATING {
  background-color: rgb(255, 138, 30);
}
.healthdisc-CRITICAL {
  background-color: rgb(235, 87, 87);
}
.healthdisc-UNKNOWN {
  background-color: rgb(135, 142, 152);
}

.healthdisc-CLEAR,
.healthdisc-DEVIATING,
.healthdisc-CRITICAL,
.healthdisc-UNKNOWN {
  display: inline-block;
  box-sizing: border-box;
  border-radius: 9999px;
  width: 8px;
  height: 8px;
}
</style>
