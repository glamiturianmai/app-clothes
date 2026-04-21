<template>
  <div class="outfit-draft-toolbar">
    <h3 class="outfit-draft-toolbar__title">{{ t('outfitDraft.title') }}</h3>
    <div class="outfit-draft-toolbar__panel">
      <label class="outfit-draft-toolbar__field">
        <span class="outfit-draft-toolbar__label">{{ t('outfitDraft.existingOutfits') }}</span>
        <select v-model="selectedOutfitId" class="outfit-draft-toolbar__select">
          <option :value="NEW_OUTFIT_VALUE">{{ t('outfitDraft.newOutfitOption') }}</option>
          <option v-for="entry in outfitsStore.outfits" :key="entry.id" :value="entry.id">
            {{ entry.name }}
          </option>
        </select>
      </label>

      <label class="outfit-draft-toolbar__field">
        <span class="outfit-draft-toolbar__label">{{ t('outfitDraft.name') }}</span>
        <input
          v-model="outfitName"
          class="outfit-draft-toolbar__input"
          type="text"
          :placeholder="t('outfitDraft.namePlaceholder')"
          autocomplete="off"
        />
      </label>

      <label class="outfit-draft-toolbar__field">
        <span class="outfit-draft-toolbar__label">{{ t('outfitDraft.temperature') }}</span>
        <TemperatureRangeSlider v-model="temperatureRange" />
      </label>

      <div class="outfit-draft-toolbar__actions">
        <button type="button" class="outfit-draft-toolbar__btn" @click="selectNewOutfit">
          {{ t('outfitDraft.newOutfit') }}
        </button>
        <button type="button" class="outfit-draft-toolbar__btn outfit-draft-toolbar__btn_primary" @click="saveOutfit">
          {{ t('common.save') }}
        </button>
      </div>
    </div>

    <p v-if="statusText" class="outfit-draft-toolbar__status">{{ statusText }}</p>
  </div>
</template>

<script setup lang="ts">
import { cloneCanvasPlacements, normalizeCanvasPlacements } from '~/utils/canvas-placements'
import TemperatureRangeSlider from '~/components/shared/TemperatureRangeSlider.vue'

const props = defineProps<{
  capturePreview: () => string | null
}>()

const emit = defineEmits<{
  'loaded:outfit': []
}>()

const outfitsStore = useOutfitsStore()
const canvasDraftStore = useCanvasDraftStore()
const { t } = useAppI18n()

const NEW_OUTFIT_VALUE = '__new__'
const DEFAULT_TEMPERATURE_RANGE = { min: 0, max: 15 }

const outfitName = ref('')
const selectedOutfitId = ref(NEW_OUTFIT_VALUE)
const statusText = ref('')
const temperatureRange = ref({ ...DEFAULT_TEMPERATURE_RANGE })

watch(selectedOutfitId, (nextId) => {
  if (!nextId.length || nextId === NEW_OUTFIT_VALUE) {
    canvasDraftStore.clearPlacements()
    outfitName.value = ''
    temperatureRange.value = { ...DEFAULT_TEMPERATURE_RANGE }
    statusText.value = t('outfitDraft.statusNew')
    return
  }

  const outfit = outfitsStore.outfits.find((entry) => entry.id === nextId) ?? null
  if (!outfit) {
    return
  }

  outfitName.value = outfit.name
  temperatureRange.value = {
    min: outfit.minTemperatureC,
    max: outfit.maxTemperatureC,
  }
  loadSelectedOutfit()
})

function saveOutfit() {
  const name = outfitName.value.trim()
  if (!name.length) {
    statusText.value = t('outfitDraft.errorNameRequired')
    return
  }

  try {
    const placements = normalizeCanvasPlacements(canvasDraftStore.snapshotPlacements())
    let previewImageUrl: string | null = null
    try {
      previewImageUrl = props.capturePreview()
    } catch {
      previewImageUrl = null
    }

    const created = (
      outfitsStore as unknown as {
        addOutfit: (input: {
          name: string
          placements: typeof placements
          previewImageUrl: string | null
          minTemperatureC: number
          maxTemperatureC: number
        }) => { id: string }
      }
    ).addOutfit({
      name,
      placements,
      previewImageUrl,
      minTemperatureC: temperatureRange.value.min,
      maxTemperatureC: temperatureRange.value.max,
    })
    selectedOutfitId.value = created.id
    statusText.value = t('outfitDraft.statusSaved', { name })
  } catch (error) {
    statusText.value =
      error instanceof Error ? error.message : t('outfitDraft.errorSave')
  }
}

function loadSelectedOutfit() {
  const id = selectedOutfitId.value
  if (!id.length || id === NEW_OUTFIT_VALUE) {
    canvasDraftStore.clearPlacements()
    outfitName.value = ''
    temperatureRange.value = { ...DEFAULT_TEMPERATURE_RANGE }
    statusText.value = t('outfitDraft.statusNew')
    emit('loaded:outfit')
    return
  }

  const outfit = outfitsStore.outfits.find((entry) => entry.id === id) ?? null
  if (!outfit) {
    statusText.value = t('outfitDraft.statusNotFound')
    return
  }

  const placements = normalizeCanvasPlacements(cloneCanvasPlacements(outfit.placements))
  canvasDraftStore.replacePlacements(placements)
  outfitName.value = outfit.name
  temperatureRange.value = {
    min: outfit.minTemperatureC,
    max: outfit.maxTemperatureC,
  }
  statusText.value = t('outfitDraft.statusOpened', { name: outfit.name })
  emit('loaded:outfit')
}

function selectNewOutfit() {
  selectedOutfitId.value = NEW_OUTFIT_VALUE
}
</script>

<style scoped lang="scss">
.outfit-draft-toolbar {
  padding: 0.7rem;
  border: 1px solid #e6e6e3;
  border-radius: 12px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.outfit-draft-toolbar__title {
  margin: 0;
  font-size: 0.9rem;
  color: #575756;
  font-weight: 600;
}

.outfit-draft-toolbar__panel {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.outfit-draft-toolbar__field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.outfit-draft-toolbar__label {
  font-size: 0.78rem;
  color: #575756;
  font-weight: 600;
}

.outfit-draft-toolbar__input,
.outfit-draft-toolbar__select {
  padding: 0.5rem 0.62rem;
  border: 1px solid var(--ui-border-strong);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  font: inherit;
  font-size: 0.82rem;
}

.outfit-draft-toolbar__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.45rem;
}

.outfit-draft-toolbar__btn {
  padding: 0.52rem 0.7rem;
  border: 1px solid var(--ui-accent);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-accent);
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
  color: #fff;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    border-color: var(--ui-border-strong);
    background: #f0f0ee;
    color: var(--ui-text);
  }
}

.outfit-draft-toolbar__btn_primary {
  background: var(--ui-accent);
  color: #fff;
  border-color: var(--ui-accent);
}

.outfit-draft-toolbar__status {
  margin: 0;
  font-size: 0.78rem;
  color: #444;
}
</style>
