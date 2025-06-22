import React, { useRef, useState } from "react";
import {
  ChevronRight,
  ChevronLeft,
  Calculator,
  Cloud,
  Database,
  MessageSquare,
  FileText,
  Check,
  Monitor,
  Server,
  Router,
} from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { findBestCloudPlans } from "../constants/commonFunctions";

const IIoTCostCalculator = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [plan, setPlan] = useState({});
  const page5Ref = useRef(null);
  const [formData, setFormData] = useState({
    // Page 1 - Device Configuration
    machines: 10,
    tagsPerMachine: 50,
    messageSize: 1, // KB
    frequency: 60, // seconds
    iotGateways: 2,
    connectionDuration: 43800,
    provider: "aws",
    lightsailPlan: "plan-5",
    ec2Plan: "ec2-t3a.nano",
    azureVm: "b1s",
    googleVm: "e2-micro",
    ebsStorage: 0,
    concurrentUsers: 20,
    storageDurationMonths: 1,

    // Page 2 - Cloud Broker
    cloudBroker: "aws-iot",
    cloudProvider: "aws",

    // Page 3 - MQTT Broker
    // mqttBroker: null,

    // Page 3 - Database
    database: "s3",

    // Page 3 - Database
    vmService: "lightsail",
    finalPlan: {},
  });

  const calculateMetrics = () => {
    // <p>Total Tags: {formData.machines * formData.tagsPerMachine}</p>
    //       <p>Messages per day per device: {Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24)}</p>
    //       <p>Messages per Day for all devices: {Math.round(Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24) * formData.machines)}</p>
    //       <p>Messages per Month for all Devices: {Math.round(Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24) * formData.machines) * 30}</p>
    //       <p className="md:col-span-2">Messages per Year for all Devices: {(Math.round(Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24) * formData.machines) * 30) * 12}</p>

    const totalTags = formData.machines * formData.tagsPerMachine;
    const messagesPerHour = Math.round(
      ((1 * formData.tagsPerMachine * formData.messageSize * 60) /
        formData.frequency) *
        60
    );
    const messagesPerDay = messagesPerHour * 24;
    const messagesPerMonth = messagesPerDay * 30;
    const messagesPerYear = messagesPerDay * 365;

    const dataPerMessage = formData.messageSize;
    const dataPerDevicePerMonth = messagesPerMonth * dataPerMessage;
    const dataAllDevicesPerMonth = dataPerDevicePerMonth * formData.machines;

    setCalculations({
      messagesPerDevice: messagesPerDay,
      messagesAllDevices: messagesPerDay * formData.machines,
      dataPerDevice: dataPerDevicePerMonth,
      dataAllDevices: dataAllDevicesPerMonth,
      monthlyMessages: messagesPerMonth * formData.machines,
      yearlyMessages: messagesPerYear * formData.machines,
      monthlyData: dataAllDevicesPerMonth,
      yearlyData: dataAllDevicesPerMonth * 12,
    });
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNext = () => {
    if (currentPage === 1) {
      calculateMetrics();
    }
    setCurrentPage((prev) => Math.min(prev + 1, 5));
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const renderPage1 = () => (
    // code
  );

  const renderPage2 = () => (
    // code
  );

  const renderPage3 = () => (
    // code
  );

  const renderPage4 = () => {
    // Add state for selected plan (initialize with cheapest option)
    const [selectedPlan, setSelectedPlan] = useState(null);

    // Calculate recommendations when workload data is available
    const recommendations = findBestCloudPlans(
      formData.machines,
      formData.messageSize,
      formData.frequency,
      formData.tagsPerMachine,
      formData.concurrentUsers,
      formData.storageDurationMonths
    );

    // Initialize selected plan with cheapest option when recommendations are available
    useEffect(() => {
      if (
        recommendations &&
        recommendations.comparison.cheapestOption &&
        !selectedPlan
      ) {
        setSelectedPlan(recommendations.comparison.cheapestOption);
      }
    }, [recommendations, selectedPlan]);

    // Get all available plans for selection
    const getAvailablePlans = () => {
      if (!recommendations) return [];

      const plans = [];

      if (
        recommendations.recommendedPlans.awsLightsail !==
        "No suitable plan found"
      ) {
        plans.push({
          ...recommendations.recommendedPlans.awsLightsail,
          provider: "AWS Lightsail",
          color: "orange",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-600",
        });
      }

      if (
        recommendations.recommendedPlans.awsEc2 !== "No suitable plan found"
      ) {
        plans.push({
          ...recommendations.recommendedPlans.awsEc2,
          provider: "AWS EC2",
          color: "yellow",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
          textColor: "text-yellow-600",
        });
      }

      if (recommendations.recommendedPlans.azure !== "No suitable plan found") {
        plans.push({
          ...recommendations.recommendedPlans.azure,
          provider: "Azure",
          color: "blue",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-600",
        });
      }

      if (recommendations.recommendedPlans.gcp !== "No suitable plan found") {
        plans.push({
          ...recommendations.recommendedPlans.gcp,
          provider: "Google Cloud",
          color: "red",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-600",
        });
      }

      return plans;
    };

    const availablePlans = getAvailablePlans();
    const isCheapestPlan = (plan) => {
      return recommendations?.comparison?.cheapestOption?.id === plan.id;
    };

    const handlePlanSelection = (plan) => {
      setSelectedPlan(plan);
    };

    const handleConfirmPlan = () => {
      if (!selectedPlan) return;

      // Update form data with selected plan
      if (selectedPlan.id && selectedPlan.id.includes("lightsail")) {
        handleInputChange("cloudProvider", "aws");
        handleInputChange("vmService", "lightsail");
        handleInputChange("lightsailPlan", selectedPlan.id);
      } else if (selectedPlan.id && selectedPlan.id.includes("ec2")) {
        handleInputChange("cloudProvider", "aws");
        handleInputChange("vmService", "ec2");
        handleInputChange("ec2Plan", selectedPlan.id);
      } else if (selectedPlan.id && selectedPlan.id.includes("azure")) {
        handleInputChange("cloudProvider", "azure");
        handleInputChange("azureVm", selectedPlan.id);
      } else if (selectedPlan.id && selectedPlan.id.includes("gcp")) {
        handleInputChange("cloudProvider", "google");
        handleInputChange("googleVm", selectedPlan.id);
      }

      // Store final costing information
      handleInputChange("finalPlan", {
        name: selectedPlan.name,
        provider: selectedPlan.id ? selectedPlan.id.split("-")[0] : "unknown",
        monthlyCost: selectedPlan.totalMonthlyCost,
        annualCost: selectedPlan.totalMonthlyCost * 12,
        costBreakdown: selectedPlan.costBreakdown,
        specifications: {
          ram: selectedPlan.ram,
          cpu: selectedPlan.cpu,
          storage: selectedPlan.storage,
          transfer: selectedPlan.transfer,
        },
        workloadMatch: {
          requiredRam: recommendations.workload.requiredRamGB,
          requiredCpu: recommendations.workload.requiredCpu,
          requiredStorage: recommendations.workload.totalStorageRequiredGB,
          requiredTransfer: recommendations.workload.totalTransferRequiredTB,
        },
      });

      handleNext();
    };

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <Server className="mx-auto mb-4 text-blue-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-800">
            Virtual Machine Selection
          </h2>
          <p className="text-gray-600">
            Configure your workload and get optimized cloud recommendations
          </p>
        </div>

        {/* Workload Summary */}
        {recommendations && (
          <div className="bg-green-50 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Workload Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">
                  Total Messages/Month:
                </span>
                <div className="text-lg text-blue-600">
                  {recommendations.workload.totalMessagesPerMonth.toLocaleString()}
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Data/Month:</span>
                <div className="text-lg text-blue-600">
                  {recommendations.workload.totalDataPerMonthGB} GB
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">
                  Storage Required:
                </span>
                <div className="text-lg text-blue-600">
                  {recommendations.workload.totalStorageRequiredGB} GB
                </div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">
                  Transfer Required:
                </span>
                <div className="text-lg text-blue-600">
                  {recommendations.workload.totalTransferRequiredTB} TB
                </div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">
                  Required RAM:
                </span>
                <span className="ml-2 text-blue-600">
                  {recommendations.workload.requiredRamGB} GB
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">
                  Required CPU:
                </span>
                <span className="ml-2 text-blue-600">
                  {recommendations.workload.requiredCpu} cores
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Plan Selection */}
        {recommendations && availablePlans.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">
                Available Cloud Plans
              </h3>
              <p className="text-sm text-gray-600">
                Click on a plan to select it
              </p>
            </div>

            {/* All Plans Grid - Now Clickable */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {availablePlans.map((plan, index) => (
                <div
                  key={plan.id || index}
                  onClick={() => handlePlanSelection(plan)}
                  className={`
                  ${
                    plan.bgColor
                  } p-6 rounded-xl shadow-md border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                  ${
                    selectedPlan?.id === plan.id
                      ? "ring-4 ring-purple-400 border-purple-400 shadow-xl"
                      : plan.borderColor
                  }
                `}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className={`bg-${plan.color}-500 text-white px-3 py-1 rounded-md text-sm font-semibold mr-3`}
                      >
                        {plan.provider}
                      </div>
                      {isCheapestPlan(plan) && (
                        <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                          BEST VALUE
                        </div>
                      )}
                    </div>
                    {selectedPlan?.id === plan.id && (
                      <div className="text-purple-600">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {plan.name}
                  </h4>
                  <p className={`text-xl font-bold ${plan.textColor} mb-2`}>
                    ${plan.totalMonthlyCost.toFixed(2)}/month
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>💾 RAM: {plan.ram} GB</div>
                    <div>🖥️ CPU: {plan.cpu} cores</div>
                    <div>💽 Storage: {plan.storage} GB</div>
                    {plan.transfer && <div>🌐 Transfer: {plan.transfer}</div>}
                  </div>

                  {plan.costBreakdown && (
                    <div className="text-xs text-gray-500 mt-2">
                      Instance: ${plan.costBreakdown.instanceCost.toFixed(2)}
                      {plan.costBreakdown.ebsStorage > 0 &&
                        ` + EBS: $${plan.costBreakdown.ebsStorage.toFixed(2)}`}
                      {plan.costBreakdown.managedDisk > 0 &&
                        ` + Disk: $${plan.costBreakdown.managedDisk.toFixed(
                          2
                        )}`}
                      {plan.costBreakdown.persistentDisk > 0 &&
                        ` + Disk: $${plan.costBreakdown.persistentDisk.toFixed(
                          2
                        )}`}
                      {plan.costBreakdown.dataTransfer > 0 &&
                        ` + Transfer: $${plan.costBreakdown.dataTransfer.toFixed(
                          2
                        )}`}
                      {plan.costBreakdown.bandwidth > 0 &&
                        ` + Bandwidth: $${plan.costBreakdown.bandwidth.toFixed(
                          2
                        )}`}
                      {plan.costBreakdown.networkEgress > 0 &&
                        ` + Egress: $${plan.costBreakdown.networkEgress.toFixed(
                          2
                        )}`}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-3">{plan.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selected Plan Summary */}
        {selectedPlan && (
          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">
              Selected Plan Summary
            </h3>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-xl shadow-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mr-3">
                      SELECTED PLAN
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800">
                      {selectedPlan.name}
                    </h4>
                    {isCheapestPlan(selectedPlan) && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold ml-3">
                        BEST VALUE
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600">{selectedPlan.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">
                    ${selectedPlan.totalMonthlyCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Plan Specifications */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Specifications
                  </h5>
                  <div className="text-sm space-y-1">
                    {selectedPlan.ram && (
                      <div>💾 RAM: {selectedPlan.ram} GB</div>
                    )}
                    {selectedPlan.cpu && (
                      <div>🖥️ CPU: {selectedPlan.cpu} cores</div>
                    )}
                    {selectedPlan.storage && (
                      <div>💽 Storage: {selectedPlan.storage} GB</div>
                    )}
                    {selectedPlan.transfer && (
                      <div>🌐 Transfer: {selectedPlan.transfer}</div>
                    )}
                  </div>
                </div>

                {/* Cost Breakdown */}
                {selectedPlan.costBreakdown && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-700 mb-2">
                      Cost Breakdown
                    </h5>
                    <div className="text-sm space-y-1">
                      <div>
                        Instance: $
                        {selectedPlan.costBreakdown.instanceCost.toFixed(2)}
                      </div>
                      {selectedPlan.costBreakdown.ebsStorage > 0 && (
                        <div>
                          EBS Storage: $
                          {selectedPlan.costBreakdown.ebsStorage.toFixed(2)}
                        </div>
                      )}
                      {selectedPlan.costBreakdown.managedDisk > 0 && (
                        <div>
                          Managed Disk: $
                          {selectedPlan.costBreakdown.managedDisk.toFixed(2)}
                        </div>
                      )}
                      {selectedPlan.costBreakdown.persistentDisk > 0 && (
                        <div>
                          Persistent Disk: $
                          {selectedPlan.costBreakdown.persistentDisk.toFixed(2)}
                        </div>
                      )}
                      {selectedPlan.costBreakdown.dataTransfer > 0 && (
                        <div>
                          Data Transfer: $
                          {selectedPlan.costBreakdown.dataTransfer.toFixed(2)}
                        </div>
                      )}
                      {selectedPlan.costBreakdown.bandwidth > 0 && (
                        <div>
                          Bandwidth: $
                          {selectedPlan.costBreakdown.bandwidth.toFixed(2)}
                        </div>
                      )}
                      {selectedPlan.costBreakdown.networkEgress > 0 && (
                        <div>
                          Network Egress: $
                          {selectedPlan.costBreakdown.networkEgress.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Annual Projection */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Annual Projection
                  </h5>
                  <div className="text-sm space-y-1">
                    <div className="text-lg font-bold text-green-600">
                      ${(selectedPlan.totalMonthlyCost * 12).toFixed(2)}
                    </div>
                    <div className="text-gray-600">Total yearly cost</div>
                    {!isCheapestPlan(selectedPlan) &&
                      recommendations?.comparison?.cheapestOption && (
                        <div className="text-red-600 text-xs mt-2">
                          Additional cost vs cheapest: $
                          {(
                            (selectedPlan.totalMonthlyCost -
                              recommendations.comparison.cheapestOption
                                .totalMonthlyCost) *
                            12
                          ).toFixed(2)}
                          /year
                        </div>
                      )}
                  </div>
                </div>

                {/* Resource Utilization */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-700 mb-2">
                    Resource Match
                  </h5>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>RAM Required:</span>
                      <span className="text-green-600">
                        {recommendations.workload.requiredRamGB} GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>CPU Required:</span>
                      <span className="text-green-600">
                        {recommendations.workload.requiredCpu} cores
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage Needed:</span>
                      <span className="text-green-600">
                        {recommendations.workload.totalStorageRequiredGB} GB
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer Needed:</span>
                      <span className="text-green-600">
                        {recommendations.workload.totalTransferRequiredTB} TB
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-purple-200">
                <button
                  className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  onClick={handleConfirmPlan}
                >
                  🚀 Confirm & Proceed with This Plan
                </button>
                {!isCheapestPlan(selectedPlan) &&
                  recommendations?.comparison?.cheapestOption && (
                    <button
                      className="bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                      onClick={() =>
                        handlePlanSelection(
                          recommendations.comparison.cheapestOption
                        )
                      }
                    >
                      💰 Switch to Cheapest Option
                    </button>
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPage5 = () => {
   // code
  };

  const canProceed = () => {
    // code
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="flex flex-row justify-center items-center gap-4 text-center">
            <Calculator className="mb-4 text-orange-500" size={48} />
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              IIoT Cost Calculator
            </h1>
          </div>

          {renderProgressBar()}

          <div className="mb-8">
            {currentPage === 1 && renderPage1()}
            {currentPage === 2 && renderPage2()}
            {currentPage === 3 && renderPage3()}
            {currentPage === 4 && renderPage4()}
            {/* {currentPage === 5 && renderPage5()} */}
            {currentPage === 5 && <div ref={page5Ref}>{renderPage5()}</div>}
          </div>

          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentPage === 1}
              className={`flex items-center px-6 py-2 rounded-lg font-medium ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-500 text-white hover:bg-gray-600"
              }`}
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous
            </button>

            <button
              onClick={currentPage === 5 ? handleDownload : handleNext}
              disabled={currentPage === 5 ? true : !canProceed()}
              className={`flex items-center px-6 py-2 rounded-lg font-medium ${
                currentPage === 5 || !canProceed()
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600"
              }`}
            >
              {currentPage === 5 ? "Download" : "Next"}
              {currentPage !== 5 && <ChevronRight size={20} className="ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IIoTCostCalculator;
