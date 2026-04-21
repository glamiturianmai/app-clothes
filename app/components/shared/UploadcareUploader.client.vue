<template>
  <div class="uploadcare-uploader">
    <input
      ref="inputEl"
      type="hidden"
      role="uploadcare-uploader"
      :data-public-key="publicKey"
      data-images-only="true"
      data-multiple="false"
      data-clearable="true"
      data-preview-step="true"
      data-tabs="file camera url"
    />
    <p v-if="statusText" class="uploadcare-uploader__status">{{ statusText }}</p>
    <p v-if="errorText" class="uploadcare-uploader__error">{{ errorText }}</p>
  </div>
</template>

<script setup lang="ts">
type UploadcareFileInfo = {
  cdnUrl?: string
  isImage?: boolean
  mimeType?: string
}

type UploadcareWidgetApi = {
  onUploadComplete: (cb: (fileInfo: UploadcareFileInfo) => void) => void
  openDialog: () => void
}

type UploadcareGlobalApi = {
  Widget: (input: HTMLElement) => UploadcareWidgetApi
}

const imageUrl = defineModel<string>({ required: true })

const runtimeConfig = useRuntimeConfig()
const { t } = useAppI18n()
const publicKey = computed(() =>
  String(runtimeConfig.public.uploadcarePublicKey ?? '').trim(),
)

const inputEl = ref<HTMLInputElement | null>(null)
const widget = ref<UploadcareWidgetApi | null>(null)
const errorText = ref('')
const statusText = ref('')

const isDisabled = computed(
  () => !publicKey.value.length || !widget.value,
)

function getUploadcareGlobal(): UploadcareGlobalApi | null {
  if (!import.meta.client) {
    return null
  }
  const scopedWindow = window as Window & { uploadcare?: UploadcareGlobalApi }
  return scopedWindow.uploadcare ?? null
}

function loadUploadcareScript() {
  return new Promise<void>((resolve, reject) => {
    if (!import.meta.client) {
      resolve()
      return
    }

    if (getUploadcareGlobal()) {
      resolve()
      return
    }

    const existing = document.querySelector<HTMLScriptElement>('script[data-uploadcare-widget="true"]')
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(t('uploadcare.widgetLoadError'))), {
        once: true,
      })
      return
    }

    const script = document.createElement('script')
    script.src = 'https://ucarecdn.com/libs/widget/3.x/uploadcare.full.min.js'
    script.async = true
    script.dataset.uploadcareWidget = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(t('uploadcare.widgetLoadError')))
    document.head.appendChild(script)
  })
}

function setupWidget() {
  if (!publicKey.value.length) {
    errorText.value = t('uploadcare.keyMissing')
    return
  }

  const globalApi = getUploadcareGlobal()
  const el = inputEl.value
  if (!globalApi || !el) {
    return
  }

  widget.value = globalApi.Widget(el)
  widget.value.onUploadComplete((fileInfo) => {
    const isPng = fileInfo.mimeType === 'image/png'
    if (!fileInfo.isImage || !isPng || !fileInfo.cdnUrl) {
      errorText.value = t('uploadcare.pngOnly')
      return
    }

    imageUrl.value = fileInfo.cdnUrl
    statusText.value = t('uploadcare.uploaded')
    errorText.value = ''
  })
}

function openWidgetDialog() {
  errorText.value = ''
  statusText.value = ''
  widget.value?.openDialog()
}

onMounted(async () => {
  try {
    await loadUploadcareScript()
    setupWidget()
  } catch (error) {
    errorText.value =
      error instanceof Error
        ? error.message
        : t('uploadcare.connectError')
  }
})
</script>

<style scoped lang="scss">
.uploadcare-uploader {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.uploadcare-uploader__button {
  width: fit-content;
}

.uploadcare-uploader__status {
  margin: 0;
  font-size: 0.78rem;
  color: #2f6f43;
}

.uploadcare-uploader__error {
  margin: 0;
  font-size: 0.8rem;
  color: #b00020;
}
</style>
