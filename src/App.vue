<template>
  <v-app :style="{ background: $vuetify.theme.themes[theme].background }">
    <!-- App Bar with tabs -->
    <v-app-bar app>
      <v-tabs centered class="ml-n9">
        <v-tab :to="{ name: 'home' }">Home</v-tab>
        <v-tab :to="{ name: 'dashboard' }">Dashboard</v-tab>
        <v-tab :to="{ name: 'pipelines' }">Pipelines</v-tab>
      </v-tabs>
      <v-spacer></v-spacer>
      <v-icon @click="dark_mode = !dark_mode">
        {{ dark_mode ? "mdi-brightness-4" : "mdi-brightness-5" }}
      </v-icon>
    </v-app-bar>

    <!-- Website body -->
    <v-main>
      <v-container>
        <!-- Every route is injected here -->
        <router-view :group_data="group" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { get_group_data } from "./modules/gitlab";

export default {
  data() {
    return {
      group: null,
      dark_mode: this.$vuetify.theme.dark
    };
  },
  computed: {
    theme() {
      return this.$vuetify.theme.dark ? "dark" : "light";
    }
  },
  watch: {
    dark_mode() {
      this.$vuetify.theme.dark = this.dark_mode;
    }
  },
  mounted() {
    this.get_group_data_from_module();
  },
  methods: {
    get_group_data_from_module() {
      get_group_data()
        .then((response) => {
          this.group = response;
        })
        .catch((error) => {
          console.log({ error }, { response: error.response });
        });
    }
  }
};
</script>
