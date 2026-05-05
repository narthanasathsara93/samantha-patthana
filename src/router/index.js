import { createRouter, createWebHistory } from 'vue-router';
import App from '../App.vue';
import { verses } from '../data/verses';

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
    path: '/',
    name: 'Home',
    component: App,
    meta: {
      verseId: verses[0]?.id,
      title: 'සමන්ත පට්ඨාන වන්දනා',
    },
  },
  ...verseRoutes,
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Watch route changes and update the verse
router.beforeEach((to, from, next) => {
  // Set page title for SEO
  document.title = `${to.meta.title || 'සමන්ත පට්ඨාන වන්දනා'} - Samantha Patthana`;
  next();
});

export default router;
