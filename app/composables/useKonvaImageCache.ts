import { shallowRef } from 'vue'
import { translate } from '~/locales/messages'

type ImageByWardrobeItemId = Record<string, HTMLImageElement | null>

function useKonvaImageCache() {
  const imageByWardrobeItemId = shallowRef<ImageByWardrobeItemId>({})
  const promiseByWardrobeItemId = new Map<string, Promise<HTMLImageElement>>()

  async function loadImage(imageUrl: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const isImageUrlDefined = Boolean(imageUrl)
      if (!isImageUrlDefined) {
        reject(new Error(translate('ru', 'imageCache.emptyUrl')))
        return
      }

      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error(translate('ru', 'imageCache.loadError')))
      image.src = imageUrl
    })
  }

  async function ensureWardrobeItemImage(wardrobeItemId: string, imageUrl: string) {
    const isAlreadyLoaded = imageByWardrobeItemId.value[wardrobeItemId] != null
    if (isAlreadyLoaded) {
      return imageByWardrobeItemId.value[wardrobeItemId]
    }

    const existingPromise = promiseByWardrobeItemId.get(wardrobeItemId)
    if (existingPromise) {
      return existingPromise
    }

    const promise = loadImage(imageUrl)
    promiseByWardrobeItemId.set(wardrobeItemId, promise)

    const image = await promise
    imageByWardrobeItemId.value = { ...imageByWardrobeItemId.value, [wardrobeItemId]: image }
    return image
  }

  async function ensureWardrobeItemImages(entries: Array<{ wardrobeItemId: string; imageUrl: string }>) {
    await Promise.all(
      entries.map(({ wardrobeItemId, imageUrl }) => ensureWardrobeItemImage(wardrobeItemId, imageUrl)),
    )
  }

  return {
    ensureWardrobeItemImage,
    ensureWardrobeItemImages,
    imageByWardrobeItemId,
  }
}

export { useKonvaImageCache }

