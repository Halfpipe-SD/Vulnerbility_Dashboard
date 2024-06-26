import Vue from "vue";
import VueRouter from "vue-router";
import HomeView from "../views/HomeView.vue";
import PipelinesView from "../views/PipelinesView.vue";
import DashboardView from "../views/DashboardView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/home",
    name: "home",
    component: HomeView,
    meta: {
      title: "Vulnerability Dashboard"
    }
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardView,
    meta: {
      title: "Dashboard - Vulnerability Dashboard"
    }
  },
  {
    path: "/pipelines",
    name: "pipelines",
    component: PipelinesView,
    meta: {
      title: "Pipelines - Vulnerability Dashboard"
    }
  },
  // fallback route
  {
    path: "*",
    redirect: "/home"
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.NODE_ENV === "production" ? "/dashboard" : "/",
  routes
});

router.afterEach((to, from) => {
  // set page title
  Vue.nextTick(() => {
    document.title = to.meta.title || "Vulnerability Dashboard";
  });

  // print route change to console if in development mode
  if (process.env.NODE_ENV === "development")
    console.log(`⚡ Routed from ${from.name} to ${to.name}`);
});

export default router;
