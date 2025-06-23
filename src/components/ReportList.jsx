import React, { useState, useEffect, useRef } from "react";
import { FileText, Eye, X, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ReportListComponent = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedReport, setSelectedReport] = useState(null);
  const modalRef = useRef(null);
  const navigate = useNavigate()

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError("");
      try {
        const response = await fetch(`https://aws-calculator-backend.onrender.com/reports`);
        if (!response.ok) {
          throw new Error(`Failed to fetch reports: ${response.statusText}`);
        }
        const result = await response.json();
        if (result.success) {
          setReports(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        setError(`Error fetching reports: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Handle outside click to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setSelectedReport(null);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setSelectedReport(null);
      }
    };

    if (selectedReport) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
      // Restore body scroll
      document.body.style.overflow = 'unset';
    };
  }, [selectedReport]);

  // Calculate per-machine daily cost
  const calculatePerMachineDailyCost = (report) => {
    const totalMonthlyCost = report.totalCost;
    const machines = report.formData.machines || 1;
    const daysInMonth = 30;
    return (totalMonthlyCost / machines / daysInMonth).toFixed(2);
  };

  // Calculate all machines daily cost
  const calculateAllMachinesDailyCost = (report) => {
    const totalMonthlyCost = report.totalCost;
    const daysInMonth = 30;
    return (totalMonthlyCost / daysInMonth).toFixed(2);
  };

  const formatVMService = (formData) => {
    if (!formData.provider || !formData.vmService) return "Not selected";
    return `${formData.provider.toUpperCase()} - ${formData.vmService.charAt(0).toUpperCase() + formData.vmService.slice(1)}`;
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    });
  };

  return (
    <div className="relative max-w-7xl mx-auto p-8">
      {/* Reports Table */}
      <div className="bg-white shadow-2xl rounded-2xl border border-gray-200 p-6">
        <div className="flex flex-row justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Saved Reports</h2>
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </div>
        {isLoading ? (
          <div className="text-center text-gray-600 py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-2">Loading reports...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-600 py-8 bg-red-50 rounded-lg border border-red-200">
            <p className="font-medium">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center text-gray-600 py-8">
            <FileText className="mx-auto mb-4 text-gray-400" size={48} />
            <p>No reports found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timestamp
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr key={report._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {report.clientName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="font-bold text-green-600">${report.totalCost.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatTimestamp(report.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        <Eye size={16} />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report View Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur effect */}
          <div className="absolute inset-0 bg-opacity-30 bg-black-200 backdrop-blur-sm"></div>

          {/* Modal Content */}
          <div
            ref={modalRef}
            className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full h-[95vh] overflow-hidden flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-2 border-b border-gray-200 bg-gray-50">
              <h3 className="text-2xl font-bold text-gray-900">
                Report for {selectedReport.clientName}
              </h3>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 70px)' }}>
              {/* Report Content */}
              <div className="bg-white rounded-xl">
                {/* Header */}
                <div className="text-center mb-8 pb-6 border-b border-gray-200">
                  <FileText className="mx-auto mb-4 text-indigo-600" size={56} />
                  <h1 className="text-3xl font-extrabold text-gray-900">
                    IoT Infrastructure Cost Report
                  </h1>
                  <p className="text-gray-600 mt-2 text-lg">
                    Comprehensive Cost Summary for {selectedReport.clientName}
                  </p>
                  <div className="text-sm text-gray-500 mt-1">
                    Generated on {formatTimestamp(selectedReport.timestamp)}
                  </div>
                </div>

                {/* Summary Section */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Cost Summary</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gradient-to-br from-indigo-600 to-purple-700 p-6 rounded-xl text-white">
                    <div className="text-center">
                      <p className="text-3xl font-extrabold mb-2">
                        ${selectedReport.totalCost.toFixed(2)}
                      </p>
                      <p className="text-indigo-100 text-sm">Monthly Cost</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-extrabold mb-2">
                        ${(selectedReport.totalCost * 12).toFixed(2)}
                      </p>
                      <p className="text-indigo-100 text-sm">Annual Cost</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-extrabold mb-2">
                        ${calculateAllMachinesDailyCost(selectedReport)}
                      </p>
                      <p className="text-indigo-100 text-sm">Daily Cost (All Machines)</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-extrabold mb-2">
                        ${calculatePerMachineDailyCost(selectedReport)}
                      </p>
                      <p className="text-indigo-100 text-sm">Daily Cost per Machine</p>
                    </div>
                  </div>
                </div>

                {/* Configuration and Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Device Configuration
                    </h2>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Machines:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedReport.formData.machines || 0}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Tags per Machine:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedReport.formData.tagsPerMachine || 0}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 bg-white px-3 rounded-lg">
                        <span className="text-gray-600 font-medium">Total Tags:</span>
                        <span className="font-bold text-indigo-600">
                          {(selectedReport.formData.machines || 0) *
                            (selectedReport.formData.tagsPerMachine || 0)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Message Size:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedReport.formData.messageSize || 0} KB
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Frequency:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedReport.formData.frequency || 0} seconds
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">IoT Gateways:</span>
                        <span className="font-semibold text-gray-900">
                          {selectedReport.formData.iotGateways || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Data Metrics</h2>
                    <div className="space-y-3">
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Messages/Month:</span>
                        <span className="font-semibold text-gray-900">
                          {(selectedReport.calculations.monthlyMessages || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Messages/Year:</span>
                        <span className="font-semibold text-gray-900">
                          {(selectedReport.calculations.yearlyMessages || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Messages/Day (All Machines):</span>
                        <span className="font-semibold text-gray-900">
                          {((selectedReport.calculations.monthlyMessages || 0) / 30).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Messages/Day (Per Machine):</span>
                        <span className="font-semibold text-gray-900">
                          {((selectedReport.calculations.monthlyMessages || 0) /
                            (selectedReport.formData.machines || 1) /
                            30).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Data/Month:</span>
                        <span className="font-semibold text-gray-900">
                          {((selectedReport.calculations.monthlyData || 0) / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-600">Data/Year:</span>
                        <span className="font-semibold text-gray-900">
                          {((selectedReport.calculations.yearlyData || 0) / 1024 / 1024).toFixed(2)} GB
                        </span>
                      </div>
                      <div className="flex justify-between py-2 bg-white px-3 rounded-lg">
                        <span className="text-gray-600 font-medium">Data/Day (Per Machine):</span>
                        <span className="font-bold text-indigo-600">
                          {(((selectedReport.calculations.monthlyData || 0) / 1024 / 1024) /
                            (selectedReport.formData.machines || 1) /
                            30).toFixed(2)} GB
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Infrastructure Services */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Selected Infrastructure Services
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-gradient-to-br from-green-500 to-green-600 rounded-xl text-white">
                      <h3 className="font-semibold mb-3 text-lg">Cloud Broker</h3>
                      <p className="font-medium">
                        {selectedReport.selectedServices.cloudBroker
                          ? selectedReport.selectedServices.cloudBroker.name
                          : "Not selected"}
                      </p>
                      {selectedReport.selectedServices.cloudBroker && (
                        <p className="text-sm mt-2 opacity-90">
                          ${selectedReport.selectedServices.cloudBroker.pricing.messagesPerMillion}/M messages
                        </p>
                      )}
                    </div>
                    <div className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl text-white">
                      <h3 className="font-semibold mb-3 text-lg">VM Service</h3>
                      <p className="font-medium">
                        {`${selectedReport.formData.finalPlan.provider} - ${selectedReport.formData.finalPlan.name}`}
                      </p>
                      {selectedReport.formData.finalPlan?.monthlyCost && (
                        <p className="text-sm mt-2 opacity-90">
                          ${parseFloat(selectedReport.formData.finalPlan.monthlyCost).toFixed(2)}/month
                        </p>
                      )}
                    </div>
                    <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl text-white">
                      <h3 className="font-semibold mb-3 text-lg">Data Storage</h3>
                      <p className="font-medium">
                        {selectedReport.selectedServices.database
                          ? selectedReport.selectedServices.database.name
                          : "Not selected"}
                      </p>
                      {selectedReport.selectedServices.database && (
                        <p className="text-sm mt-2 opacity-90">
                          ${selectedReport.selectedServices.database.pricing.storagePerGB}/GB
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Detailed Cost Breakdown */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Detailed Cost Breakdown</h2>
                  <div className="space-y-4">
                    {selectedReport.selectedServices.cloudBroker && (
                      <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg border border-green-200">
                        <div>
                          <span className="text-gray-800 font-medium">
                            {selectedReport.selectedServices.cloudBroker.name}
                          </span>
                          <p className="text-sm text-gray-600">
                            {(selectedReport.calculations.monthlyMessages / 1000000).toFixed(2)}M messages
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-green-600 text-lg">
                            ${((selectedReport.calculations.monthlyMessages / 1000000) *
                              selectedReport.selectedServices.cloudBroker.pricing.messagesPerMillion).toFixed(2)}/month
                          </span>
                          <p className="text-sm text-gray-600">
                            ${(((selectedReport.calculations.monthlyMessages / 1000000) *
                              selectedReport.selectedServices.cloudBroker.pricing.messagesPerMillion) /
                              30).toFixed(2)}/day
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedReport.selectedServices.database && (
                      <div className="flex justify-between items-center py-3 px-4 bg-orange-50 rounded-lg border border-orange-200">
                        <div>
                          <span className="text-gray-800 font-medium">
                            {selectedReport.selectedServices.database.name}
                          </span>
                          <p className="text-sm text-gray-600">
                            {((selectedReport.calculations.monthlyData || 0) / 1024 / 1024).toFixed(2)} GB storage
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-orange-600 text-lg">
                            ${(((selectedReport.calculations.monthlyData || 0) / 1024 / 1024) *
                              selectedReport.selectedServices.database.pricing.storagePerGB).toFixed(2)}/month
                          </span>
                          <p className="text-sm text-gray-600">
                            ${((((selectedReport.calculations.monthlyData || 0) / 1024 / 1024) *
                              selectedReport.selectedServices.database.pricing.storagePerGB) /
                              30).toFixed(2)}/day
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedReport.formData.provider &&
                      selectedReport.formData.finalPlan?.monthlyCost && (
                        <div className="flex justify-between items-center py-3 px-4 bg-purple-50 rounded-lg border border-purple-200">
                          <div>
                            <span className="text-gray-800 font-medium">
                              {`${selectedReport.formData.finalPlan.provider} - ${selectedReport.formData.finalPlan.name}`}
                            </span>
                            <p className="text-sm text-gray-600">Virtual Machine Service</p>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-purple-600 text-lg">
                              ${parseFloat(selectedReport.formData.finalPlan.monthlyCost).toFixed(2)}/month
                            </span>
                            <p className="text-sm text-gray-600">
                              ${(parseFloat(selectedReport.formData.finalPlan.monthlyCost) / 30).toFixed(2)}/day
                            </p>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-2 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportListComponent;