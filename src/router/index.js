import { createRouter, createWebHistory } from "vue-router";
import App from "../App.vue";
import { verses } from "../data/verses";

const appTitle = "Samantha Patthana";

// Create route array from verses
const verseRoutes = verses.map((verse) => ({
  path: `/${verse.englishName}`,
  name: verse.englishName,
  component: App,
  meta: {
    verseId: verse.id,
    title: verse.title,
  },
}));

const routes = [
  {
    path: "/",
    name: "Home",
    component: () => import("@/components/Home.vue"),
    meta: {
      title: "Home",
    },
  },
  ...verseRoutes,
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// Watch route changes and update the verse
router.beforeEach((to, from, next) => {
  // Set page title for SEO
  document.title = `${to.meta.title || appTitle} - ${appTitle}`;
  next();
});

export default router;
