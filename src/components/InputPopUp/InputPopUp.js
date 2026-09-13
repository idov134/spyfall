import { useTranslation } from "react-i18next";
import { useEffect, useRef, useState } from "react";

import "./InputPopUp.css";

function InputPopUp({ handleClose, handleSubmit, label, error }) {
  const { t } = useTranslation();
  const [value, setValue] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = () => handleSubmit(value);

  const onKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    } else if (event.key === "Escape") {
      handleClose();
    }
  };

  const dialogLabel = label || t("Add Places");

  return (
    <div className="popup-overlay" role="dialog" aria-modal="true" aria-label={dialogLabel}>
      <div className="popup">
        <button
          type="button"
          className="close-btn"
          onClick={handleClose}
          aria-label={t("Close")}
        >
          X
        </button>
        <div className="popup-content">
          <label htmlFor="new-location-input" className="visually-hidden">
            {dialogLabel}
          </label>
          <input
            id="new-location-input"
            ref={inputRef}
            type="text"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
          />
          <button type="button" className="add-place-button" onClick={submit}>
            {t("Add")}
          </button>
        </div>
        {error && (
          <div className="popup-error" role="alert">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default InputPopUp;
