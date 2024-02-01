<script>
export default {
  name: 'HealthState',
  props: {
    state: String
  },
};
</script>
<template>
  <span>
    <div :class="`healthstate-${state}`">
      <span>{{ state }}</span>
    </div>
  </span>
</template>

<style lang="scss" scoped>
.healthstate-CLEAR {
  color: rgb(43, 158, 64);
  border-color: rgb(43, 158, 64);
}

.healthstate-DEVIATING {
  color: rgb(255, 138, 30);
  border-color: rgb(255, 138, 30);
}

.healthstate-CRITICAL {
  border-color: rgb(235, 87, 87);
  color: rgb(235, 87, 87);
}

.healthstate-UNKNOWN {
  border-color: rgb(135, 142, 152);
  color: rgb(135, 142, 152);
}

.healthstate-DEVIATING,
.healthstate-CRITICAL,
.healthstate-UNKNOWN,
.healthstate-CLEAR {
  display: inline-block;
  border-width: 1px;
  border-style: solid;
  border-radius: 20px;
  padding: 0 12px;
  height: 21px;
  line-height: 19px;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.3px;
  font-weight: 500;
}
</style>
