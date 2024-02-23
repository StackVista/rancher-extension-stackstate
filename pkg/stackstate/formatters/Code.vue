<script>
export default {
  name:       'Code',
  props:      {
    value: {
      type:    String,
      default: ''
    },
  },
};
</script>

<template>
  <code v-if="value">{{ value }}</code>
</template>
