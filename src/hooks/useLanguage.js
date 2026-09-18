import { useEffect } from "react";
import { useTranslation } from "react-i18next";

// Add new languages here only — everything else (the NavBar dropdown,
// direction handling, persistence) scales automatically. `label` is the
// language's own native name and is intentionally not run through i18next,
// since a language's name should always be shown in that language.
export const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "he", label: "עברית" },
];

const DEFAULT_LANGUAGE_CODE = SUPPORTED_LANGUAGES[0].code;

function resolveSupportedCode(lang) {
  const normalized = String(lang || "").toLowerCase();
  const match = SUPPORTED_LANGUAGES.find((language) => normalized.startsWith(language.code));
  return match ? match.code : DEFAULT_LANGUAGE_CODE;
}

/**
 * Thin wrapper around i18next that exposes the current language, a list of
 * supported languages (for building a selector), and a setter. Keeps the
 * document's `dir`/`lang` attributes in sync so RTL languages (like Hebrew)
 * render correctly whenever the language changes.
 */
export const useLanguage = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = resolveSupportedCode(i18n.language);

  useEffect(() => {
    document.documentElement.dir = i18n.dir(currentLanguage);
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage, i18n]);

  const changeLanguage = (code) => {
    if (code && code !== currentLanguage) {
      i18n.changeLanguage(code);
    }
  };

  return {
    currentLanguage,
    languages: SUPPORTED_LANGUAGES,
    changeLanguage,
    translate: t,
  };
};
