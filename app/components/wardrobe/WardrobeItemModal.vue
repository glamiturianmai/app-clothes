<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="wardrobe-modal__backdrop"
      role="presentation"
      @click.self="onBackdrop"
    >
      <div
        ref="dialogEl"
        class="wardrobe-modal__dialog"
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        :aria-labelledby="titleId"
        @keydown.esc.prevent="onBackdrop"
      >
        <div class="wardrobe-modal__header">
          <h3 :id="titleId" class="wardrobe-modal__title">{{ title }}</h3>
          <button type="button" class="wardrobe-modal__close" :aria-label="t('wardrobe.modal.close')" @click="emit('close')">
            ×
          </button>
        </div>
        <div class="wardrobe-modal__body">
          <WardrobeItemForm
            :key="itemKey"
            :item="item"
            :show-heading="false"
            @cancel="emit('close')"
            @save="onSave"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { WardrobeItem, WardrobeItemInput } from '~/types/wardrobe'

const props = defineProps<{
  open: boolean
  item: WardrobeItem | null
}>()

const emit = defineEmits<{
  close: []
  save: [input: WardrobeItemInput]
}>()

const titleId = useId()
const dialogEl = ref<HTMLElement | null>(null)
const { t } = useAppI18n()

const title = computed(() => (props.item ? t('wardrobe.form.headingEdit') : t('wardrobe.form.headingNew')))

const itemKey = computed(() => props.item?.id ?? 'new')

function onBackdrop() {
  emit('close')
}

function onSave(input: WardrobeItemInput) {
  emit('save', input)
}

watch(
  () => props.open,
  (isOpen) => {
    if (!import.meta.client) {
      return
    }
    document.body.style.overflow = isOpen ? 'hidden' : ''
    if (isOpen) {
      nextTick(() => {
        dialogEl.value?.focus()
      })
    }
  },
)

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.body.style.overflow = ''
  }
})
</script>

<style scoped lang="scss">
.wardrobe-modal__backdrop {
  position: fixed;
  inset: 0;
  z-index: 80;
  background: rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  overflow-y: auto;
}

.wardrobe-modal__dialog {
  width: min(100%, 30rem);
  margin: auto;
  background: #fcfcfb;
  border-radius: 14px;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.18),
    0 4px 12px rgba(15, 23, 42, 0.06);
  border: 1px solid #ececea;
}

.wardrobe-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.1rem;
  border-bottom: 1px solid #ececea;
  background: #fff;
  border-radius: 14px 14px 0 0;
}

.wardrobe-modal__title {
  margin: 0;
  font-size: 1.02rem;
  font-weight: 600;
  color: #191919;
}

.wardrobe-modal__close {
  width: 2rem;
  height: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--ui-border);
  background: #fbfbfa;
  font-size: 1.3rem;
  line-height: 1;
  cursor: pointer;
  color: #555;
  padding: 0;
  border-radius: 10px;

  &:hover {
    background: var(--ui-accent-soft);
    border-color: var(--ui-accent);
    color: var(--ui-accent);
  }
}

.wardrobe-modal__body {
  padding: 1rem 1.1rem 1.15rem;
  max-height: min(78vh, 36rem);
  overflow-y: auto;
  background: #fcfcfb;
  border-radius: 0 0 14px 14px;
}

.wardrobe-modal__body :deep(.wardrobe-form) {
  border: 0;
  padding: 0;
  background: transparent;
}
</style>
