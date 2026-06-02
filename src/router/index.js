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
  {
    path: "/practice",
    name: "PracticeMode",
    component: () => import("@/components/practice/PracticeHome.vue"),
    meta: {
      title: "Practice Mode",
    },
  },
  {
    path: "/settings",
    name: "Settings",
    component: () => import("@/components/Settings.vue"),
    meta: {
      title: "Settings",
    },
  },
  {
    path: "/contact",
    name: "ContactUs",
    component: () => import("@/components/ContactUs.vue"),
    meta: {
      title: "Contact Us",
    },
  },
  {
    path: "/resources",
    name: "Resources",
    component: App,
    meta: {
      title: "Resources",
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
