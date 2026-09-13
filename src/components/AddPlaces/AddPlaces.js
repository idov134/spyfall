import { useTranslation } from "react-i18next";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

import "./AddPlaces.css";

import isEmptyArray from "../../utils";

function AddedPlace({ addedPlace, index, handleRemove }) {
  return (
    <div className="added-place">
      <div className="place-text">
        {addedPlace.length > 8 ? `${addedPlace.slice(0, 8)}...` : addedPlace}
      </div>
      <RemoveIcon
        className="change-btn delete"
        onClick={() => handleRemove(index)}
      />
    </div>
  );
}

function AddPlaces({ handleRemove, addedPlaces, openAddPlace }) {
  const { t } = useTranslation();
  return (
    <div className="add-places-setting">
      <button onClick={openAddPlace} className="add-place-btn">
        <AddIcon fontSize="small" />
        {t("Add Places")}
      </button>

      {!isEmptyArray(addedPlaces) && (
        <div className="added-places">
          {addedPlaces.map((addedPlace, index) => (
            <AddedPlace
              key={`${addedPlace}-${index}`}
              addedPlace={addedPlace}
              index={index}
              handleRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default AddPlaces;
