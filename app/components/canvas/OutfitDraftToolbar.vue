<template>
  <div class="outfit-draft-toolbar">
    <h3 class="outfit-draft-toolbar__title">Луки</h3>

    <label class="outfit-draft-toolbar__field">
      <span class="outfit-draft-toolbar__label">Название</span>
      <input v-model="outfitName" class="outfit-draft-toolbar__input" type="text" autocomplete="off" />
    </label>

    <label class="outfit-draft-toolbar__field">
      <span class="outfit-draft-toolbar__label">Теги</span>
      <input
        v-model="outfitTagsText"
        class="outfit-draft-toolbar__input"
        type="text"
        placeholder="через запятую"
        autocomplete="off"
      />
    </label>

    <div class="outfit-draft-toolbar__row">
      <button type="button" class="outfit-draft-toolbar__btn outfit-draft-toolbar__btn_primary" @click="saveOutfit">
        Сохранить как новый
      </button>

      <button
        type="button"
        class="outfit-draft-toolbar__btn"
        :disabled="!isUpdatePossible"
        @click="updateSelectedOutfit"
      >
        Обновить выбранный
      </button>
    </div>

    <div class="outfit-draft-toolbar__row outfit-draft-toolbar__row_load">
      <label class="outfit-draft-toolbar__field outfit-draft-toolbar__field_grow">
        <span class="outfit-draft-toolbar__label">Открыть</span>
        <select v-model="selectedOutfitId" class="outfit-draft-toolbar__select">
          <option value="">— выберите лук —</option>
          <option v-for="entry in outfitsStore.outfits" :key="entry.id" :value="entry.id">
            {{ entry.name }}
          </option>
        </select>
      </label>

      <button type="button" class="outfit-draft-toolbar__btn" :disabled="!isLoadPossible" @click="loadSelectedOutfit">
        Открыть на холсте
      </button>

      <button
        type="button"
        class="outfit-draft-toolbar__btn outfit-draft-toolbar__btn_danger"
        :disabled="!isLoadPossible"
        @click="deleteSelectedOutfit"
      >
        Удалить
      </button>
    </div>

    <p v-if="statusText" class="outfit-draft-toolbar__status">{{ statusText }}</p>
  </div>
</template>

<script setup lang="ts">
import { parseTagsFromString } from '~/utils/wardrobe-ui'

import { normalizeCanvasPlacements } from '~/utils/canvas-placements'

const emit = defineEmits<{
  'loaded:outfit': []
}>()

const outfitsStore = useOutfitsStore()
const canvasDraftStore = useCanvasDraftStore()

const outfitName = ref('')
const outfitTagsText = ref('')
const selectedOutfitId = ref('')
const statusText = ref('')

const isLoadPossible = computed(() => selectedOutfitId.value.length > 0)

const isUpdatePossible = computed(() => selectedOutfitId.value.length > 0)

watch(selectedOutfitId, (nextId) => {
  if (!nextId.length) {
    return
  }

  const outfit = outfitsStore.outfitById(nextId)
  if (!outfit) {
    return
  }

  outfitName.value = outfit.name
  outfitTagsText.value = outfit.tags.join(', ')
})

function saveOutfit() {
  const name = outfitName.value.trim()
  if (!name.length) {
    statusText.value = 'Введите название лука.'
    return
  }

  const tags = parseTagsFromString(outfitTagsText.value)
  const placements = normalizeCanvasPlacements(canvasDraftStore.snapshotPlacements())

  outfitsStore.addOutfit({ name, placements, tags })
  statusText.value = `Сохранено: «${name}».`
}

function updateSelectedOutfit() {
  const id = selectedOutfitId.value
  if (!id.length) {
    return
  }

  const name = outfitName.value.trim()
  if (!name.length) {
    statusText.value = 'Введите название лука.'
    return
  }

  const tags = parseTagsFromString(outfitTagsText.value)
  const placements = normalizeCanvasPlacements(canvasDraftStore.snapshotPlacements())

  outfitsStore.updateOutfit(id, { name, placements, tags })
  statusText.value = 'Лук обновлён.'
}

function loadSelectedOutfit() {
  const id = selectedOutfitId.value
  if (!id.length) {
    return
  }

  const outfit = outfitsStore.outfitById(id)
  if (!outfit) {
    statusText.value = 'Лук не найден.'
    return
  }

  const placements = normalizeCanvasPlacements(structuredClone(outfit.placements))
  canvasDraftStore.replacePlacements(placements)
  outfitName.value = outfit.name
  outfitTagsText.value = outfit.tags.join(', ')
  statusText.value = `Открыт лук «${outfit.name}».`
  emit('loaded:outfit')
}

function deleteSelectedOutfit() {
  const id = selectedOutfitId.value
  if (!id.length) {
    return
  }

  const outfit = outfitsStore.outfitById(id)
  const isConfirmed = window.confirm(
    outfit ? `Удалить лук «${outfit.name}»?` : 'Удалить выбранный лук?',
  )

  if (!isConfirmed) {
    return
  }

  outfitsStore.removeOutfit(id)
  selectedOutfitId.value = ''
  outfitName.value = ''
  outfitTagsText.value = ''
  statusText.value = 'Лук удалён.'
}
</script>

<style scoped lang="scss">
.outfit-draft-toolbar {
  padding: 0.75rem;
  border: 1px solid #e3e3e3;
  border-radius: 8px;
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.outfit-draft-toolbar__title {
  margin: 0;
  font-size: 0.95rem;
}

.outfit-draft-toolbar__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.outfit-draft-toolbar__field_grow {
  flex: 1 1 10rem;
  min-width: 0;
}

.outfit-draft-toolbar__label {
  font-size: 0.75rem;
  color: #444;
}

.outfit-draft-toolbar__input,
.outfit-draft-toolbar__select {
  padding: 0.45rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font: inherit;
}

.outfit-draft-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-end;
}

.outfit-draft-toolbar__row_load {
  align-items: flex-end;
}

.outfit-draft-toolbar__btn {
  padding: 0.45rem 0.65rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: #fff;
  font: inherit;
  cursor: pointer;

  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background: #f6f6f6;
  }
}

.outfit-draft-toolbar__btn_primary {
  background: #1a1a1a;
  color: #fff;
  border-color: #1a1a1a;

  &:hover:not(:disabled) {
    background: #333;
  }
}

.outfit-draft-toolbar__btn_danger {
  border-color: #e0a4a4;
  color: #8b2b2b;

  &:hover:not(:disabled) {
    background: #fdecec;
  }
}

.outfit-draft-toolbar__status {
  margin: 0;
  font-size: 0.8rem;
  color: #444;
}
</style>
