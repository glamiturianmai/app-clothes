import { WARDROBE_PNG_MAX_BYTES } from '~/utils/wardrobe-ui'

function readPngDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const isPngType = file.type === 'image/png'
    const isPngName = file.name.toLowerCase().endsWith('.png')

    if (!isPngType && !isPngName) {
      reject(new Error('Нужен файл в формате PNG.'))
      return
    }

    if (file.size > WARDROBE_PNG_MAX_BYTES) {
      reject(new Error(`Файл больше ${WARDROBE_PNG_MAX_BYTES / (1024 * 1024)} МБ.`))
      return
    }

    const reader = new FileReader()

    reader.onerror = () => {
      reject(new Error('Не удалось прочитать файл.'))
    }

    reader.onload = () => {
      const result = reader.result
      if (typeof result !== 'string' || !result.startsWith('data:image/png')) {
        reject(new Error('Содержимое не похоже на PNG.'))
        return
      }
      resolve(result)
    }

    reader.readAsDataURL(file)
  })
}

export { readPngDataUrl }
