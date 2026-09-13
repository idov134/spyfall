import { useEffect, useState } from "react";
import i18n from "../i18n";
import { useTranslation } from "react-i18next";

export const useLanguage = () => {
  const [isEn, setIsEn] = useState(
    () => !String(i18n.language).toLowerCase().startsWith("he")
  );
  const { t } = useTranslation();

  useEffect(() => {
    const lang = isEn ? "en" : "he";
    i18n.changeLanguage(lang);
    document.documentElement.dir = i18n.dir(lang);
    document.documentElement.lang = lang;
  }, [isEn]);

  const toggleLanguage = () => setIsEn((prev) => !prev);
  const translate = (text) => t(text);

  return { isEn, toggleLanguage, translate };
};
