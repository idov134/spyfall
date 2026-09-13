import { Link } from "react-router-dom";

import LanguageIcon from "@mui/icons-material/Language";
import logo from "../../logo.svg";
import "./NavBar.css";

import "../../i18n";
import { useLanguage } from "../../hooks/useLanguage";

function NavBar() {
  const { toggleLanguage, translate } = useLanguage();

  return (
    <header className="navbar-container">
      <div className="lang-icon" onClick={toggleLanguage}>
        <LanguageIcon fontSize="large" />
      </div>
      <Link to="/">
        <div className="game-name">{translate("Spyfall")} 🕵️</div>
      </Link>
      <img className="logo" src={logo} alt="" />
    </header>
  );
}

export default NavBar;
