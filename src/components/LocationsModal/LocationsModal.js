import { useTranslation } from "react-i18next";

import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";

import { useLocationSearch } from "../../hooks/useLocationSearch";

import "./LocationsModal.css";

/**
 * Read-only reference of every location that can be dealt this round: the
 * built-in catalog merged with any custom locations the group added. Never
 * indicates which location is actually in play, so it's safe to open at any
 * point in the game without leaking the round's secret.
 */
function LocationsModal({ open, onClose, customLocations = [] }) {
  const { t } = useTranslation();
  const { search, setSearch, filteredLocations } = useLocationSearch(customLocations);

  const handleClose = () => {
    setSearch("");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="locations-modal-title">
      <div className="locations-modal">
        <div className="locations-modal-header">
          <h2 id="locations-modal-title">{t("All Locations")}</h2>
          <IconButton aria-label={t("Close")} onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </div>

        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder={t("Search locations…")}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="locations-search"
          autoFocus
        />

        <List className="locations-list">
          {filteredLocations.map((location) => (
            <ListItem key={location.id} className="locations-list-item">
              <ListItemText primary={location.name} />
            </ListItem>
          ))}
          {filteredLocations.length === 0 && (
            <ListItem>
              <ListItemText primary={t("No locations found")} />
            </ListItem>
          )}
        </List>
      </div>
    </Modal>
  );
}

export default LocationsModal;
