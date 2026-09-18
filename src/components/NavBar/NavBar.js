import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import LanguageIcon from "@mui/icons-material/Language";
import ListAltIcon from "@mui/icons-material/ListAlt";

import logo from "../../logo.svg";
import "./NavBar.css";

import "../../i18n";
import { useLanguage } from "../../hooks/useLanguage";
import LocationsModal from "../LocationsModal/LocationsModal";

function NavBar() {
  const { currentLanguage, languages, changeLanguage, translate } = useLanguage();
  const [isLocationsOpen, setIsLocationsOpen] = useState(false);

  // Locations are relevant on every screen the game is reachable from, so
  // the button lives in the always-visible NavBar rather than being tied to
  // a single route.
  const customLocations = useSelector((state) => state.settings?.customLocations ?? []);

  return (
    <header className="navbar-container">
      <div className="navbar-start">
        <FormControl size="small" variant="standard" className="lang-select-control">
          <Select
            value={currentLanguage}
            onChange={(event) => changeLanguage(event.target.value)}
            disableUnderline
            displayEmpty
            className="lang-select"
            aria-label={translate("Select language")}
            renderValue={() => (
              <span className="lang-select-value">
                <LanguageIcon fontSize="medium" />
              </span>
            )}
          >
            {languages.map((language) => (
              <MenuItem key={language.code} value={language.code}>
                {language.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <IconButton
          className="locations-nav-btn"
          onClick={() => setIsLocationsOpen(true)}
          aria-label={translate("View Locations")}
          title={translate("View Locations")}
        >
          <ListAltIcon fontSize="medium" />
        </IconButton>
      </div>

      <Link to="/">
        <div className="game-name">{translate("Spyfall")} 🕵️</div>
      </Link>
      <img className="logo" src={logo} alt="" />

      <LocationsModal
        open={isLocationsOpen}
        onClose={() => setIsLocationsOpen(false)}
        customLocations={customLocations}
      />
    </header>
  );
}

export default NavBar;
