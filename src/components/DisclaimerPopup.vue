<!-- src/components/DisclaimerPopup.vue -->
<template>
  <Transition name="disclaimer-popup">
    <div
      v-if="modelValue"
      class="disclaimer-popup-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
      @click.self="handleClose"
    >
      <section class="disclaimer-popup">
        <h2 id="disclaimer-title">පාඨ සටහන</h2>
        <div class="disclaimer-popup-message">
          මෙම යෙදුමේ අන්තර්ගත පාඨ විවිධ ඩිජිටල් මූලාශ්‍ර ඇසුරින් සම්පාදනය කර ඇත.
          නිරවද්‍යතාවය තහවුරු කිරීම සඳහා උපරිම උත්සාහය ගෙන තිබුණද, අක්ෂර දෝෂ හෝ
          වෙනත් අඩුපාඩු පැවතිය හැකිය. යම් දෝෂයක් හෝ සංශෝධනයක් දැනුම් දීමට කැමති
          නම්, <br />
          කරුණාකර අප හා සම්බන්ධ වන්න.
          <button
            class="contact-link"
            type="button"
            aria-label="Contact us"
            title="ඔබේ ප්‍රතිචාර"
            @click="handleContactClick"
            @mouseenter="hoveredContact = 'contact'"
            @mouseleave="hoveredContact = null"
          >
            <img
              class="contact-icon"
              :src="
                hoveredContact === 'contact'
                  ? getDisclaimerIcon('contact2.png')
                  : getDisclaimerIcon('contact1.png')
              "
              alt=""
            />
          </button>
          <br />
          <br />
          <span>
            මෙහි ප්‍රධාන ප්‍රත්‍ය ශ්‍රවණාධාරකය සඳහා "<b>ශ්‍රී සද්ධර්මය</b>" යූටියුබ් නාලිකාවේ
            අවසරය පරිදි&nbsp;
            <a
              :href="youtubeUrl"
              class="ss-utube-link"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open Samantha Patthana Dharma Wandanawa video on YouTube"
            >
              සමන්ත පට්ඨාන ධර්ම දේශනාව&nbsp;
            </a>
            වීඩියෝවේ ශ්‍රව්‍ය පථය (Audio Track) යොදා ගන්නා ලදී.
          </span>
          <br />
          <br />
          ඔබගේ පෞද්ගලික තොරතුරු හෝ දත්ත කිසිවක් මෙම වෙබ් ඇප් එක තුළ රැස් කිරීමක්
          හෝ ගබඩා කිරීමක් සිදු නොවේ.
          <br />
          <br />

          මෙම යෙදුම ධර්ම දානයක් ලෙස පිරිනමනු ලබන අතර, මුල් මූලාශ්‍රයන්ට ගෞරවය සහ
          ස්තූතිපූර්වක පුණ්‍යානුමෝදනාව පුදකරන්නෙමු.
          <br />
          <br />

          අප කල්‍යාණමිත්‍ර මහා සංඝරත්නය ඇතුළු ඔබ සියලු දෙනාට මෙම උතුම් ධර්ම දාන
          කුසලය අනුමෝදන් වේවා!
          <br />
          <br />

          තෙරුවන් සරණයි!!!
        </div>
        <button
          type="button"
          class="disclaimer-close-btn"
          aria-label="Close disclaimer"
          @click="handleClose"
        >
          <span aria-hidden="true">පැහැදිලියි</span>
        </button>
      </section>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from "vue";
import { getAssetUrl } from "../utils/assets";

defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  youtubeUrl: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "contact"]);

const hoveredContact = ref(null);

const getDisclaimerIcon = (img) => {
  return getAssetUrl(`icons/${img}`);
};

function handleClose() {
  emit("close");
}

function handleContactClick() {
  emit("contact");
}
</script>

<style scoped>
.disclaimer-popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2100;
  display: grid;
  place-items: center;
  background: rgba(35, 9, 5, 0.55);
  backdrop-filter: blur(4px);
  padding: 16px;
}

.disclaimer-popup {
  max-height: calc(100dvh - 24px);
  max-width: 520px;
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 18px;
  padding: 22px 22px 18px;
  background: #fff7e3;
  box-shadow: 0 22px 56px rgba(35, 9, 5, 0.26);
  color: #3b0906;
}

.disclaimer-popup h2 {
  margin: 0 0 12px;
  font-family: "Abhaya Libre", serif;
  font-size: 25px;
}

.disclaimer-popup-message {
  border-radius: 18px;
  background: rgb(233 221 195 / 54%);
  padding: 14px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  margin-bottom: 20px;
  font-family: "Abhaya Libre", serif;
  font-size: clamp(16px, 2.4vw, 19px);
  line-height: 1.65;
  color: #4b1e1e;
  text-align: left;
}

.disclaimer-close-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 18px;
  border: none;
  border-radius: 12px;
  background: #7a2410;
  color: #ffebd8;
  font-size: 17px;
  font-family: "Abhaya Libre", serif;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease;
}

.disclaimer-close-btn:hover {
  background: #a43b23;
  transform: translateY(-1px);
}

.ss-utube-link {
  color: #3b0906;
}

.ss-utube-link:hover {
  color: #c63100;
}

.contact-link {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 36%;
  background: transparent;
  color: #4c1711;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;
}

.contact-link:hover,
.contact-link:focus-visible {
  color: #c63100;
  transform: scale(1.08);
  outline: none;
}

.contact-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
@media (max-height: 700px) {
  .disclaimer-popup {
    max-height: calc(100dvh - 100px);
    padding: 18px;
  }

  .disclaimer-popup h2 {
    margin-bottom: 8px;
    font-size: 22px;
  }
}
</style>
