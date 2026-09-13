import { useTranslation } from "react-i18next";

import "./OptionsCard.css";

function OptionCard({ index, opened, openCard }) {
  const { t } = useTranslation();
  return (
    <div
      className={`card-option ${opened ? "opened" : ""}`}
      onClick={() => openCard(index)}
    >
      {t("Player")} {index}
    </div>
  );
}

export default OptionCard;
