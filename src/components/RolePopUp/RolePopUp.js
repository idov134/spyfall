import { useTranslation } from "react-i18next";

import "./RolePopUp.css";

function RolePopUp({ value, handleClose, place }) {
  const { t } = useTranslation();

  return (
    <div className="popup-overlay">
      <div className="popup">
        <button className="close-btn" onClick={handleClose}>
          X
        </button>
        <div className="popup-content">
          {value === "Spy" ? <h1>{t("You're The Spy")}</h1> : <h1>{place}</h1>}
        </div>
      </div>
    </div>
  );
}

export default RolePopUp;
