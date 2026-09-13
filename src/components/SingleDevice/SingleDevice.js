import { useState } from "react";

import SingleDeviceSettings from "../SingleDeviceSettings/SingleDeviceSettings";
import SingleDeviceGame from "../SingleDeviceGame/SingleDeviceGame";
import "./SingleDevice.css";

function SingleDevice() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  const startGame = () => {
    setIsSettingsOpen(false);
  };

  const openSettings = () => {
    setIsSettingsOpen(true);
  };

  if (isSettingsOpen) {
    return <SingleDeviceSettings startGame={startGame} />;
  }

  return <SingleDeviceGame openSettings={openSettings} />;
}

export default SingleDevice;
