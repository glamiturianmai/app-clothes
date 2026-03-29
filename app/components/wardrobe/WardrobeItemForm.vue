<template>
  <form class="wardrobe-form" @submit.prevent="submitForm">
    <h3 class="wardrobe-form__heading">{{ headingText }}</h3>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">Название</span>
      <input v-model="draft.name" class="wardrobe-form__input" type="text" required />
    </label>

    <div class="wardrobe-form__row">
      <label class="wardrobe-form__field">
        <span class="wardrobe-form__label">Цвет</span>
        <input v-model="draft.color" class="wardrobe-form__color" type="color" />
      </label>
      <label class="wardrobe-form__field">
        <span class="wardrobe-form__label">Базовый слой</span>
        <input
          v-model.number="draft.baseLayer"
          class="wardrobe-form__input"
          type="number"
          min="0"
          step="1"
        />
      </label>
    </div>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">Категория</span>
      <select v-model="draft.category" class="wardrobe-form__select">
        <option v-for="option in WARDROBE_CATEGORY_OPTIONS" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">Сезон</span>
      <select v-model="draft.season" class="wardrobe-form__select">
        <option v-for="option in WARDROBE_SEASON_OPTIONS" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
    </label>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">Теги</span>
      <input
        v-model="tagsText"
        class="wardrobe-form__input"
        type="text"
        placeholder="через запятую"
        autocomplete="off"
      />
    </label>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">Изображение PNG</span>
      <input
        class="wardrobe-form__file"
        type="file"
        accept="image/png,.png"
        @change="onFileChange"
      />
    </label>

    <p v-if="imageError" class="wardrobe-form__error">{{ imageError }}</p>

    <div v-if="draft.imageUrl" class="wardrobe-form__preview-wrap">
      <img class="wardrobe-form__preview" :src="draft.imageUrl" alt="" />
    </div>

    <div class="wardrobe-form__actions">
      <button type="submit" class="wardrobe-form__btn wardrobe-form__btn_primary">Сохранить</button>
      <button type="button" class="wardrobe-form__btn" @click="$emit('cancel')">Отмена</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { WardrobeItem, WardrobeItemInput } from '~/types/wardrobe'

import { readPngDataUrl } from '~/utils/read-png-data-url'
import {
  createEmptyWardrobeItemInput,
  parseTagsFromString,
  WARDROBE_CATEGORY_OPTIONS,
  WARDROBE_SEASON_OPTIONS,
} from '~/utils/wardrobe-ui'

const props = defineProps<{
  item: WardrobeItem | null
}>()

const emit = defineEmits<{
  cancel: []
  save: [input: WardrobeItemInput]
}>()

const draft = reactive<WardrobeItemInput>(createEmptyWardrobeItemInput())
const tagsText = ref('')
const imageError = ref('')

const headingText = computed(() => (props.item ? 'Редактировать вещь' : 'Новая вещь'))

watch(
  () => props.item,
  (next) => {
    imageError.value = ''
    if (next) {
      draft.baseLayer = next.baseLayer
      draft.category = next.category
      draft.color = next.color
      draft.imageUrl = next.imageUrl
      draft.name = next.name
      draft.season = next.season
      draft.tags = [...next.tags]
      tagsText.value = next.tags.join(', ')
    } else {
      Object.assign(draft, createEmptyWardrobeItemInput())
      tagsText.value = ''
    }
  },
  { immediate: true },
)

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] ?? null
  target.value = ''

  if (!file) {
    return
  }

  try {
    draft.imageUrl = await readPngDataUrl(file)
    imageError.value = ''
  } catch (error) {
    imageError.value = error instanceof Error ? error.message : 'Не удалось загрузить PNG.'
  }
}

function submitForm() {
  if (!draft.imageUrl.trim()) {
    imageError.value = 'Добавьте PNG с прозрачным фоном.'
    return
  }

  const name = draft.name.trim()

  if (!name) {
    return
  }

  const tags = parseTagsFromString(tagsText.value)
  const baseLayerRaw = Number(draft.baseLayer)
  const baseLayer = Number.isFinite(baseLayerRaw) ? Math.max(0, Math.floor(baseLayerRaw)) : 0

  emit('save', {
    baseLayer,
    category: draft.category,
    color: draft.color,
    imageUrl: draft.imageUrl,
    name,
    season: draft.season,
    tags,
  })
}
</script>

<style scoped lang="scss">
.wardrobe-form {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.wardrobe-form__heading {
  margin: 0;
  font-size: 1.05rem;
}

.wardrobe-form__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.wardrobe-form__row {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.wardrobe-form__label {
  font-size: 0.75rem;
  color: #444;
}

.wardrobe-form__input,
.wardrobe-form__select {
  padding: 0.45rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font: inherit;
}

.wardrobe-form__color {
  width: 3rem;
  height: 2rem;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
}

.wardrobe-form__file {
  font: inherit;
  font-size: 0.85rem;
}

.wardrobe-form__error {
  margin: 0;
  font-size: 0.85rem;
  color: #b00020;
}

.wardrobe-form__preview-wrap {
  max-height: 160px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
}

.wardrobe-form__preview {
  max-height: 160px;
  max-width: 100%;
  object-fit: contain;
}

.wardrobe-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.wardrobe-form__btn {
  padding: 0.45rem 0.85rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: #f3f3f3;
  }
}

.wardrobe-form__btn_primary {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;

  &:hover {
    background: #333;
  }
}
</style>
