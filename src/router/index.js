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

// Helper function to update meta tags
const updateMetaTags = (to) => {
  const title = to.meta.title || appTitle;
  const fullTitle = `${title} - ${appTitle}`;
  const verseId = to.meta.verseId;

  // Update document title
  document.title = fullTitle;

  // Update meta description based on route
  let description = "Explore Samantha Patthana (සමන්ත පට්ඨානය), the seventh book of Abhidhamma Pitaka. Read Pali verses with Sinhala translations and listen to audio recitations.";

  if (verseId && to.meta.title) {
    const sinhalaTitle = to.meta.title;
    description = `Read ${sinhalaTitle} from Samantha Patthana. Study the Pali verses with Sinhala meaning and listen to the audio recitation of this Abhidhamma scripture.`;
  } else if (to.path === "/") {
    description = "Welcome to Samantha Patthana - සමන්ත පට්ඨානය. Explore the 24 conditional relations (පච්චය) of Buddhist Abhidhamma philosophy with Pali verses, Sinhala translations, and audio recitations.";
  }

  // Update or create meta description
  let metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    metaDescription = document.createElement("meta");
    metaDescription.setAttribute("name", "description");
    document.head.appendChild(metaDescription);
  }
  metaDescription.setAttribute("content", description);

  // Update Open Graph title and description
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute("content", fullTitle);

  let ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) ogDescription.setAttribute("content", description);

  // Update Twitter title and description
  let twitterTitle = document.querySelector('meta[property="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute("content", fullTitle);

  let twitterDescription = document.querySelector('meta[property="twitter:description"]');
  if (twitterDescription) twitterDescription.setAttribute("content", description);

  // Update canonical URL
  let canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) {
    const canonicalUrl = `https://samantha-patthana.pages.dev${to.path}`;
    canonical.setAttribute("href", canonicalUrl);
  }
};

// Watch route changes and update the verse
router.beforeEach((to, from, next) => {
  // Update meta tags for SEO
  updateMetaTags(to);
  next();
});

export default router;
