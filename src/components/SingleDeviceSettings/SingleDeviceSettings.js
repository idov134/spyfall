import { useTranslation } from "react-i18next";
import { useState } from "react";

import InputPopUp from "../InputPopUp/InputPopUp";
import AddPlaces from "../AddPlaces/AddPlaces";

import { isValidPlace } from "../../utils";

import "./SingleDeviceSettings.css";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsRunIcon from "@mui/icons-material/DirectionsRun";

import { useSelector, useDispatch } from "react-redux";
import {
  incPlayers,
  decPlayers,
  incSpies,
  decSpies,
  addPlace,
  removePlace,
} from "../../store/reducers/settingsReducer";

function SingleDeviceSettings({ startGame }) {
  const { t } = useTranslation();
  const players = useSelector((state) => state.settings.players);
  const spies = useSelector((state) => state.settings.spies);
  const addedPlaces = useSelector((state) => state.settings.addedPlaces);

  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const dispatch = useDispatch();

  const openAddPlace = () => {
    setIsPopUpOpen(true);
  };

  const handleClose = () => {
    setIsPopUpOpen(false);
  };

  const handleSubmit = (newPlace) => {
    const trimedNewPlace = newPlace.trim();
    if (!isValidPlace(trimedNewPlace)) return;
    setIsPopUpOpen(false);
    dispatch(addPlace({ newPlace: trimedNewPlace }));
  };

  const handleAdd = (index) => {
    dispatch(removePlace({ index }));
  };

  return (
    <>
      {isPopUpOpen && (
        <InputPopUp handleClose={handleClose} handleSubmit={handleSubmit} />
      )}
      <div className="settings-container page-container">
        <div className="title">{t("Game Settings")}</div>
        <div className="setting">
          <label className="setting-label">
            <PeopleIcon />
            {t("Total players")}:
          </label>
          <div className="setting-area">
            <RemoveIcon
              className="change-btn dec"
              onClick={() => dispatch(decPlayers())}
            />
            {players}
            <AddIcon
              className="change-btn inc"
              onClick={() => dispatch(incPlayers())}
            />
          </div>
        </div>
        <div className="setting">
          <label className="setting-label">
            <DirectionsRunIcon />
            {t("Total spies")}:
          </label>
          <div className="setting-area">
            <RemoveIcon
              className="change-btn dec"
              onClick={() => dispatch(decSpies())}
            />
            {spies}
            <AddIcon
              className="change-btn inc"
              onClick={() => dispatch(incSpies())}
            />
          </div>
        </div>
        <AddPlaces
          openAddPlace={openAddPlace}
          addedPlaces={addedPlaces}
          handleRemove={(index) => handleAdd(index)}
        />
        <div className="start-game-btn" onClick={startGame}>
          {t("Start Game")}
        </div>
      </div>
    </>
  );
}

export default SingleDeviceSettings;
