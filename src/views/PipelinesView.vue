<template>
  <v-card
    class="mx-auto mt-8"
    flat
    :style="{ background: $vuetify.theme.themes[theme].background }"
  >
    <v-row>
      <v-col
        v-for="project in sorted_group_data"
        :key="project.id"
        cols="12"
        sm="12"
        md="12"
        lg="12"
        xl="6"
      >
        <pipelines-datatable :project_data="project"></pipelines-datatable>
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
import PipelinesDatatable from "../components/PipelinesDatatable.vue";

export default {
  components: {
    "pipelines-datatable": PipelinesDatatable
  },
  props: {
    group_data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {};
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    },
    sorted_group_data() {
      const new_array = this.group_data?.projects || [];
      // sort by project id to keep the same order
      return new_array.sort((a, b) => {
        if (a.id < b.id) return -1;
      });
    }
  },
  mounted() {},
  methods: {}
};
</script>
