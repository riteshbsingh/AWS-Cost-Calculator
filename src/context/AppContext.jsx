// src/context/AppContext.jsx
import { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [config, setConfig] = useState({
    machines: 25,
    tagsPerMachine: 50,
    messageSizeKB: 1,
    frequencySec: 60,
    gateways: 1,
    deploymentType: 'single',
    coldStorageType: 's3',
    selectedCloudBroker: null,
    selectedMQTTBroker: null,
    selectedStorageOption: null,
  });

  return (
    <AppContext.Provider value={{ config, setConfig }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
