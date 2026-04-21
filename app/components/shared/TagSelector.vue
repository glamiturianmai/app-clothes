<template>
  <div class="tag-selector">
    <div class="tag-selector__chips" v-if="modelValue.length">
      <span v-for="tag in modelValue" :key="tag" class="tag-selector__chip">
        {{ tag }}
        <button
          type="button"
          class="tag-selector__chip-remove"
          :aria-label="t('tags.removeAria', { tag })"
          @click="removeTag(tag)"
        >
          ×
        </button>
      </span>
    </div>

    <select v-model="selectValue" class="tag-selector__select" @change="handleSelect">
      <option value="">{{ placeholder || t('tags.placeholder') }}</option>
      <option
        v-for="tag in availableOptions"
        :key="tag"
        :value="tag"
      >
        {{ tag }}
      </option>
      <option v-if="allowCustom" :value="ADD_CUSTOM_VALUE">
        {{ t('tags.addCustom') }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
const ADD_CUSTOM_VALUE = '__add_custom__'

const props = withDefaults(
  defineProps<{
    modelValue: string[]
    options: string[]
    allowCustom?: boolean
    placeholder?: string
  }>(),
  {
    allowCustom: false,
    placeholder: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  'create:option': [value: string]
}>()

const selectValue = ref('')
const { t } = useAppI18n()

const availableOptions = computed(() =>
  props.options.filter((tag) => !props.modelValue.includes(tag)),
)

function emitUniqueTags(entries: string[]) {
  const unique: string[] = []
  for (const entry of entries) {
    const normalized = entry.trim()
    if (!normalized || unique.includes(normalized)) {
      continue
    }
    unique.push(normalized)
  }
  emit('update:modelValue', unique)
}

function removeTag(tag: string) {
  emit('update:modelValue', props.modelValue.filter((entry) => entry !== tag))
}

function handleSelect() {
  const selected = selectValue.value
  selectValue.value = ''

  if (!selected.length) {
    return
  }

  if (selected === ADD_CUSTOM_VALUE) {
    if (!props.allowCustom) {
      return
    }
    const raw = window.prompt(t('tags.prompt'))
    const customTag = raw?.trim() ?? ''
    if (!customTag.length) {
      return
    }
    emit('create:option', customTag)
    emitUniqueTags([...props.modelValue, customTag])
    return
  }

  emitUniqueTags([...props.modelValue, selected])
}
</script>

<style scoped lang="scss">
.tag-selector {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.tag-selector__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.tag-selector__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--ui-accent);
  border-radius: 999px;
  padding: 0.18rem 0.5rem;
  font-size: 0.78rem;
  background: var(--ui-accent-soft);
  color: var(--ui-accent);
}

.tag-selector__chip-remove {
  border: 0;
  background: transparent;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  font-size: 0.95rem;
  color: var(--ui-accent);
}

.tag-selector__select {
  padding: 0.45rem 0.5rem;
  border: 1px solid var(--ui-border-strong);
  border-radius: var(--ui-radius-sm);
  background: var(--ui-surface);
  font: inherit;
}
</style>
