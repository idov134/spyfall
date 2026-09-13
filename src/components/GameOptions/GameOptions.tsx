import GroupsIcon from "@mui/icons-material/Groups";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import React, { ReactElement, useMemo } from "react";
import "./GameOptions.css";
import { useTranslation } from "react-i18next";
import schema from "../../schema.json";
import { Link } from "react-router-dom";

const iconComponents: { [key: string]: React.ComponentType } = {
  SmartphoneIcon,
  GroupsIcon,
};

type Icon = {
  iconName: string;
  iconFont: string;
};
type Option = {
  name: string;
  link: string;
  implemented?: boolean;
  icon: Icon;
};

export const GameOptions = (): ReactElement => {
  const options = useMemo((): Array<Option> => schema.gameOptions, []);
  return (
    <div className="options">
      {options.map((option: Option) => (
        <GameOption key={option.link} option={option} />
      ))}
    </div>
  );
};

const GameOption = ({ option }: { option: Option }): ReactElement => {
  const { t } = useTranslation();
  const IconComponent = iconComponents[
    option.icon.iconName
  ] as React.ComponentType;
  const implemented = option.implemented !== false;

  const content = (
    <div className={`game-option${implemented ? "" : " disabled"}`}>
      <span className="btn-txt">{t(option.name)}</span>
      {IconComponent ? <IconComponent /> : null}
      {!implemented && (
        <span className="coming-soon">{t("Coming soon")}</span>
      )}
    </div>
  );

  if (!implemented) {
    return content;
  }

  return <Link to={option.link}>{content}</Link>;
};
