import React, { useState, useEffect } from 'react';
import { Server } from 'lucide-react';
import { findBestCloudPlans } from '../constants/commonFunctions';

export const Page4VMSelection = ({ 
  configuration, 
  onPlanSelected, 
  onNext 
}) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [recommendations, setRecommendations] = useState(null);

  // Calculate recommendations when component mounts or configuration changes
  useEffect(() => {
    if (configuration) {
      const recs = findBestCloudPlans(
        configuration.machines,
        configuration.messageSize,
        configuration.frequency,
        configuration.tagsPerMachine,
        configuration.concurrentUsers,
        configuration.storageDurationMonths
      );
      setRecommendations(recs);
    }
  }, [configuration]);

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
      recommendations.recommendedPlans.awsLightsail &&
      recommendations.recommendedPlans.awsLightsail !== "No suitable plan found"
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
      recommendations.recommendedPlans.awsEc2 &&
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

    if (
      recommendations.recommendedPlans.azure &&
      recommendations.recommendedPlans.azure !== "No suitable plan found"
    ) {
      plans.push({
        ...recommendations.recommendedPlans.azure,
        provider: "Azure",
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-600",
      });
    }

    if (
      recommendations.recommendedPlans.gcp &&
      recommendations.recommendedPlans.gcp !== "No suitable plan found"
    ) {
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
    if (!plan || !recommendations) return;

    // Prepare final plan data
    const finalPlan = {
      id: plan.id,
      name: plan.name,
      provider: plan.provider,
      monthlyCost: plan.totalMonthlyCost,
      annualCost: plan.totalMonthlyCost * 12,
      costBreakdown: plan.costBreakdown,
      specifications: {
        ram: plan.ram,
        cpu: plan.cpu,
        storage: plan.storage,
        transfer: plan.transfer,
      },
      workloadMatch: {
        requiredRam: recommendations.workload.requiredRamGB,
        requiredCpu: recommendations.workload.requiredCpu,
        requiredStorage: recommendations.workload.totalStorageRequiredGB,
        requiredTransfer: recommendations.workload.totalTransferRequiredTB,
      },
      notes: plan.notes,
      isCheapest: isCheapestPlan(plan)
    };

    // Determine cloud provider settings based on selected plan
    let providerSettings = {};
    
    if (plan.id && plan.id.includes("lightsail")) {
      providerSettings = {
        cloudProvider: "aws",
        vmService: "lightsail",
        lightsailPlan: plan.id
      };
    } else if (plan.id && plan.id.includes("ec2")) {
      providerSettings = {
        cloudProvider: "aws",
        vmService: "ec2",
        ec2Plan: plan.id
      };
    } else if (plan.id && plan.id.includes("azure")) {
      providerSettings = {
        cloudProvider: "azure",
        azureVm: plan.id
      };
    } else if (plan.id && plan.id.includes("gcp")) {
      providerSettings = {
        cloudProvider: "google",
        googleVm: plan.id
      };
    }
    // Call the parent component's callback with the final plan and provider settings
    onPlanSelected('finalPlan', finalPlan);

    setSelectedPlan(plan);
  };

  const handleConfirmPlan = () => {
    if (!selectedPlan || !recommendations) return;

    // Prepare final plan data
    const finalPlan = {
      id: selectedPlan.id,
      name: selectedPlan.name,
      provider: selectedPlan.provider,
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
      notes: selectedPlan.notes,
      isCheapest: isCheapestPlan(selectedPlan)
    };

    // Determine cloud provider settings based on selected plan
    let providerSettings = {};
    
    if (selectedPlan.id && selectedPlan.id.includes("lightsail")) {
      providerSettings = {
        cloudProvider: "aws",
        vmService: "lightsail",
        lightsailPlan: selectedPlan.id
      };
    } else if (selectedPlan.id && selectedPlan.id.includes("ec2")) {
      providerSettings = {
        cloudProvider: "aws",
        vmService: "ec2",
        ec2Plan: selectedPlan.id
      };
    } else if (selectedPlan.id && selectedPlan.id.includes("azure")) {
      providerSettings = {
        cloudProvider: "azure",
        azureVm: selectedPlan.id
      };
    } else if (selectedPlan.id && selectedPlan.id.includes("gcp")) {
      providerSettings = {
        cloudProvider: "google",
        googleVm: selectedPlan.id
      };
    }

    // Call the parent component's callback with the final plan and provider settings
    onPlanSelected('finalPlan', finalPlan);
    
    // Move to next page
    onNext(finalPlan);
  };

  if (!configuration) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Loading configuration...</p>
      </div>
    );
  }

  useEffect(() => {
    if (!selectedPlan || !recommendations) return;

    // Prepare final plan data
    const finalPlan = {
      id: selectedPlan.id,
      name: selectedPlan.name,
      provider: selectedPlan.provider || selectedPlan.service,
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
      notes: selectedPlan.notes,
      isCheapest: isCheapestPlan(selectedPlan)
    };

    // Determine cloud provider settings based on selected plan
    let providerSettings = {};
    
    if (selectedPlan.id && selectedPlan.id.includes("lightsail")) {
      providerSettings = {
        cloudProvider: "aws",
        vmService: "lightsail",
        awsLightsailPlan: selectedPlan.id
      };
    } else if (selectedPlan.id && selectedPlan.id.includes("ec2")) {
      providerSettings = {
        cloudProvider: "aws",
        vmService: "ec2",
        ec2Plan: selectedPlan.id
      };
    } else if (selectedPlan.id && selectedPlan.id.includes("azure")) {
      providerSettings = {
        cloudProvider: "azure",
        azureVm: selectedPlan.id
      };
    } else if (selectedPlan.id && selectedPlan.id.includes("gcp")) {
      providerSettings = {
        cloudProvider: "google",
        googleVm: selectedPlan.id
      };
    }
    // Call the parent component's callback with the final plan and provider settings
    onPlanSelected('finalPlan', finalPlan);
  }, selectedPlan)

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

      {/* Configuration Summary */}
      <div className="bg-gray-50 p-6 rounded-xl shadow-md">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Your Configuration
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 text-sm">
          <div>
            <span className="font-semibold text-gray-700">Machines:</span>
            <div className="text-blue-600">{configuration.machines}</div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Tags/Machine:</span>
            <div className="text-blue-600">{configuration.tagsPerMachine}</div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Message Size:</span>
            <div className="text-blue-600">{configuration.messageSize} KB</div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Frequency:</span>
            <div className="text-blue-600">{configuration.frequency}s</div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Users:</span>
            <div className="text-blue-600">{configuration.concurrentUsers}</div>
          </div>
          <div>
            <span className="font-semibold text-gray-700">Storage:</span>
            <div className="text-blue-600">{configuration.storageDurationMonths} months</div>
          </div>
        </div>
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
                {parseFloat(recommendations.workload.totalDataPerMonthGB).toFixed(2)} GB
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-700">
                Storage Required:
              </span>
              <div className="text-lg text-blue-600">
                {parseFloat(recommendations.workload.totalStorageRequiredGB).toFixed(2)} GB
              </div>
            </div>
            <div>
              <span className="font-semibold text-gray-700">
                Transfer Required:
              </span>
              <div className="text-lg text-blue-600">
                {parseFloat(recommendations.workload.totalTransferRequiredTB).toFixed(2)} TB
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

          {/* All Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {availablePlans.map((plan, index) => (
              <div
                key={plan.id || index}
                onClick={() => handlePlanSelection(plan)}
                className={`
                ${plan.bgColor} p-6 rounded-xl shadow-md border-2 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg
                ${
                  selectedPlan?.id === plan.id
                    ? "ring-4 ring-purple-400 border-purple-400 shadow-xl"
                    : plan.borderColor
                }
              `}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`text-black px-3 py-1 pl-0 rounded-md text-sm font-bold mr-3`}>
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
                      ` + Disk: $${plan.costBreakdown.managedDisk.toFixed(2)}`}
                    {plan.costBreakdown.persistentDisk > 0 &&
                      ` + Disk: $${plan.costBreakdown.persistentDisk.toFixed(2)}`}
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
                      {parseFloat(recommendations.workload.totalStorageRequiredGB).toFixed(1)} GB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transfer Needed:</span>
                    <span className="text-green-600">
                      {parseFloat(recommendations.workload.totalTransferRequiredTB).toFixed(2)} TB
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
