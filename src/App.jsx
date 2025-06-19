// src/App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Page1DeviceConfig from './pages/Page1DeviceConfig';
import Page2CloudBroker from './pages/Page2CloudBroker';
import Page3MQTTBroker from './pages/Page3MQTTBroker';
import Page4Storage from './pages/Page4Storage';
import FinalSummary from './pages/FinalSummary';
import IIoTCostCalculator from './components/IIoTCostCalculator';
import AWSIoTCoreCalculator from './components/AwsIoTCoreCalculator';
import IiotCalculator from './components/IiotCalculator';

function App() {
  return (
    <AppProvider>
      {/* <AWSIoTCoreCalculator /> */}
      {/* <IiotCalculator /> */}
      <Router>
        <Routes>
          <Route path="/" element={<IIoTCostCalculator />} />
          <Route path="/cloud-broker" element={<Page2CloudBroker />} />
          <Route path="/mqtt-broker" element={<Page3MQTTBroker />} />
          <Route path="/storage" element={<Page4Storage />} />
          <Route path="/summary" element={<FinalSummary />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
