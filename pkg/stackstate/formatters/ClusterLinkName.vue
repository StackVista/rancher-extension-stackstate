<script>
import { NAME as EXPLORER } from '@shell/config/product/explorer';

export default {
  name:  'ClusterLinkName',
  props: {
    value: {
      type:     String,
      required: true,
    },
    row: {
      type:     Object,
      required: true
    },

    product: {
      type:    String,
      default: EXPLORER,
    }
  },

  computed: {
    url() {
      const name = `c-cluster-product-resource${ this.row.metadata.namespace ? '-namespace' : '' }-id`;

      const params = {
        cluster:   this.row.cluster.id,
        resource:  this.row.type,
        namespace: this.row.metadata.namespace,
        id:        this.row.name,
        product:   this.product,
      };

      return { name, params };
    }
  }
};
</script>

<template>
  <span v-if="value">
    <nuxt-link :to="url">
      {{ value }}
    </nuxt-link>
  </span>
</template>
