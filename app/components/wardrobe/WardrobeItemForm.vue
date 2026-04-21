<template>
  <form class="wardrobe-form" @submit.prevent="submitForm">
    <h3 v-if="showHeading" class="wardrobe-form__heading">{{ headingText }}</h3>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">{{ t('wardrobe.form.name') }}</span>
      <input v-model="draft.name" class="wardrobe-form__input" type="text" required />
    </label>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">{{ t('wardrobe.form.category') }}</span>
      <select v-model="draft.category" class="wardrobe-form__select">
        <option v-for="option in WARDROBE_CATEGORY_OPTIONS" :key="option.value" :value="option.value">
          {{ t(option.labelKey) }}
        </option>
      </select>
    </label>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">{{ t('wardrobe.form.season') }}</span>
      <select v-model="draft.season" class="wardrobe-form__select">
        <option v-for="option in WARDROBE_SEASON_OPTIONS" :key="option.value" :value="option.value">
          {{ t(option.labelKey) }}
        </option>
      </select>
    </label>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">{{ t('wardrobe.form.tags') }}</span>
      <TagSelector
        v-model="selectedTags"
        :options="tagOptions"
        :allow-custom="true"
        :placeholder="t('wardrobe.form.tagsPlaceholder')"
        @create:option="onCreateTag"
      />
    </label>

    <label class="wardrobe-form__field">
      <span class="wardrobe-form__label">{{ t('wardrobe.form.imagePng') }}</span>
      <UploadcareUploader v-model="draft.imageUrl" />
    </label>

    <p v-if="imageError" class="wardrobe-form__error">{{ imageError }}</p>

    <div v-if="draft.imageUrl" class="wardrobe-form__preview-wrap">
      <img class="wardrobe-form__preview" :src="draft.imageUrl" alt="" />
    </div>

    <div class="wardrobe-form__actions">
      <button type="submit" class="wardrobe-form__btn wardrobe-form__btn_primary">{{ t('common.save') }}</button>
      <button type="button" class="wardrobe-form__btn" @click="$emit('cancel')">{{ t('common.cancel') }}</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import type { WardrobeItem, WardrobeItemInput } from '~/types/wardrobe'

import TagSelector from '~/components/shared/TagSelector.vue'
import UploadcareUploader from '~/components/shared/UploadcareUploader.client.vue'
import {
  createEmptyWardrobeItemInput,
  WARDROBE_CATEGORY_OPTIONS,
  WARDROBE_SEASON_OPTIONS,
} from '~/utils/wardrobe-ui'

const props = withDefaults(
  defineProps<{
    item: WardrobeItem | null
    showHeading?: boolean
  }>(),
  { showHeading: true },
)

const emit = defineEmits<{
  cancel: []
  save: [input: WardrobeItemInput]
}>()

const wardrobeStore = useWardrobeStore()
const { t } = useAppI18n()
const wardrobeStoreApi = wardrobeStore as unknown as {
  availableTags: string[]
  registerTags: (tags: string[]) => void
}

const draft = reactive<WardrobeItemInput>(createEmptyWardrobeItemInput())
const selectedTags = ref<string[]>([])
const imageError = ref('')

const headingText = computed(() =>
  props.item ? t('wardrobe.form.headingEdit') : t('wardrobe.form.headingNew'),
)

const tagOptions = computed(() => wardrobeStoreApi.availableTags)

watch(
  () => props.item,
  (next) => {
    imageError.value = ''
    if (next) {
      draft.baseLayer = next.baseLayer
      draft.category = next.category
      draft.imageUrl = next.imageUrl
      draft.name = next.name
      draft.season = next.season
      draft.tags = [...next.tags]
      selectedTags.value = [...next.tags]
    } else {
      Object.assign(draft, createEmptyWardrobeItemInput())
      selectedTags.value = []
    }
  },
  { immediate: true },
)

watch(
  () => draft.imageUrl,
  (nextImageUrl) => {
    if (nextImageUrl.trim().length > 0) {
      imageError.value = ''
    }
  },
)

function onCreateTag(tag: string) {
  wardrobeStoreApi.registerTags([tag])
}

function submitForm() {
  if (!draft.imageUrl.trim()) {
    imageError.value = t('wardrobe.form.imageRequired')
    return
  }

  const name = draft.name.trim()

  if (!name) {
    return
  }

  const tags = [...selectedTags.value]
  const baseLayer = props.item?.baseLayer ?? 0

  emit('save', {
    baseLayer,
    category: draft.category,
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
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius-md);
  background: var(--ui-surface-muted);
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
  border: 1px solid var(--ui-border-strong);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  font: inherit;
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
  border: 1px solid var(--ui-accent);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-accent);
  font: inherit;
  cursor: pointer;
  color: #fff;

  &:hover {
    background: #f0f0ee;
    border-color: var(--ui-border-strong);
    color: var(--ui-text);
  }
}

.wardrobe-form__btn_primary {
  background: var(--ui-accent);
  color: #fff;
  border-color: var(--ui-accent);
}
</style>
