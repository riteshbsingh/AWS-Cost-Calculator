import React, { useState, useRef } from "react";
import { FileText, Download, Save, Loader2, X } from "lucide-react";
// import jsPDF from 'jspdf'; 
// import html2canvas from 'html2canvas';
import { useNavigate } from "react-router-dom";
import { SaveReport } from "../api/addReport";

const CostReportComponent = ({
  formData = {},
  calculations = {},
  cloudBrokers = [],
  databases = [],
  onDownload,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [showClientPopup, setShowClientPopup] = useState(false);
  const [clientName, setClientName] = useState("");
  const [actionType, setActionType] = useState(null); // 'save' or 'download'
  const reportRef = useRef(null);
  const navigate = useNavigate()

  // Calculate total cost
  const calculateTotalCost = () => {
    let total = 0;
    const selectedCloudBroker = cloudBrokers.find((b) => b.id === formData.cloudBroker);
    const selectedDatabase = databases.find((d) => d.id === formData.database);

    if (selectedCloudBroker && calculations.monthlyMessages) {
      total += (calculations.monthlyMessages / 1000000) * selectedCloudBroker.pricing.messagesPerMillion;
    }

    if (selectedDatabase && calculations.monthlyData) {
      total += (calculations.monthlyData / 1024 / 1024) * selectedDatabase.pricing.storagePerGB;
    }

    if (formData.finalPlan?.monthlyCost) {
      total += parseFloat(formData.finalPlan.monthlyCost);
    }

    return total;
  };

  // Calculate per-machine daily cost
  const calculatePerMachineDailyCost = () => {
    const totalMonthlyCost = calculateTotalCost();
    const machines = formData.machines || 1;
    const daysInMonth = 30;
    return (totalMonthlyCost / machines / daysInMonth).toFixed(2);
  };

  // Calculate all machines daily cost
  const calculateAllMachinesDailyCost = () => {
    const totalMonthlyCost = calculateTotalCost();
    const daysInMonth = 30;
    return (totalMonthlyCost / daysInMonth).toFixed(2);
  };

  const totalCost = calculateTotalCost();
  const selectedCloudBroker = cloudBrokers.find((b) => b.id === formData.cloudBroker);
  const selectedDatabase = databases.find((d) => d.id === formData.database);

const handleSave = async (client) => {
    if (!SaveReport) return;
    setIsSaving(true);
    setSaveStatus("");
    try {
      const reportData = {
        clientName: client,
        formData,
        calculations,
        totalCost,
        timestamp: new Date().toISOString(),
        selectedServices: { cloudBroker: selectedCloudBroker, database: selectedDatabase },
      };
      const result = await SaveReport(reportData);
      if (result.success) {
        setSaveStatus(result.message);
        navigate("/reports")
      } else {
        setSaveStatus(result.message);
      }
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      setSaveStatus("Failed to save report. Please try again.");
      setTimeout(() => setSaveStatus(""), 3000);
    } finally {
      setIsSaving(false);
      setShowClientPopup(false);
      setClientName("");
    }
  };

  // const handleDownload = async (client) => {
  //   setIsDownloading(true);
  //   try {
  //     if (!client) {
  //       throw new Error("Client name is required");
  //     }

  //     if (!jsPDF || !html2canvas) {
  //       throw new Error("Required libraries (jsPDF or html2canvas) not loaded");
  //     }

  //     const reportElement = reportRef.current;
  //     const canvas = await html2canvas(reportElement, { scale: 2 });
  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF({
  //       orientation: "portrait",
  //       unit: "px",
  //       format: [canvas.width, canvas.height],
  //     });

  //     pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
  //     pdf.save(`cost-report-${client}-${new Date().toISOString().split("T")[0]}.pdf`);
  //   } catch (error) {
  //     console.error("Download failed:", error);
  //     setSaveStatus("Failed to download PDF. Please try again.");
  //     setTimeout(() => setSaveStatus(""), 3000);
  //   } finally {
  //     setIsDownloading(false);
  //     setShowClientPopup(false);
  //     setClientName("");
  //   }
  // };

  const handleActionClick = (type) => {
    setActionType(type);
    setShowClientPopup(true);
  };

  const handlePopupSubmit = () => {
    if (!clientName.trim()) {
      setSaveStatus("Please enter a client name.");
      return;
    }
    if (actionType === "save") {
      handleSave(clientName);
    } else if (actionType === "download") {
      // handleDownload(clientName);
    }
  };

  const formatVMService = () => {
    if (!formData.provider || !formData.vmService) return "Not selected";
    return `${formData.provider.toUpperCase()} - ${formData.vmService.charAt(0).toUpperCase() + formData.vmService.slice(1)}`;
  };

  return (
    <div className="relative max-w-7xl mx-auto p-8">
      {/* Load jsPDF and html2canvas via script tags */}
      <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>

      {/* Client Name Popup */}
      {showClientPopup && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Enter Client Name</h3>
              <button onClick={() => setShowClientPopup(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Client Name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => setShowClientPopup(false)}
                className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handlePopupSubmit}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                {isSaving ? <Loader2 className="animate-spin" size={20} /> : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Content */}
      <div ref={reportRef} className="bg-white shadow-2xl rounded-2xl border border-gray-200 print:shadow-none print:border-none">
        {/* Header */}
        <div className="text-center mb-10 border-b pb-6">
          <FileText className="mx-auto mb-4 text-indigo-600" size={56} />
          <h1 className="text-4xl font-extrabold text-gray-900">IoT Infrastructure Cost Report</h1>
          <p className="text-gray-600 mt-2 text-lg">
            Comprehensive Cost Summary for {clientName || "Client"}
          </p>
          <div className="text-sm text-gray-500 mt-1">
            Generated on Sunday, June 22, 2025 at 02:32 PM IST
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 print:hidden">
          <button
            onClick={() => handleActionClick("save")}
            disabled={isSaving || isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {isSaving ? "Saving..." : "Save Report"}
          </button>
          {/* <button
            onClick={() => handleActionClick("download")}
            disabled={isSaving || isDownloading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
            {isDownloading ? "Downloading..." : "Download PDF"}
          </button> */}
          {saveStatus && (
            <div className={`text-sm font-medium ${saveStatus.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {saveStatus}
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="mb-8 px-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cost Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gradient-to-br from-indigo-600 to-purple-600 p-6 rounded-xl text-white">
            <div className="text-center">
              <p className="text-3xl font-extrabold mb-2">${totalCost.toFixed(2)}</p>
              <p className="text-indigo-100 text-sm">Monthly Cost</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold mb-2">${(totalCost * 12).toFixed(2)}</p>
              <p className="text-indigo-100 text-sm">Annual Cost</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold mb-2">${calculateAllMachinesDailyCost()}</p>
              <p className="text-indigo-100 text-sm">Daily Cost (All Machines)</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold mb-2">${calculatePerMachineDailyCost()}</p>
              <p className="text-indigo-100 text-sm">Daily Cost per Machine</p>
            </div>
          </div>
        </div>

        {/* Configuration and Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 px-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Device Configuration</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Machines:</span>
                <span className="font-semibold text-gray-900">{formData.machines || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Tags per Machine:</span>
                <span className="font-semibold text-gray-900">{formData.tagsPerMachine || 0}</span>
              </div>
              <div className="flex justify-between py-2 bg-white px-3 rounded-lg">
                <span className="text-gray-600 font-medium">Total Tags:</span>
                <span className="font-bold text-indigo-600">{(formData.machines || 0) * (formData.tagsPerMachine || 0)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Message Size:</span>
                <span className="font-semibold text-gray-900">{formData.messageSize || 0} KB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Frequency:</span>
                <span className="font-semibold text-gray-900">{formData.frequency || 0} seconds</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">IoT Gateways:</span>
                <span className="font-semibold text-gray-900">{formData.iotGateways || 0}</span>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Data Metrics</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Messages/Month:</span>
                <span className="font-semibold text-gray-900">{(calculations.monthlyMessages || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Messages/Year:</span>
                <span className="font-semibold text-gray-900">{(calculations.yearlyMessages || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Messages/Day (All Machines):</span>
                <span className="font-semibold text-gray-900">{((calculations.monthlyMessages || 0) / 30).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Messages/Day (Per Machine):</span>
                <span className="font-semibold text-gray-900">{((calculations.monthlyMessages || 0) / (formData.machines || 1) / 30).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Data/Month:</span>
                <span className="font-semibold text-gray-900">{((calculations.monthlyData || 0) / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Data/Year:</span>
                <span className="font-semibold text-gray-900">{((calculations.yearlyData || 0) / 1024 / 1024).toFixed(2)} GB</span>
              </div>
              <div className="flex justify-between py-2 bg-white px-3 rounded-lg">
                <span className="text-gray-600 font-medium">Data/Day (Per Machine):</span>
                <span className="font-bold text-indigo-600">{(((calculations.monthlyData || 0) / 1024 / 1024) / (formData.machines || 1) / 30).toFixed(2)} GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure Services */}
        <div className="mb-8 px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Selected Infrastructure Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
              <h3 className="font-semibold text-green-800 mb-3 text-lg">Cloud Broker</h3>
              <p className="text-green-700 font-medium">{selectedCloudBroker ? selectedCloudBroker.name : "Not selected"}</p>
              {selectedCloudBroker && <p className="text-sm text-green-600 mt-2">${selectedCloudBroker.pricing.messagesPerMillion}/M messages</p>}
            </div>
            <div className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
              <h3 className="font-semibold text-purple-800 mb-3 text-lg">VM Service</h3>
              <p className="text-purple-700 font-medium">{`${formData.finalPlan.provider} - ${formData.finalPlan.name}`}</p>
              {formData.finalPlan?.monthlyCost && <p className="text-sm text-purple-600 mt-2">${parseFloat(formData.finalPlan.monthlyCost).toFixed(2)}/month</p>}
            </div>
            <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
              <h3 className="font-semibold text-orange-800 mb-3 text-lg">Data Storage</h3>
              <p className="text-orange-700 font-medium">{selectedDatabase ? selectedDatabase.name : "Not selected"}</p>
              {selectedDatabase && <p className="text-sm text-orange-600 mt-2">${selectedDatabase.pricing.storagePerGB}/GB</p>}
            </div>
          </div>
        </div>

        {/* Detailed Cost Breakdown */}
        <div className="px-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Cost Breakdown</h2>
          <div className="space-y-4">
            {selectedCloudBroker && (
              <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg">
                <div>
                  <span className="text-gray-800 font-medium">{selectedCloudBroker.name}</span>
                  <p className="text-sm text-gray-600">{(calculations.monthlyMessages / 1000000).toFixed(2)}M messages</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-green-600 text-lg">${((calculations.monthlyMessages / 1000000) * selectedCloudBroker.pricing.messagesPerMillion).toFixed(2)}/month</span>
                  <p className="text-sm text-gray-600">${(((calculations.monthlyMessages / 1000000) * selectedCloudBroker.pricing.messagesPerMillion) / 30).toFixed(2)}/day</p>
                </div>
              </div>
            )}
            {selectedDatabase && (
              <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg">
                <div>
                  <span className="text-gray-800 font-medium">{selectedDatabase.name}</span>
                  <p className="text-sm text-gray-600">{((calculations.monthlyData || 0) / 1024 / 1024).toFixed(2)} GB storage</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-orange-600 text-lg">${(((calculations.monthlyData || 0) / 1024 / 1024) * selectedDatabase.pricing.storagePerGB).toFixed(2)}/month</span>
                  <p className="text-sm text-gray-600">${((((calculations.monthlyData || 0) / 1024 / 1024) * selectedDatabase.pricing.storagePerGB) / 30).toFixed(2)}/day</p>
                </div>
              </div>
            )}
            {formData.provider && formData.finalPlan?.monthlyCost && (
              <div className="flex justify-between items-center py-3 px-4 bg-purple-50 rounded-lg">
                <div>
                  <span className="text-gray-800 font-medium">{`${formData.finalPlan.provider} - ${formData.finalPlan.name}`}</span>
                  <p className="text-sm text-gray-600">Virtual Machine Service</p>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-600 text-lg">${parseFloat(formData.finalPlan.monthlyCost).toFixed(2)}/month</span>
                  <p className="text-sm text-gray-600">${(parseFloat(formData.finalPlan.monthlyCost) / 30).toFixed(2)}/day</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostReportComponent;