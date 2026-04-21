const messages = {
  ru: {
    app: {
      brand: 'Мой гардероб',
      nav: {
        wardrobe: 'Гардероб',
        outfits: 'Луки',
      },
    },
    common: {
      save: 'Сохранить',
      cancel: 'Отмена',
      delete: 'Удалить',
      reset: 'Сбросить',
      loading: 'Загружаю…',
    },
    home: {
      constructor: 'Конструктор',
    },
    outfits: {
      title: 'Луки',
      empty: 'Пока нет сохранённых образов.',
      noMatchByWeather: 'Нет луков под текущую температуру.',
      previewMissing: 'Нет превью',
      previewAlt: 'Превью лука {name}',
      itemsCount: '{count} предметов',
      filterByWeather: 'Подбор по погоде: {temp}°C',
      temperatureRange: '{min}° .. {max}°',
      deleteAria: 'Удалить лук',
      deleteConfirm: 'Удалить лук «{name}»?',
      resetFilter: 'Сбросить',
    },
    weather: {
      title: 'Погода сейчас',
      action: 'Подобрать по погоде',
      todayRange: 'Сегодня: {min}° / {max}°',
      errorLoad: 'Не удалось загрузить погоду',
      errorIncomplete: 'Данные погоды неполные',
      errorGeolocationUnavailable: 'Геолокация недоступна',
      errorGeolocationDenied: 'Нет доступа к геолокации',
      unknown: 'Неизвестно',
      codes: {
        0: 'Ясно',
        1: 'Преимущественно ясно',
        2: 'Переменная облачность',
        3: 'Пасмурно',
        45: 'Туман',
        48: 'Иней',
        51: 'Морось',
        53: 'Морось',
        55: 'Сильная морось',
        56: 'Ледяная морось',
        57: 'Ледяная морось',
        61: 'Дождь',
        63: 'Дождь',
        65: 'Сильный дождь',
        66: 'Ледяной дождь',
        67: 'Ледяной дождь',
        71: 'Снег',
        73: 'Снег',
        75: 'Сильный снег',
        77: 'Снежные зерна',
        80: 'Ливень',
        81: 'Ливень',
        82: 'Сильный ливень',
        85: 'Снегопад',
        86: 'Сильный снегопад',
        95: 'Гроза',
        96: 'Гроза с градом',
        99: 'Гроза с градом',
      },
    },
    temperature: {
      from: 'От {value}°',
      to: 'До {value}°',
    },
    outfitDraft: {
      title: 'Луки',
      existingOutfits: 'Существующие луки',
      newOutfitOption: '— новый лук —',
      name: 'Название',
      namePlaceholder: 'Название лука',
      temperature: 'Температура',
      newOutfit: 'Новый лук',
      statusNew: 'Новый лук.',
      statusSaved: 'Сохранено: «{name}».',
      statusOpened: 'Открыт лук «{name}».',
      statusNotFound: 'Лук не найден.',
      errorNameRequired: 'Введите название лука.',
      errorSave: 'Не удалось сохранить лук. Попробуйте ещё раз.',
    },
    canvasToolbar: {
      toFront: 'На передний план',
      toBack: 'На задний план',
      deleteSelected: 'Удалить выбранное',
      clearCanvas: 'Очистить холст',
    },
    wardrobe: {
      title: 'Гардероб',
      addItem: '+ Добавить вещь',
      backToSections: '← Назад ко всем секциям',
      empty: 'В гардеробе пока нет вещей. Добавьте первую — с PNG на прозрачном фоне.',
      noResults: 'Ничего не найдено. Поменяйте фильтры.',
      removeConfirm: 'Удалить «{name}» из гардероба?',
      sectionEmpty: 'Нет вещей в этой категории',
      layer: 'Слой: {value}',
      filters: {
        season: 'Сезон',
        all: 'Все',
        tags: 'Теги вещей',
        tagsPlaceholder: 'выбрать / добавить тег',
        resetTitle: 'Сбросить фильтры',
      },
      form: {
        headingEdit: 'Редактировать вещь',
        headingNew: 'Новая вещь',
        name: 'Название',
        category: 'Категория',
        season: 'Сезон',
        tags: 'Теги',
        tagsPlaceholder: '— выберите тег —',
        imagePng: 'Изображение PNG',
        imageRequired: 'Добавьте PNG с прозрачным фоном.',
      },
      card: {
        addToCanvas: 'Добавить на холст',
        editItem: 'Изменить вещь',
        removeItem: 'Удалить вещь',
      },
      modal: {
        close: 'Закрыть',
      },
      categories: {
        outerwear: 'Верхняя одежда',
        top: 'Верх',
        bottom: 'Низ',
        shoes: 'Обувь',
        accessories: 'Аксессуары',
      },
      seasons: {
        spring: 'Весна',
        summer: 'Лето',
        autumn: 'Осень',
        winter: 'Зима',
        all: 'Всесезонно',
      },
      defaultTags: {
        theater: 'в театр',
        business: 'деловое',
        favorite: 'любимое',
        donate: 'отдать',
      },
    },
    tags: {
      removeAria: 'Убрать тег {tag}',
      placeholder: '— выберите тег —',
      addCustom: '+ Добавить свой тег...',
      prompt: 'Введите новый тег',
    },
    uploadcare: {
      uploadImage: 'Загрузить изображение',
      keyMissing: 'Не задан Uploadcare ключ. Добавьте NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY в .env.',
      pngOnly: 'Разрешена только PNG-картинка.',
      uploaded: 'Изображение загружено.',
      widgetLoadError: 'Не удалось загрузить Uploadcare Widget.',
      connectError: 'Не удалось подключить Uploadcare.',
    },
    imageCache: {
      emptyUrl: 'Пустой imageUrl',
      loadError: 'Не удалось загрузить изображение',
    },
    readPng: {
      needPng: 'Нужен файл в формате PNG.',
      fileTooLarge: 'Файл больше {sizeMb} МБ.',
      readError: 'Не удалось прочитать файл.',
      invalidContent: 'Содержимое не похоже на PNG.',
    },
  },
} as const

type LocaleCode = keyof typeof messages
type LocaleMessages = typeof messages.ru

function resolvePath(dict: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, part) => {
    if (!acc || typeof acc !== 'object') {
      return null
    }
    return (acc as Record<string, unknown>)[part] ?? null
  }, dict)
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template
  }
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`))
}

function translate(
  locale: LocaleCode,
  key: string,
  params?: Record<string, string | number>,
): string {
  const raw = resolvePath(messages[locale] as unknown as Record<string, unknown>, key)
  if (typeof raw !== 'string') {
    return key
  }
  return interpolate(raw, params)
}

export { messages, translate }
export type { LocaleCode, LocaleMessages }
