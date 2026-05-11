<template>
  <section class="resources-panel">
    <div class="resources-panel-header">භාවිතා කල මූලාශ්‍ර සහ සම්පත්</div>

    <div class="resources-panel-body">
      <a :href="youtubeUrlND" target="_blank" rel="noopener noreferrer">
        <img class="resource-icon" :src="getIcon(`icons/youtube.png`)" alt="" />
        පට්ඨාන ධර්මවන්දනාව - පූජනීය කිරිවත්තුඩුවේ අරියදස්සන ස්වාමින්වහන්සේ<br />
        (නිර්වාණ ද්වාර යූටියුබ් නාලිකාව)
      </a>
    </div>

    <div class="resources-panel-body">
      <a :href="googleDriveUrl" target="_blank" rel="noopener noreferrer">
        <img class="resource-icon" :src="getIcon(`icons/google_drive.png`)" alt="" />
        පට්ඨාන ධර්ම ලිපිගොනු
      </a>
    </div>

    <div class="resources-panel-body">
      <a :href="pattanaAnuhasUrl" target="_blank" rel="noopener noreferrer">
        <img class="resource-icon" :src="getIcon(`icons/pdf.png`)" alt="" />
        පට්ටානය අනුහස් අවසන් සංස්කරණය
      </a>
    </div>
    <div class="resources-panel-body">
      <a :href="pattanaNayaTipitakaLk" target="_blank" rel="noopener noreferrer">
        <img class="resource-icon" :src="getIcon(`icons/pdf.png`)" alt="" />
        පට්ඨාන නය - අභිධර්ම චන්ද්‍රිකාව - pitaka.lk <br />
        (සිංහල අර්ථ)
      </a>
    </div>

    <div class="resources-panel-body">
      <a :href="pattanaWandanawaTipitakaLk" target="_blank" rel="noopener noreferrer">
        <img class="resource-icon" :src="getIcon(`icons/pdf.png`)" alt="" />
        සමන්ත පට්ඨාන ධර්ම වන්දනාව - tipitaka.lk
      </a>
    </div>

    <div class="resources-panel-body">
      <a href="https://pitaka.lk/books/pattana-pakarana-sannaya/3.html" target="_blank" rel="noopener noreferrer">
        <img class="resource-icon" :src="getIcon(`icons/pdf.png`)" alt="" />
        පට්ඨාන මහා පකරණ සන්නය - pitaka.lk
      </a>
    </div>

    <div class="resources-panel-body">
      <a :href="pindeemaUrl" target="_blank" rel="noopener noreferrer">
        <img class="resource-icon" :src="getIcon(`icons/youtube.png`)" alt="" />
        පට්ඨාන දේශනා අංක 02 - බුරුමරට වැඩවාසී පූජ්‍ය ධම්මගවේසී හිමි<br />
        (දේව පුණ්‍යානුමෝදනාව)
      </a>
    </div>

    <div class="empty">.</div>
  </section>
</template>

<script setup>
import { getAssetUrl } from "../utils/assets";

const youtubeUrlND = "https://youtu.be/foa2bgzz7G8?si=-_smELECz6Z5YF4X";
const pindeemaUrl = "https://youtu.be/bPM8dwdJ174?si=7EjVVPRNOX3X71oS&t=5582";
const googleDriveUrl =
  "https://drive.google.com/drive/folders/12SewlKCZrcYMpxcw5MOJ7UmJaUn9JY9e?usp=drive_link";
const pattanaAnuhasUrl = "https://shorturl.at/yVofN";
const pattanaWandanawaTipitakaLk = "https://tipitaka.lk/library/1012";
const pattanaNayaTipitakaLk =
  "https://pitaka.lk/books/abhidharma-chandrikava/9-11.html";

const getIcon = (icon) => {
  return getAssetUrl(icon);
};
</script>

<style scoped>
.resources-panel {
  width: 100%;
  padding: 20px;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.resources-panel-header {
  color: #3b0906;
  font-size: 20px;
  font-weight: 900;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.resources-back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.92);
  color: #3b0906;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, background 0.2s ease;
}

.resources-back-btn:hover {
  background: #fff;
  transform: translateX(-1px);
}

.resources-panel-body {
  background-color: #f9e9cb87;
  border-radius: 18px;
  padding: 20px;
  box-shadow: 0 9px 30px rgba(59, 9, 6, 0.12);
}

.resources-panel-body a {
  display: flex;
  align-items: center;
  gap: 12px;
  border-radius: 16px;
  color: #3b0906;
  font-weight: 400;
  text-decoration: none;
  transition: background 0.2s ease, transform 0.2s ease;
}

.resource-icon {
  width: 40px;
  height: auto;
  flex-shrink: 0;
}

.resources-panel-body a:hover {
  transform: translateX(3%);
  transition: transform 0.1s ease;
  color: #c63100;
}

.empty {
  color: #f7e5c4;
}

@media (max-width: 768px) {
  .resource-icon {
    width: 20px;
    height: auto;
    flex-shrink: 0;
  }

  .resources-panel-body a {
    font-size: 14px;
  }

  .resources-panel-header {
    display: none;
  }

  .resources-panel {
    width: 110%;
    padding: 20px;
  }
}
</style>
