import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import "./AddPlaces.css";

function CustomLocationChip({ location, onRemove }) {
  const { t } = useTranslation();
  const displayName =
    location.name.length > 12 ? `${location.name.slice(0, 12)}...` : location.name;

  return (
    <div className="added-place">
      <div className="place-text" title={location.name}>
        {displayName}
      </div>
      <button
        type="button"
        className="change-btn delete"
        aria-label={t("Remove location: {{name}}", { name: location.name })}
        onClick={() => onRemove(location.id)}
      >
        <RemoveIcon fontSize="small" />
      </button>
    </div>
  );
}

function AddPlaces({ handleRemove, customLocations, openAddPlace }) {
  const { t } = useTranslation();
  return (
    <div className="add-places-setting">
      <button type="button" onClick={openAddPlace} className="add-place-btn">
        <AddIcon fontSize="small" />
        {t("Add Places")}
      </button>

      {customLocations.length > 0 && (
        <div className="added-places">
          {customLocations.map((location) => (
            <CustomLocationChip key={location.id} location={location} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
}

export default AddPlaces;
