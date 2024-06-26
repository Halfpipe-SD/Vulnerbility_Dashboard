<template>
  <div>
    <v-card>
      <!-- Error message -->
      <v-alert v-if="error" type="error" transition="scale-transition">
        {{ error }}
      </v-alert>
      <!-- Card header -->
      <v-card-title>
        {{ title }}
        <div class="pl-2">
          <v-btn icon color="primary" @click="get_pipeline_data_from_module">
            <v-icon>mdi-reload</v-icon>
          </v-btn>
        </div>
        <v-spacer></v-spacer>
        <v-btn color="primary" outlined @click="open_project" small>
          <v-icon left>mdi-gitlab</v-icon>
          View Project
        </v-btn>
      </v-card-title>
      <!-- Subtitle -->
      <v-card-subtitle>{{ subtitle }}</v-card-subtitle>
      <!-- Card body -->
      <v-card-text>
        <v-data-table
          v-model="model"
          :headers="headers"
          :items="items"
          :items-per-page="7"
          :loading="loading"
          @click:row="rowClicked"
          :footer-props="{
            showFirstLastPage: true,
            itemsPerPageOptions: []
          }"
          min-width="auto"
          single-select
          class="elevation-0 row-pointer fluid"
        >
          <!-- Transform links -->
          <template v-slot:[`item.web_url`]="{ item }">
            <v-btn
              :href="item.web_url"
              target="_blank"
              color="primary"
              outlined
              small
            >
              <v-icon left>mdi-rocket-launch-outline</v-icon>
              Open
            </v-btn>
          </template>
          <!-- Transform status -->
          <template v-slot:[`item.status`]="{ item }">
            <v-chip outlined :color="get_pipeline_color(item.status)">{{
              item.status
            }}</v-chip>
          </template>
          <!-- Transform updated_at -->
          <template v-slot:[`item.updated_at`]="{ item }">
            <v-tooltip top>
              <template v-slot:activator="{ on }">
                <span v-on="on">{{ item.updated_at_fromnow }}</span>
              </template>
              <span>{{ item.updated_at }}</span>
            </v-tooltip>
          </template>
          <!-- Initiated by user -->
          <template v-slot:[`item.initiated`]="{ item }">
            <div>
              <v-avatar size="24">
                <img :src="item.user.avatar_url" />
              </v-avatar>
              <span class="ml-2">{{ item.user.name.split(", ")[1] }}</span>
            </div>
          </template>
          <!-- Commit-->
          <template v-slot:[`item.commit`]="{ item }">
            <a :href="get_commit_url(item.sha)" target="_blank">{{
              item.sha.substring(0, 7)
            }}</a>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>

    <!-- Add the v-dialog component here -->
    <PipelineDetailsDialog ref="dialog" :project="project_data" />
  </div>
</template>

<script>
import moment from "moment";
import PipelineDetailsDialog from "./PipelineDetailsDialog.vue";
import { get_pipelines, get_pipeline_details } from "../modules/gitlab";

export default {
  components: {
    PipelineDetailsDialog
  },
  props: {
    project_data: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selectedPipeline: {},
      subtitle: "Click a row to view the pipeline jobs",
      model: [],
      items: [],
      pagnation: {
        rowsPerPage: 7,
        page: 1
      },
      headers: [
        { text: "ID", value: "id" },
        { text: "Status", value: "status" },
        { text: "Commit", value: "commit", sortable: false },
        { text: "Initiated by", value: "initiated", sortable: false },
        // Chose updated_at instead of created_at because when updating
        // a pipeline, the created_at date does not change
        { text: "Started", value: "updated_at", sortable: false },
        { text: "Duration", value: "duration", sortable: false },
        { text: "Pipeline Link", value: "web_url", sortable: false }
      ],
      loading: false,
      error: ""
    };
  },
  computed: {
    title() {
      return `${this.project_data.name} Pipelines`;
    }
  },
  mounted() {
    this.get_pipeline_data_from_module();
  },
  methods: {
    get_pipeline_data_from_module() {
      this.loading = true;
      get_pipelines(
        this.project_data.id,
        this.pagnation.page,
        this.pagnation.rowsPerPage
      )
        .then((pipelines) => {
          const promises = pipelines.map((pipeline) => {
            return get_pipeline_details(this.project_data.id, pipeline.id);
          });
          return this.process_pipeline_details(promises);
        })
        .then((items) => {
          this.items = items;
        })
        .catch((error) => {
          this.error = "Error fetching data";
          console.log(error);
        })
        .finally(() => {
          this.loading = false;
        });
    },
    async process_pipeline_details(promises) {
      return Promise.all(promises).then((responses) => {
        const items = responses.map((response) => {
          return this.format_pipeline_data(response);
        });
        return items.sort((a, b) => b.id - a.id);
      });
    },
    format_pipeline_data(pipeline) {
      // format dates
      pipeline.created_at = moment(pipeline.created_at).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      pipeline.created_at_fromnow = moment(pipeline.created_at).fromNow();
      pipeline.updated_at = moment(pipeline.updated_at).format(
        "YYYY-MM-DD HH:mm:ss"
      );
      pipeline.updated_at_fromnow = moment(pipeline.updated_at).fromNow();
      // format duration
      // pipeline.duration = moment
      //   .duration(pipeline.duration, "seconds")
      //
      // format duration
      const duration = moment.duration(pipeline.duration, "seconds");
      const m = moment.utc(duration.asMilliseconds());

      if (duration.asHours() >= 1) pipeline.duration = duration.humanize();
      else pipeline.duration = m.format("mm:ss") + " min";

      return pipeline;
    },
    get_pipeline_color(status) {
      if (status === "success") return "success";
      else if (status === "failed") return "error";
      else if (status === "running") return "light-blue";
      else return "grey";
    },
    open_project() {
      window.open(this.project_data.http_url_to_repo, "_blank");
    },
    rowClicked(item) {
      this.selectedPipeline = item;
      this.$refs.dialog.openDialog(this.selectedPipeline);
    },
    get_commit_url(sha) {
      return `${this.project_data.web_url}/-/commit/${sha}`;
    }
  }
};
</script>

<style lang="css" scoped>
.row-pointer >>> tbody tr :hover {
  cursor: pointer;
}
</style>
