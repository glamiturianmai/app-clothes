import { WARDROBE_PNG_MAX_BYTES } from '~/utils/wardrobe-ui'
import { translate } from '~/locales/messages'

function readPngDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const isPngType = file.type === 'image/png'
    const isPngName = file.name.toLowerCase().endsWith('.png')

    if (!isPngType && !isPngName) {
      reject(new Error(translate('ru', 'readPng.needPng')))
      return
    }

    if (file.size > WARDROBE_PNG_MAX_BYTES) {
      reject(new Error(translate('ru', 'readPng.fileTooLarge', { sizeMb: WARDROBE_PNG_MAX_BYTES / (1024 * 1024) })))
      return
    }

    const reader = new FileReader()

    reader.onerror = () => {
      reject(new Error(translate('ru', 'readPng.readError')))
    }

    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string' || !result.startsWith('data:image/png')) {
        reject(new Error(translate('ru', 'readPng.invalidContent')))
        return
      }
      resolve(result)
    }

    reader.readAsDataURL(file)
  })
}

export { readPngDataUrl }
