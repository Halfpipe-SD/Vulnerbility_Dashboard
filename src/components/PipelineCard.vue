<template>
  <div>
    <!-- new card with additional info -->
    <v-card class="mx-auto mr-4 my-10">
      <!-- Header -->
      <v-card-title class="text-h4">
        Pipeline #{{ pipeline?.id }}
        <v-spacer></v-spacer>
        <v-chip
          class="ma-2"
          :color="get_pipeline_color(pipeline.status)"
          outlined
        >
          {{ pipeline.status }}
        </v-chip>
      </v-card-title>
      <!-- Body -->
      <v-card-text>
        <p></p>
        <v-list>
          <v-list-item class="text-h6"> Jobs: </v-list-item>
          <v-list-item v-for="(job, i) in jobs" :key="i">
            <v-chip
              outlined
              class="ma-2"
              :color="get_pipeline_color(job.status)"
            >
              {{ job.status }}
            </v-chip>
            <div class="text-body-1">{{ job.name }}</div>
          </v-list-item>
        </v-list>
      </v-card-text>
      <!-- Initiated Text -->
      <v-card-text class="text-h6 text-center">
        Initiated by:
        {{ jobs[0].user.name }}
      </v-card-text>
      <!-- Created and Updated -->
      <v-card-subtitle class="text-center">
        Created: {{ pipeline.created_at }} <br />Updated:
        {{ pipeline.updated_at }}
      </v-card-subtitle>
      <v-card-actions>
        <!-- Open pipeline -->
        <v-btn
          :href="pipeline.web_url"
          target="_blank"
          color="primary"
          class="white--text"
          block
          >Open Pipeline</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
export default {
  props: {
    jobs: {
      type: Array,
      default: () => {}
    },
    pipeline: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
  },
  computed: {},
  mounted() {},
  methods: {
    get_pipeline_color(status) {
      if (status === "success") return "success";
      else if (status === "failed") return "error";
      else if (status === "running") return "light-blue";
      else return "grey";
    }
  }
};
</script>
