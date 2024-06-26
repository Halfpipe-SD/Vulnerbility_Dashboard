<template>
  <v-dialog v-model="dialog" max-height="800px" max-width="700px">
    <!-- new card with additional info -->
    <v-card :loading="loading">
      <!-- Header -->
      <v-card-title class="text-h5">
        {{ project.name }} Pipeline&nbsp;
        <a :href="pipeline.web_url">#{{ pipeline?.id }}</a>
        <v-spacer></v-spacer>
        <v-chip
          class="ma-1"
          :color="get_pipeline_color(pipeline.status)"
          outlined
        >
          {{ pipeline.status }}
        </v-chip>
      </v-card-title>
      <!-- Body -->
      <v-card-text>
        <v-list dense v-if="jobs.length != 0">
          <!-- first stage divider -->
          <v-list-item dense>
            <v-divider></v-divider>
            {{ jobs[0]?.stage }}
            <v-divider></v-divider>
          </v-list-item>
          <!-- jobs -->
          <div v-for="(job, i) in jobs" :key="i">
            <!-- stage divider -->
            <v-list-item v-if="i > 0 && job.stage !== jobs[i - 1].stage" dense>
              <v-divider></v-divider>
              {{ job.stage }}
              <v-divider></v-divider>
            </v-list-item>
            <!-- chip component -->
            <v-list-item dense v-if="jobs[i - 1]?.stage !== job?.stage">
              <v-chip
                outlined
                class="ma-2"
                link
                :href="job.web_url"
                target="_blank"
              >
                <v-avatar size="24">
                  <v-icon :color="get_pipeline_color(job.status)">
                    {{ get_icon_for_status(job.status) }}
                  </v-icon>
                </v-avatar>
                <span class="ml-2"
                  >{{ job.name }} ({{
                    get_job_duration_string(job.duration)
                  }})</span
                >
              </v-chip>
              <v-chip
                v-if="jobs[i + 1]?.stage == job?.stage"
                outlined
                class="ma-2"
                link
                :href="job.web_url"
                target="_blank"
              >
                <v-avatar size="24">
                  <v-icon :color="get_pipeline_color(jobs[i + 1].status)">
                    {{ get_icon_for_status(jobs[i + 1].status) }}
                  </v-icon>
                </v-avatar>
                <span class="ml-2"
                  >{{ jobs[i + 1].name }} ({{
                    get_job_duration_string(jobs[i + 1].duration)
                  }})</span
                >
              </v-chip>
            </v-list-item>
          </div>
        </v-list>
        <!-- Jobs not yet loaded -->
        <div v-else>
          <v-skeleton-loader
            v-for="n in 3"
            :key="n"
            v-bind="attrs"
            type="list-item"
            boilerplate
          ></v-skeleton-loader>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from "moment";
import { get_pipeline_jobs } from "../modules/gitlab";

export default {
  props: {
    project: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      dialog: false,
      pipeline: {},
      jobs: [],
      loading: true,
      attrs: {
        class: "mb-3",
        boilerplate: true,
        elevation: 1
      }
    };
  },
  methods: {
    openDialog(pipeline) {
      this.dialog = true;
      this.pipeline = pipeline;
      this.get_jobs_data();
    },
    closeDialog() {
      this.dialog = false;
      this.jobs = [];
    },
    get_jobs_data() {
      this.loading = true;
      get_pipeline_jobs(this.project.id, this.pipeline.id)
        .then((response) => {
          this.jobs = response.sort(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
        })
        .catch((error) => {
          console.error("Error fetching jobs:", error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    get_pipeline_color(status) {
      if (status === "success") return "success";
      else if (status === "failed") return "error";
      else if (status === "running") return "light-blue";
      else return "grey";
    },
    get_icon_for_status(status) {
      switch (status) {
        case "running":
          return "mdi-play-circle-outline";
        case "success":
          return "mdi-check-circle-outline";
        case "failed":
          return "mdi-alert-circle-outline";
        case "skipped":
        case "canceled":
          return "mdi-skip-next-circle-outline";
        default:
          return "mdi-circle-outline";
      }
    },
    get_job_duration_string(seconds) {
      const duration = moment.duration(seconds, "seconds");
      return (
        duration.minutes() +
        ":" +
        duration.seconds().toString().padStart(2, "0")
      );
    }
  }
};
</script>

<style></style>
