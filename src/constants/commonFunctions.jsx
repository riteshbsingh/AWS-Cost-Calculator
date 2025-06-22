import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AWS_EC2_PLANS, AWS_LIGHTSAIL_PLANS, azurePlans, gcpPlans } from './service_list';

export const handleDownload = async () => {
  const input = page5Ref.current;

  if (input) {
    const canvas = await html2canvas(input);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('iiot-cost-summary.pdf');
  }
};


export function findBestCloudPlans(
  machineCount,
  messageSizeKB,
  messageFrequencySec,
  tagsPerMachine,
  concurrentUsers,
  storageDurationMonths
) {
  // --- Workload calculations ---
  const messagesPerDayPerMachine = (86400 / messageFrequencySec) * tagsPerMachine;
  const totalMessagesPerMonth = messagesPerDayPerMachine * machineCount * 30;
  const totalDataPerMonthGB = (totalMessagesPerMonth * messageSizeKB) / (1024 * 1024); // in GB
  const totalStorageRequiredGB = totalDataPerMonthGB * storageDurationMonths * 1.3; // 30% buffer
  const totalTransferRequiredTB = totalDataPerMonthGB / 1024;

  // --- Resource estimation ---
  const requiredRamGB = Math.ceil((machineCount / 100) * 2 + (concurrentUsers / 10));
  const requiredCpu = Math.ceil(machineCount / 250 + concurrentUsers / 10);

  // Helper: extract numeric values from strings
  const extractNumber = (text) => {
    if (typeof text === 'number') return text;
    const match = text.toString().match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  };

  // Helper: calculate additional costs for EC2 (EBS storage, data transfer)
  const calculateEc2TotalCost = (basePlan, storageGB, transferTB) => {
    const ebsStorageCost = storageGB * 0.10; // $0.10 per GB/month for gp3
    const dataTransferCost = Math.max(0, transferTB - 0.1) * 90; // First 100GB free, then $0.09/GB
    return basePlan.price + ebsStorageCost + dataTransferCost;
  };

  // --- Match AWS Lightsail ---
  const suitableLightsailPlans = AWS_LIGHTSAIL_PLANS
    .filter(plan => {
      const ram = extractNumber(plan.ram);
      const cpu = extractNumber(plan.cpu);
      const storage = extractNumber(plan.storage);
      const transfer = extractNumber(plan.transfer);

      return ram >= requiredRamGB &&
        cpu >= requiredCpu &&
        storage >= totalStorageRequiredGB &&
        transfer >= totalTransferRequiredTB;
    })
    .sort((a, b) => a.price - b.price); // Sort by price ascending

  const bestLightsail = suitableLightsailPlans.length > 0 ? {
    ...suitableLightsailPlans[0],
    totalMonthlyCost: suitableLightsailPlans[0].price,
    costBreakdown: {
      instanceCost: suitableLightsailPlans[0].price,
      additionalCosts: 0
    },
    notes: 'All-inclusive pricing with bundled storage and transfer'
  } : null;

  // --- Match AWS EC2 ---
  const suitableEc2Plans = AWS_EC2_PLANS
    .filter(plan => {
      const ram = extractNumber(plan.ram);
      const cpu = extractNumber(plan.cpu);
      return ram >= requiredRamGB && cpu >= requiredCpu;
    })
    .map(plan => {
      const totalCost = calculateEc2TotalCost(plan, totalStorageRequiredGB, totalTransferRequiredTB);
      return {
        ...plan,
        totalMonthlyCost: totalCost,
        costBreakdown: {
          instanceCost: plan.price,
          ebsStorage: totalStorageRequiredGB * 0.10,
          dataTransfer: Math.max(0, totalTransferRequiredTB - 0.1) * 90,
          additionalCosts: totalCost - plan.price
        }
      };
    })
    .sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);

  const bestEc2 = suitableEc2Plans.length > 0 ? {
    ...suitableEc2Plans[0],
    notes: 'Requires separate EBS storage and data transfer billing'
  } : null;


  // Calculate Azure costs (includes managed disk and bandwidth)
  const calculateAzureTotalCost = (basePlan, storageGB, transferTB) => {
    const managedDiskCost = Math.max(0, storageGB - basePlan.storage) * 0.05; // $0.05/GB for Premium SSD
    const bandwidthCost = Math.max(0, transferTB - 0.1) * 87; // First 100GB free
    return basePlan.price + managedDiskCost + bandwidthCost;
  };

  const suitableAzurePlans = azurePlans
    .filter(plan => {
      return plan.ram >= requiredRamGB &&
        plan.cpu >= requiredCpu &&
        plan.storage >= totalStorageRequiredGB;
    })
    .map(plan => {
      const totalCost = calculateAzureTotalCost(plan, totalStorageRequiredGB, totalTransferRequiredTB);
      return {
        ...plan,
        totalMonthlyCost: totalCost,
        costBreakdown: {
          instanceCost: plan.price,
          managedDisk: Math.max(0, totalStorageRequiredGB - plan.storage) * 0.05,
          bandwidth: Math.max(0, totalTransferRequiredTB - 0.1) * 87,
          additionalCosts: totalCost - plan.price
        }
      };
    })
    .sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);

  const bestAzure = suitableAzurePlans.length > 0 ? {
    ...suitableAzurePlans[0],
    notes: 'Includes managed disk and bandwidth costs'
  } : null;


  const calculateGcpTotalCost = (basePlan, storageGB, transferTB) => {
    const persistentDiskCost = storageGB * 0.04; // $0.04/GB for standard persistent disk
    const egressCost = Math.max(0, transferTB - 0.2) * 120; // First 200GB free
    return basePlan.price + persistentDiskCost + egressCost;
  };

  const suitableGcpPlans = gcpPlans
    .filter(plan => {
      return plan.ram >= requiredRamGB && plan.cpu >= requiredCpu;
    })
    .map(plan => {
      const totalCost = calculateGcpTotalCost(plan, totalStorageRequiredGB, totalTransferRequiredTB);
      return {
        ...plan,
        totalMonthlyCost: totalCost,
        costBreakdown: {
          instanceCost: plan.price,
          persistentDisk: totalStorageRequiredGB * 0.04,
          networkEgress: Math.max(0, totalTransferRequiredTB - 0.2) * 120,
          additionalCosts: totalCost - plan.price
        }
      };
    })
    .sort((a, b) => a.totalMonthlyCost - b.totalMonthlyCost);

  const bestGcp = suitableGcpPlans.length > 0 ? {
    ...suitableGcpPlans[0],
    notes: 'Includes persistent disk and network egress costs'
  } : null;

  // Find the overall best option
  const allRecommendations = [bestLightsail, bestEc2, bestAzure, bestGcp].filter(Boolean);
  const cheapestOption = allRecommendations.length > 0 ?
    allRecommendations.reduce((prev, curr) =>
      prev.totalMonthlyCost < curr.totalMonthlyCost ? prev : curr
    ) : null;

  return {
    workload: {
      machineCount,
      messageSizeKB,
      messageFrequencySec,
      tagsPerMachine,
      concurrentUsers,
      storageDurationMonths,
      totalMessagesPerMonth,
      totalDataPerMonthGB: totalDataPerMonthGB.toFixed(2),
      totalStorageRequiredGB: totalStorageRequiredGB.toFixed(2),
      totalTransferRequiredTB: totalTransferRequiredTB.toFixed(2),
      requiredRamGB,
      requiredCpu
    },
    recommendedPlans: {
      awsLightsail: bestLightsail || 'No suitable plan found',
      awsEc2: bestEc2 || 'No suitable plan found',
      azure: bestAzure || 'No suitable plan found',
      gcp: bestGcp || 'No suitable plan found'
    },
    comparison: {
      cheapestOption: cheapestOption,
      costSavings: cheapestOption && allRecommendations.length > 1 ? {
        amount: Math.max(...allRecommendations.map(p => p.totalMonthlyCost)) - cheapestOption.totalMonthlyCost,
        percentage: ((Math.max(...allRecommendations.map(p => p.totalMonthlyCost)) - cheapestOption.totalMonthlyCost) / Math.max(...allRecommendations.map(p => p.totalMonthlyCost)) * 100).toFixed(1)
      } : null,
      alternativeOptionsCount: allRecommendations.length
    }
  };
}
