<script>
export default {
  name:  'HealthState',
  props: {
    state: { type: String, default: 'UNKNOWN' },
    color: { type: String, default: null }
  },

  computed: {
    badgeColor() {
      if (this.color) {
        return this.color;
      } else {
        switch (this.state) {
        case 'CLEAR':
          return 'green';
        case 'DEVIATING':
          return 'orange';
        case 'CRITICAL':
          return 'red';
        case 'UNKNOWN':
        case 'NOT MONITORED':
          return 'grey';
        }
      }

      return this.state;
    },
  },
};
</script>
<template>
  <span>
    <div :class="`healthstate-${badgeColor}`">
      <span>{{ state }}</span>
    </div>
  </span>
</template>

<style lang="scss" scoped>
.healthstate-green {
  color: rgb(43, 158, 64);
  border-color: rgb(43, 158, 64);
}

.healthstate-orange {
  color: rgb(255, 138, 30);
  border-color: rgb(255, 138, 30);
}

.healthstate-red {
  border-color: rgb(235, 87, 87);
  color: rgb(235, 87, 87);
}

.healthstate-grey {
  border-color: rgb(135, 142, 152);
  color: rgb(135, 142, 152);
}

.healthstate-orange,
.healthstate-red,
.healthstate-grey,
.healthstate-green {
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
