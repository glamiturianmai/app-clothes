import { messages, translate, type LocaleCode } from '~/locales/messages'

function useAppI18n() {
  const locale = useState<LocaleCode>('app-locale', () => 'ru')

  function t(key: string, params?: Record<string, string | number>) {
    return translate(locale.value, key, params)
  }

  return {
    locale,
    locales: Object.keys(messages) as LocaleCode[],
    t,
  }
}

export { useAppI18n }
