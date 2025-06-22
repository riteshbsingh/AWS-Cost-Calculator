import React, { useRef, useState } from 'react';
import { ChevronRight, ChevronLeft, Calculator, Cloud, Database, MessageSquare, FileText, Check, Monitor, Server, Router } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { findBestCloudPlans } from '../constants/commonFunctions';

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
    provider: 'aws',
    lightsailPlan: 'plan-5',
    ec2Plan: 'ec2-t3a.nano',
    azureVm: 'b1s',
    googleVm: 'e2-micro',
    ebsStorage: 0,
    concurrentUsers: 20,
    storageDurationMonths: 1,

    // Page 2 - Cloud Broker
    cloudBroker: 'aws-iot',
    cloudProvider: 'aws',

    // Page 3 - MQTT Broker
    // mqttBroker: null,

    // Page 3 - Database
    database: 's3',

    // Page 3 - Database
    vmService: 'lightsail',
    finalPlan: {}

  });

  const [calculations, setCalculations] = useState({
    messagesPerDevice: 0,
    messagesAllDevices: 0,
    dataPerDevice: 0,
    dataAllDevices: 0,
    monthlyMessages: 0,
    yearlyMessages: 0,
    monthlyData: 0,
    yearlyData: 0
  });

  const awsLightsailPlans = [
    { id: 'plan-5', name: '$5/mo', price: 5, ram: '0.5 GB', cpu: '2 vCPUs', storage: '20 GB SSD', transfer: '1 TB' },
    { id: 'plan-7', name: '$7/mo', price: 7, ram: '1 GB', cpu: '2 vCPUs', storage: '40 GB SSD', transfer: '2 TB' },
    { id: 'plan-12', name: '$12/mo', price: 12, ram: '2 GB', cpu: '2 vCPUs', storage: '60 GB SSD', transfer: '3 TB' },
    { id: 'plan-24', name: '$24/mo', price: 24, ram: '4 GB', cpu: '2 vCPUs', storage: '80 GB SSD', transfer: '4 TB' },
    { id: 'plan-44', name: '$44/mo', price: 44, ram: '8 GB', cpu: '2 vCPUs', storage: '160 GB SSD', transfer: '5 TB' },
    { id: 'plan-84', name: '$84/mo', price: 84, ram: '16 GB', cpu: '4 vCPUs', storage: '320 GB SSD', transfer: '6 TB' },
    { id: 'plan-164', name: '$164/mo', price: 164, ram: '32 GB', cpu: '8 vCPUs', storage: '640 GB SSD', transfer: '7 TB' },
    { id: 'plan-384', name: '$384/mo', price: 384, ram: '64 GB', cpu: '16 vCPUs', storage: '1280 GB SSD', transfer: '8 TB' },
  ];

  const awsEc2Plans = [
    {
      id: 'ec2-t3a.nano',
      name: 't3a.nano',
      price: 3.43, // Updated from 4.7 (hourly price $0.0047 * 744 hours/month)
      ram: '0.5 GB',
      cpu: '2 vCPUs (Burstable, AMD EPYC)',
      storage: 'EBS only (Up to 2.048 TiB)',
      transfer: 'Up to 5 Gbps'
    },
    {
      id: 'ec2-t3a.micro',
      name: 't3a.micro',
      price: 6.95, // Updated from 9.4 (hourly price $0.0094 * 744 hours/month)
      ram: '1 GB',
      cpu: '2 vCPUs (Burstable, AMD EPYC)',
      storage: 'EBS only (Up to 2.048 TiB)',
      transfer: 'Up to 5 Gbps'
    },
    {
      id: 'ec2-t3a.small',
      name: 't3a.small',
      price: 13.96, // Updated from 18.8 (hourly price $0.0188 * 744 hours/month)
      ram: '2 GB',
      cpu: '2 vCPUs (Burstable, AMD EPYC)',
      storage: 'EBS only (Up to 2.048 TiB)',
      transfer: 'Up to 5 Gbps'
    },
    {
      id: 'ec2-t3a.medium',
      name: 't3a.medium',
      price: 27.89, // Updated from 37.6 (hourly price $0.0376 * 744 hours/month)
      ram: '4 GB',
      cpu: '2 vCPUs (Burstable, AMD EPYC)',
      storage: 'EBS only (Up to 2.048 TiB)',
      transfer: 'Up to 5 Gbps'
    },
    {
      id: 'ec2-t3a.large',
      name: 't3a.large',
      price: 54.90, // Updated from 75.2 (hourly price $0.0752 * 744 hours/month)
      ram: '8 GB',
      cpu: '2 vCPUs (Burstable, AMD EPYC)',
      storage: 'EBS only (Up to 3.072 TiB)',
      transfer: 'Up to 5 Gbps'
    },
    {
      id: 'ec2-t3a.xlarge',
      name: 't3a.xlarge',
      price: 109.79, // Updated from 150.4 (hourly price $0.1504 * 744 hours/month)
      ram: '16 GB',
      cpu: '4 vCPUs (Burstable, AMD EPYC)',
      storage: 'EBS only (Up to 4.096 TiB)',
      transfer: 'Up to 5 Gbps'
    },
    {
      id: 'ec2-t3a.2xlarge',
      name: 't3a.2xlarge',
      price: 219.58, // Updated from 300.8 (hourly price $0.3008 * 744 hours/month)
      ram: '32 GB',
      cpu: '8 vCPUs (Burstable, AMD EPYC)',
      storage: 'EBS only (Up to 4.096 TiB)',
      transfer: 'Up to 5 Gbps'
    }
  ];

  const getCurrentService = () => {
    let tempPlan;
    if (formData.cloudProvider === 'aws' && formData.vmService === 'lightsail' && formData.lightsailPlan) {
      tempPlan = formData.lightsailPlan
    } else if (formData.cloudProvider === 'aws' && formData.vmService === 'ec2' && formData.ec2Plan) {
      tempPlan = formData.ec2Plan
    } else if (formData.cloudProvider === 'azure' && formData.azureVm) {
      tempPlan = formData.azureVm
    } else {
      tempPlan = formData.googleVm
    }
    // setPlan(tempPlan)
    return tempPlan;
  }

  const vmCostCalculation = () => {
    // let tempPlan;
    // if (formData.cloudProvider === 'aws' && formData.vmService === 'lightsail' && formData.lightsailPlan) {
    //   tempPlan = awsLightsailPlans.find(p => p.id === formData.lightsailPlan);
    //   tempPlan = { ...tempPlan, price: tempPlan.price.toFixed(2) }
    // } else if (formData.cloudProvider === 'aws' && formData.vmService === 'ec2' && formData.ec2Plan) {
    //   tempPlan = awsEc2Plans.find(p => p.id === formData.ec2Plan);
    //   tempPlan = { ...tempPlan, price: tempPlan.price.toFixed(2) + (formData.ebsStorage * 0.08).toFixed(0) }
    // } else if (formData.cloudProvider === 'azure' && formData.azureVm) {
    //   tempPlan = awsEc2Plans.find(p => p.id === formData.ec2Plan);
    //   tempPlan = { ...tempPlan, price: (tempPlan.price * 24 * 30).toFixed(2) }
    // } else {
    //   tempPlan = vmServices.google.find(v => v.id === formData.googleVm);
    //   tempPlan = { ...tempPlan, price: (tempPlan.price * 24 * 30).toFixed(2) }
    // }
    // setPlan(tempPlan)
    return formData.finalPlan
  }

  // Mock data for services
  const cloudBrokers = [
    {
      id: 'aws-iot',
      name: 'AWS IoT Core',
      description: 'Fully managed IoT service',
      pricing: {
        messagesPerMillion: 1.00,
        deviceShadowOperations: 1.25,
        rulesEngineActions: 0.15
      },
      features: ['Device Registry', 'Device Shadows', 'Rules Engine', 'Security & Authentication']
    },
    {
      id: 'azure-iot',
      name: 'Azure IoT Hub',
      description: 'Cloud-based IoT application platform',
      pricing: {
        messagesPerMillion: 0.50,
        deviceToCloudMessages: 0.25,
        cloudToDeviceMessages: 0.25
      },
      features: ['Device Twins', 'Direct Methods', 'File Upload', 'Message Routing']
    },
    {
      id: 'gcp-iot',
      name: 'Google Cloud IoT Core',
      description: 'Secure device connection and management',
      pricing: {
        messagesPerMillion: 0.45,
        deviceRegistry: 0.006,
        telemetryIngestion: 0.45
      },
      features: ['Device Management', 'Protocol Bridge', 'Cloud Pub/Sub Integration', 'Edge TPU Support']
    }
  ];

  const mqttBrokers = [
    {
      id: 'aws-mq',
      name: 'Amazon MQ',
      description: 'Managed message broker service',
      pricing: {
        instanceHourMicro: 0.30,
        instanceHourSmall: 0.60,
        dataTransfer: 0.09,
        storage: 0.30
      },
      features: ['ActiveMQ', 'RabbitMQ', 'High Availability', 'Automatic Failover']
    },
    {
      id: 'hivemq',
      name: 'HiveMQ Cloud',
      description: 'Enterprise MQTT broker',
      pricing: {
        connectionsPerHour: 0.10,
        messagesPerMillion: 0.50,
        bandwidth: 0.15
      },
      features: ['MQTT 5.0', 'Clustering', 'Enterprise Security', 'Monitoring']
    },
    {
      id: 'emqx',
      name: 'EMQX Cloud',
      description: 'Scalable MQTT messaging platform',
      pricing: {
        connectionsPerHour: 0.08,
        messagesPerMillion: 0.30,
        bandwidth: 0.12
      },
      features: ['MQTT 5.0', 'Rule Engine', 'Data Integration', 'Real-time Monitoring']
    }
  ];

  const vmServices = {
    aws: [
      {
        id: "lightsail",
        name: "AWS Lightsail",
        description: "Simple cloud VPS with predictable pricing",
        pricing: { monthly: 3.50 },
        features: ["Easy to use", "Fixed monthly pricing", "Built-in networking"],
      },
      {
        id: "ec2-t2micro",
        name: "AWS EC2 t2.micro",
        description: "General purpose micro instance",
        pricing: { hourly: 0.0116 },
        features: ["Burstable CPU", "1 vCPU, 1 GB RAM", "Flexible configuration"],
      },
      {
        id: "ec2-t3small",
        name: "AWS EC2 t3.small",
        description: "Balanced performance micro instance",
        pricing: { hourly: 0.0208 },
        features: ["2 vCPUs", "2 GB RAM", "Low cost"],
      },
    ],
    azure: [
      {
        id: "b1s",
        name: "Azure B1s VM",
        description: "Economical burstable VM",
        pricing: { hourly: 0.012 },
        features: ["1 vCPU", "1 GB RAM", "Burstable CPU"],
      },
      {
        id: "d2s-v3",
        name: "Azure D2s v3",
        description: "General purpose VM",
        pricing: { hourly: 0.096 },
        features: ["2 vCPUs", "8 GB RAM", "Premium storage support"],
      },
      {
        id: "f4s",
        name: "Azure F4s",
        description: "Compute optimized VM",
        pricing: { hourly: 0.169 },
        features: ["4 vCPUs", "8 GB RAM", "High CPU-to-memory ratio"],
      },
    ],
    google: [
      {
        id: "e2-micro",
        name: "Google e2-micro",
        description: "Cost-effective micro instance",
        pricing: { hourly: 0.0076 },
        features: ["2 vCPUs", "1 GB RAM", "Sustained use discounts"],
      },
      {
        id: "n1-standard-1",
        name: "Google n1-standard-1",
        description: "Standard machine type",
        pricing: { hourly: 0.0475 },
        features: ["1 vCPU", "3.75 GB RAM", "Balanced performance"],
      },
      {
        id: "c2-standard-4",
        name: "Google c2-standard-4",
        description: "Compute optimized VM",
        pricing: { hourly: 0.337 },
        features: ["4 vCPUs", "16 GB RAM", "High CPU performance"],
      },
    ],
  };

  const databases = [
    {
      id: 's3',
      name: 'AWS S3 Standard',
      description: 'Object storage for frequent access',
      pricing: {
        storagePerGB: 0.025,
        requests: 0.0004,
        dataTransfer: 0.09
      },
      features: [
        '99.999999999% (11 9\'s) durability',
        'Millisecond retrieval time',
        'Server-side encryption (SSE)',
        'Versioning & lifecycle policies',
        'Cross-region replication'
      ]
    },
    {
      id: 'glacier',
      name: 'AWS S3 Glacier',
      description: 'Low-cost archival storage',
      pricing: {
        storagePerGB: 0.004,
        retrievalPerGB: 0.01,
        requests: 0.05
      },
      features: [
        'Retrieval time: Minutes to hours (Expedited/Standard/Bulk)',
        '99.999999999% durability',
        'Vault Lock (compliance controls)',
        'Lowest-cost storage for archives',
        'Data retrieval policies'
      ]
    },
    {
      id: 'timestream',
      name: 'Amazon Timestream',
      description: 'Serverless time-series database',
      pricing: {
        writePerMillion: 0.50,
        queryPerGB: 0.01,
        storagePerGB: 0.03
      },
      features: [
        'Sub-millisecond query response',
        'Automated tiering (Memory & Magnetic store)',
        'Built-in time-series analytics',
        'SQL-compatible queries',
        'Scalable for IoT & monitoring data'
      ]
    }
  ];

  const calculateMetrics = () => {
    // <p>Total Tags: {formData.machines * formData.tagsPerMachine}</p>
    //       <p>Messages per day per device: {Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24)}</p>
    //       <p>Messages per Day for all devices: {Math.round(Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24) * formData.machines)}</p>
    //       <p>Messages per Month for all Devices: {Math.round(Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24) * formData.machines) * 30}</p>
    //       <p className="md:col-span-2">Messages per Year for all Devices: {(Math.round(Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24) * formData.machines) * 30) * 12}</p>

    const totalTags = formData.machines * formData.tagsPerMachine;
    const messagesPerHour = Math.round(1 * formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60);
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
      yearlyData: dataAllDevicesPerMonth * 12
    });
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentPage === 1) {
      calculateMetrics();
    }
    setCurrentPage(prev => Math.min(prev + 1, 5));
  };

  const handleDownload = async () => {
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

  const handlePrevious = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const calculateTotalCost = () => {
    let totalMonthlyCost = 0;

    // Cloud Broker Cost
    if (formData.cloudBroker) {
      const broker = cloudBrokers.find(b => b.id === formData.cloudBroker);
      totalMonthlyCost += (calculations.monthlyMessages / 1000000) * broker.pricing.messagesPerMillion;
    }

    // MQTT Broker Cost
    // if (formData.mqttBroker) {
    //   const mqtt = mqttBrokers.find(m => m.id === formData.mqttBroker);
    //   if (mqtt.id === 'aws-mq') {
    //     // Amazon MQ pricing based on instance hours (assume micro instance)
    //     totalMonthlyCost += 24 * 30 * mqtt.pricing.instanceHourMicro;
    //     totalMonthlyCost += (calculations.monthlyData / 1024 / 1024) * mqtt.pricing.dataTransfer; // Data transfer cost
    //   } else {
    //     // Other MQTT brokers with connection and message-based pricing
    //     totalMonthlyCost += formData.machines * 24 * 30 * mqtt.pricing.connectionsPerHour;
    //     totalMonthlyCost += (calculations.monthlyMessages / 1000000) * mqtt.pricing.messagesPerMillion;
    //   }
    // }

    // Database Cost
    if (formData.database) {
      const db = databases.find(d => d.id === formData.database);
      totalMonthlyCost += (calculations.monthlyData / 1024 / 1024) * db.pricing.storagePerGB; // Convert KB to GB
    }

    if (formData.vmService) {
      const vmCost = vmCostCalculation();
      totalMonthlyCost += parseFloat(vmCost.monthlyCost)
    }

    return totalMonthlyCost;
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        {[1, 2, 3, 4, 5].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${step <= currentPage ? 'bg-blue-500' : 'bg-gray-300'
              }`}>
              {step < currentPage ? <Check size={20} /> : step}
            </div>
            {step < 5 && (
              <div className={`w-16 h-1 mx-2 ${step < currentPage ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-sm text-gray-600">
        <span>Device Config</span>
        <span>MQTT Broker</span>
        <span>Cold Storage</span>
        <span>Virtual Machine</span>
        <span>Report</span>
      </div>
    </div>
  );

  const renderPage1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Router className="mx-auto mb-4 text-blue-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800">Device Configuration</h2>
        <p className="text-gray-600">Configure your IoT devices and data parameters</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Number of Machines</label>
          <input
            type="number"
            value={formData.machines}
            onChange={(e) => handleInputChange('machines', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tags per Machine</label>
          <input
            type="number"
            value={formData.tagsPerMachine}
            onChange={(e) => handleInputChange('tagsPerMachine', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Message Size (KB)</label>
          <input
            type="number"
            value={formData.messageSize}
            onChange={(e) => handleInputChange('messageSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Frequency (seconds)</label>
          <input
            type="number"
            value={formData.frequency}
            onChange={(e) => handleInputChange('frequency', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">IoT Gateway Devices</label>
          <input
            type="number"
            value={formData.iotGateways}
            onChange={(e) => handleInputChange('iotGateways', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Connection Duration
          </label>
          <select
            value={formData.connectionDuration}
            onChange={(e) => handleInputChange('connectionDuration', parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={43800}>All Day (43,800 mins)</option>
            <option value={21900}>12 Hours (21,900 mins)</option>
            <option value={10950}>6 Hours (10,950 mins)</option>
          </select>
        </div>

      </div>

      <div className="bg-blue-50 p-6 rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Data Overview</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-800 text-sm md:text-base">
          {/* Connection Cost */}
          <div>
            <span className="font-semibold">Devices: </span>
            <span>{formData.machines}</span>
          </div>

          <div>
            <span className="font-semibold">Connection duration/month: </span>
            <span>{formData.connectionDuration.toLocaleString()} mins</span>
          </div>

          <div>
            <span className="font-semibold">Connection cost/month: </span>
            <span>
              ${(formData.connectionDuration * 0.00000008 * formData.machines).toFixed(4)} USD
            </span>
          </div>

          {/* Message Cost */}
          <div>
            <span className="font-semibold">Billable msg size: </span>
            <span>{Math.ceil(formData.messageSize / 5)}x per message</span>
          </div>

          <div>
            <span className="font-semibold">Monthly messages (all devices): </span>
            <span>{(() => {
              const daily = Math.round(formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24);
              return (daily * 30 * formData.machines).toLocaleString();
            })()}</span>
          </div>

          <div>
            <span className="font-semibold">Total billable messages: </span>
            <span>{(() => {
              const billable = Math.ceil(formData.messageSize / 5);
              const daily = Math.round(formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24);
              return (daily * 30 * formData.machines * billable).toLocaleString();
            })()}</span>
          </div>

          <div>
            <span className="font-semibold">Message cost/month: </span>
            <span>{(() => {
              const billable = Math.ceil(formData.messageSize / 5);
              const daily = Math.round(formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24);
              const total = daily * 30 * formData.machines * billable;
              return (total * 0.000001).toFixed(2) + ' USD';
            })()}</span>
          </div>
        </div>
      </div>


    </div>
  );

  const renderPage2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Cloud className="mx-auto mb-4 text-green-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800">Cloud Broker Selection</h2>
        <p className="text-gray-600">Choose your cloud IoT platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cloudBrokers.map((broker) => (
          <div
            key={broker.id}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${formData.cloudBroker === broker.id
              ? 'border-green-500 bg-green-50'
              : 'border-gray-200 hover:border-green-300'
              }`}
            onClick={() => handleInputChange('cloudBroker', broker.id)}
          >
            <h3 className="text-lg font-semibold mb-2">{broker.name}</h3>
            <p className="text-gray-600 mb-4">{broker.description}</p>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Pricing:</h4>
              <ul className="text-sm text-gray-700">
                {Object.entries(broker.pricing).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                    <span>${value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="text-sm text-gray-700">
                {broker.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check size={16} className="text-green-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-green-50 p-6 rounded-lg">
        <h3 className="font-semibold text-gray-800 text-xl mb-4">Data Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Connection Cost</h4>
            <p><strong>Devices:</strong> {formData.machines}</p>
            <p><strong>Monthly Duration:</strong> {formData.connectionDuration.toLocaleString()} mins</p>
            <p><strong>Total Cost:</strong> ${(formData.connectionDuration * 0.00000008 * formData.machines).toFixed(4)} USD</p>
          </div>

          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Message Cost</h4>
            <p><strong>Tags per Device:</strong> {formData.tagsPerMachine}</p>
            <p><strong>Message Size:</strong> {formData.messageSize} KB</p>
            <p><strong>Monthly Messages (all devices):</strong> {(() => {
              const perDayPerDevice = Math.round(formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24);
              return (perDayPerDevice * 30 * formData.machines).toLocaleString();
            })()}</p>
            <p><strong>Total Billable Messages:</strong> {(() => {
              const billablePer = Math.ceil(formData.messageSize / 5);
              const perDayPerDevice = Math.round(formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24);
              const monthlyMsgs = perDayPerDevice * 30 * formData.machines;
              return (monthlyMsgs * billablePer).toLocaleString();
            })()}</p>
            <p><strong>Total Cost:</strong> {(() => {
              const billablePer = Math.ceil(formData.messageSize / 5);
              const perDayPerDevice = Math.round(formData.tagsPerMachine * formData.messageSize * 60 / formData.frequency * 60 * 24);
              const monthlyMsgs = perDayPerDevice * 30 * formData.machines;
              const total = monthlyMsgs * billablePer;
              return (total * 0.000001).toFixed(2) + ' USD';
            })()}</p>
          </div>
        </div>
      </div>

    </div>
  );

  // const renderPage3 = () => (
  //   <div className="space-y-6">
  //     <div className="text-center mb-8">
  //       <MessageSquare className="mx-auto mb-4 text-purple-500" size={48} />
  //       <h2 className="text-2xl font-bold text-gray-800">MQTT Broker Selection</h2>
  //       <p className="text-gray-600">Choose your MQTT messaging service</p>
  //     </div>

  //     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  //       {mqttBrokers.map((broker) => (
  //         <div
  //           key={broker.id}
  //           className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${formData.mqttBroker === broker.id
  //             ? 'border-purple-500 bg-purple-50'
  //             : 'border-gray-200 hover:border-purple-300'
  //             }`}
  //           onClick={() => handleInputChange('mqttBroker', broker.id)}
  //         >
  //           <h3 className="text-lg font-semibold mb-2">{broker.name}</h3>
  //           <p className="text-gray-600 mb-4">{broker.description}</p>

  //           <div className="mb-4">
  //             <h4 className="font-medium mb-2">Pricing:</h4>
  //             <ul className="text-sm text-gray-700">
  //               {Object.entries(broker.pricing).map(([key, value]) => (
  //                 <li key={key} className="flex justify-between">
  //                   <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
  //                   <span>${value}</span>
  //                 </li>
  //               ))}
  //             </ul>
  //           </div>

  //           <div>
  //             <h4 className="font-medium mb-2">Features:</h4>
  //             <ul className="text-sm text-gray-700">
  //               {broker.features.map((feature, idx) => (
  //                 <li key={idx} className="flex items-center">
  //                   <Check size={16} className="text-purple-500 mr-2" />
  //                   {feature}
  //                 </li>
  //               ))}
  //             </ul>
  //           </div>
  //         </div>
  //       ))}
  //     </div>

  //     {formData.mqttBroker && (
  //       <div className="bg-purple-50 p-4 rounded-lg">
  //         <h3 className="font-semibold text-purple-800 mb-2">MQTT Broker Summary</h3>
  //         <p className="text-purple-700">
  //           Selected: {mqttBrokers.find(b => b.id === formData.mqttBroker)?.name}
  //         </p>
  //         <p className="text-purple-700">
  //           Estimated monthly cost: ${(() => {
  //             const mqtt = mqttBrokers.find(b => b.id === formData.mqttBroker);
  //             if (mqtt.id === 'aws-mq') {
  //               return (24 * 30 * mqtt.pricing.instanceHourMicro +
  //                 (calculations.monthlyData / 1024 / 1024) * mqtt.pricing.dataTransfer).toFixed(2);
  //             } else {
  //               return ((formData.machines * 24 * 30 * mqtt.pricing.connectionsPerHour) +
  //                 (calculations.monthlyMessages / 1000000) * mqtt.pricing.messagesPerMillion).toFixed(2);
  //             }
  //           })()}
  //         </p>
  //       </div>
  //     )}
  //   </div>
  // );

  const renderPage3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Database className="mx-auto mb-4 text-orange-500" size={48} />
        <h2 className="text-2xl font-bold text-gray-800">Database Selection</h2>
        <p className="text-gray-600">Choose your cold data storage solution</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {databases.map((db) => (
          <div
            key={db.id}
            className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${formData.database === db.id
              ? 'border-orange-500 bg-orange-50'
              : 'border-gray-200 hover:border-orange-300'
              }`}
            onClick={() => handleInputChange('database', db.id)}
          >
            <h3 className="text-lg font-semibold mb-2">{db.name}</h3>
            <p className="text-gray-600 mb-4">{db.description}</p>

            <div className="mb-4">
              <h4 className="font-medium mb-2">Pricing:</h4>
              <ul className="text-sm text-gray-700">
                {Object.entries(db.pricing).map(([key, value]) => (
                  <li key={key} className="flex justify-between">
                    <span>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                    <span>${value}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Features:</h4>
              <ul className="text-sm text-gray-700">
                {db.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <Check size={16} className="text-orange-500 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {formData.database && (
        <div className="bg-orange-50 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Database Summary</h3>
          {(() => {
            const selectedDB = databases.find(d => d.id === formData.database);
            const monthlyGB = (calculations.monthlyData / 1024 / 1024).toFixed(2);
            const monthlyCost = selectedDB
              ? (monthlyGB * selectedDB.pricing.storagePerGB).toFixed(2)
              : '0.00';

            return selectedDB ? (
              <div className="text-gray-800 text-sm md:text-base space-y-2">
                <div>
                  <span className="font-semibold">Selected Database: </span>
                  <span>{selectedDB.name}</span>
                </div>

                <div>
                  <span className="font-semibold">Monthly Storage Used: </span>
                  <span>{monthlyGB} GB</span>
                </div>

                <div>
                  <span className="font-semibold">Estimated Monthly Cost: </span>
                  <span>${monthlyCost}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-600">No database selected.</p>
            );
          })()}
        </div>

      )}
    </div>
  );

  const renderPage4 = () => {
    // Calculate recommendations when workload data is available
    const recommendations = findBestCloudPlans(
          formData.machines,
          formData.messageSize,
          formData.frequency,
          formData.tagsPerMachine,
          formData.concurrentUsers,
          formData.storageDurationMonths
        )

    // handleInputChange('recommendedVM', recommendations.comparison.cheapestOption);

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <Server className="mx-auto mb-4 text-blue-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-800">Virtual Machine Selection</h2>
          <p className="text-gray-600">Configure your workload and get optimized cloud recommendations</p>
        </div>

        {/* Workload Configuration Section */}
        {/* <div className="bg-blue-50 p-6 rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Workload Configuration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Machine Count</label>
              <input
                type="number"
                value={formData.machineCount || ''}
                onChange={(e) => handleInputChange('machineCount', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of machines"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Size (KB)</label>
              <input
                type="number"
                value={formData.messageSizeKB || ''}
                onChange={(e) => handleInputChange('messageSizeKB', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Size in KB"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message Frequency (seconds)</label>
              <input
                type="number"
                value={formData.messageFrequencySec || ''}
                onChange={(e) => handleInputChange('messageFrequencySec', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Frequency in seconds"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags per Machine</label>
              <input
                type="number"
                value={formData.tagsPerMachine || ''}
                onChange={(e) => handleInputChange('tagsPerMachine', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of tags"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Concurrent Users</label>
              <input
                type="number"
                value={formData.concurrentUsers || ''}
                onChange={(e) => handleInputChange('concurrentUsers', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of users"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Storage Duration (months)</label>
              <input
                type="number"
                value={formData.storageDurationMonths || ''}
                onChange={(e) => handleInputChange('storageDurationMonths', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Duration in months"
              />
            </div>
          </div>
        </div> */}

        {/* Workload Summary */}
        {recommendations && (
          <div className="bg-green-50 p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Workload Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Total Messages/Month:</span>
                <div className="text-lg text-blue-600">{recommendations.workload.totalMessagesPerMonth.toLocaleString()}</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Data/Month:</span>
                <div className="text-lg text-blue-600">{recommendations.workload.totalDataPerMonthGB} GB</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Storage Required:</span>
                <div className="text-lg text-blue-600">{recommendations.workload.totalStorageRequiredGB} GB</div>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Transfer Required:</span>
                <div className="text-lg text-blue-600">{recommendations.workload.totalTransferRequiredTB} TB</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Required RAM:</span>
                <span className="ml-2 text-blue-600">{recommendations.workload.requiredRamGB} GB</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Required CPU:</span>
                <span className="ml-2 text-blue-600">{recommendations.workload.requiredCpu} cores</span>
              </div>
            </div>
          </div>
        )}

        {/* Recommended Plans */}
        {recommendations && (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800">Recommended Cloud Plans</h3>

            {/* Best Option Highlight */}
            {recommendations.comparison.cheapestOption && (
              <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-xl shadow-lg border-2 border-green-400">
                <div className="flex items-center mb-4">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold mr-3">
                    BEST VALUE
                  </div>
                  <h4 className="text-lg font-bold text-gray-800">
                    {recommendations.comparison.cheapestOption.name}
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      ${recommendations.comparison.cheapestOption.totalMonthlyCost.toFixed(2)}/month
                    </p>
                    <p className="text-sm text-gray-600">{recommendations.comparison.cheapestOption.notes}</p>
                  </div>
                  {recommendations.comparison.cheapestOption.costBreakdown && (
                    <div className="text-sm">
                      <div className="font-semibold mb-2">Cost Breakdown:</div>
                      <div>Instance: ${recommendations.comparison.cheapestOption.costBreakdown.instanceCost.toFixed(2)}</div>
                      {recommendations.comparison.cheapestOption.costBreakdown.additionalCosts > 0 && (
                        <div>Additional: ${recommendations.comparison.cheapestOption.costBreakdown.additionalCosts.toFixed(2)}</div>
                      )}
                    </div>
                  )}
                </div>
                {recommendations.comparison.costSavings && (
                  <div className="mt-4 text-sm text-green-700">
                    💰 Save ${recommendations.comparison.costSavings.amount.toFixed(2)} ({recommendations.comparison.costSavings.percentage}%) vs most expensive option
                  </div>
                )}
              </div>
            )}

            {/* All Recommendations Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* AWS Lightsail */}
              {recommendations.recommendedPlans.awsLightsail !== 'No suitable plan found' && (
                <div className="bg-orange-50 p-6 rounded-xl shadow-md border border-orange-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-orange-500 text-white px-3 py-1 rounded-md text-sm font-semibold mr-3">
                      AWS LIGHTSAIL
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {recommendations.recommendedPlans.awsLightsail.name}
                  </h4>
                  <p className="text-xl font-bold text-orange-600 mb-2">
                    ${recommendations.recommendedPlans.awsLightsail.totalMonthlyCost.toFixed(2)}/month
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>💾 RAM: {recommendations.recommendedPlans.awsLightsail.ram}</div>
                    <div>🖥️ CPU: {recommendations.recommendedPlans.awsLightsail.cpu}</div>
                    <div>💽 Storage: {recommendations.recommendedPlans.awsLightsail.storage}</div>
                    <div>🌐 Transfer: {recommendations.recommendedPlans.awsLightsail.transfer}</div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">{recommendations.recommendedPlans.awsLightsail.notes}</p>
                </div>
              )}

              {/* AWS EC2 */}
              {recommendations.recommendedPlans.awsEc2 !== 'No suitable plan found' && (
                <div className="bg-yellow-50 p-6 rounded-xl shadow-md border border-yellow-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-yellow-600 text-white px-3 py-1 rounded-md text-sm font-semibold mr-3">
                      AWS EC2
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {recommendations.recommendedPlans.awsEc2.name}
                  </h4>
                  <p className="text-xl font-bold text-yellow-600 mb-2">
                    ${recommendations.recommendedPlans.awsEc2.totalMonthlyCost.toFixed(2)}/month
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>💾 RAM: {recommendations.recommendedPlans.awsEc2.ram}</div>
                    <div>🖥️ CPU: {recommendations.recommendedPlans.awsEc2.cpu}</div>
                    <div>💽 Storage: {recommendations.recommendedPlans.awsEc2.storage}</div>
                    <div>🌐 Transfer: {recommendations.recommendedPlans.awsEc2.transfer}</div>
                  </div>
                  {recommendations.recommendedPlans.awsEc2.costBreakdown && (
                    <div className="text-xs text-gray-500 mt-2">
                      Instance: ${recommendations.recommendedPlans.awsEc2.costBreakdown.instanceCost.toFixed(2)} +
                      EBS: ${recommendations.recommendedPlans.awsEc2.costBreakdown.ebsStorage.toFixed(2)} +
                      Transfer: ${recommendations.recommendedPlans.awsEc2.costBreakdown.dataTransfer.toFixed(2)}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{recommendations.recommendedPlans.awsEc2.notes}</p>
                </div>
              )}

              {/* Azure */}
              {recommendations.recommendedPlans.azure !== 'No suitable plan found' && (
                <div className="bg-blue-50 p-6 rounded-xl shadow-md border border-blue-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-semibold mr-3">
                      AZURE
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {recommendations.recommendedPlans.azure.name}
                  </h4>
                  <p className="text-xl font-bold text-blue-600 mb-2">
                    ${recommendations.recommendedPlans.azure.totalMonthlyCost.toFixed(2)}/month
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>💾 RAM: {recommendations.recommendedPlans.azure.ram} GB</div>
                    <div>🖥️ CPU: {recommendations.recommendedPlans.azure.cpu} cores</div>
                    <div>💽 Storage: {recommendations.recommendedPlans.azure.storage} GB</div>
                  </div>
                  {recommendations.recommendedPlans.azure.costBreakdown && (
                    <div className="text-xs text-gray-500 mt-2">
                      Instance: ${recommendations.recommendedPlans.azure.costBreakdown.instanceCost.toFixed(2)} +
                      Disk: ${recommendations.recommendedPlans.azure.costBreakdown.managedDisk.toFixed(2)} +
                      Bandwidth: ${recommendations.recommendedPlans.azure.costBreakdown.bandwidth.toFixed(2)}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{recommendations.recommendedPlans.azure.notes}</p>
                </div>
              )}

              {/* Google Cloud */}
              {recommendations.recommendedPlans.gcp !== 'No suitable plan found' && (
                <div className="bg-red-50 p-6 rounded-xl shadow-md border border-red-200">
                  <div className="flex items-center mb-4">
                    <div className="bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold mr-3">
                      GOOGLE CLOUD
                    </div>
                  </div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    {recommendations.recommendedPlans.gcp.name}
                  </h4>
                  <p className="text-xl font-bold text-red-600 mb-2">
                    ${recommendations.recommendedPlans.gcp.totalMonthlyCost.toFixed(2)}/month
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>💾 RAM: {recommendations.recommendedPlans.gcp.ram} GB</div>
                    <div>🖥️ CPU: {recommendations.recommendedPlans.gcp.cpu} cores</div>
                  </div>
                  {recommendations.recommendedPlans.gcp.costBreakdown && (
                    <div className="text-xs text-gray-500 mt-2">
                      Instance: ${recommendations.recommendedPlans.gcp.costBreakdown.instanceCost.toFixed(2)} +
                      Disk: ${recommendations.recommendedPlans.gcp.costBreakdown.persistentDisk.toFixed(2)} +
                      Egress: ${recommendations.recommendedPlans.gcp.costBreakdown.networkEgress.toFixed(2)}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">{recommendations.recommendedPlans.gcp.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Final Selection & Costing */}
        {recommendations && recommendations.comparison.cheapestOption && (
          <div className="border-t pt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Final Selection & Costing</h3>

            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-8 rounded-xl shadow-lg border-2 border-purple-300">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center mb-2">
                    <div className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold mr-3">
                      SELECTED PLAN
                    </div>
                    <h4 className="text-2xl font-bold text-gray-800">
                      {recommendations.comparison.cheapestOption.name}
                    </h4>
                  </div>
                  <p className="text-gray-600">{recommendations.comparison.cheapestOption.notes}</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-purple-600">
                    ${recommendations.comparison.cheapestOption.totalMonthlyCost.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">per month</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Plan Specifications */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-700 mb-2">Specifications</h5>
                  <div className="text-sm space-y-1">
                    {recommendations.comparison.cheapestOption.ram && (
                      <div>💾 RAM: {recommendations.comparison.cheapestOption.ram} GB</div>
                    )}
                    {recommendations.comparison.cheapestOption.cpu && (
                      <div>🖥️ CPU: {recommendations.comparison.cheapestOption.cpu} cores</div>
                    )}
                    {recommendations.comparison.cheapestOption.storage && (
                      <div>💽 Storage: {recommendations.comparison.cheapestOption.storage} GB</div>
                    )}
                    {recommendations.comparison.cheapestOption.transfer && (
                      <div>🌐 Transfer: {recommendations.comparison.cheapestOption.transfer}</div>
                    )}
                  </div>
                </div>

                {/* Cost Breakdown */}
                {recommendations.comparison.cheapestOption.costBreakdown && (
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <h5 className="font-semibold text-gray-700 mb-2">Cost Breakdown</h5>
                    <div className="text-sm space-y-1">
                      <div>Instance: ${recommendations.comparison.cheapestOption.costBreakdown.instanceCost.toFixed(2)}</div>
                      {recommendations.comparison.cheapestOption.costBreakdown.ebsStorage > 0 && (
                        <div>EBS Storage: ${recommendations.comparison.cheapestOption.costBreakdown.ebsStorage.toFixed(2)}</div>
                      )}
                      {recommendations.comparison.cheapestOption.costBreakdown.managedDisk > 0 && (
                        <div>Managed Disk: ${recommendations.comparison.cheapestOption.costBreakdown.managedDisk.toFixed(2)}</div>
                      )}
                      {recommendations.comparison.cheapestOption.costBreakdown.persistentDisk > 0 && (
                        <div>Persistent Disk: ${recommendations.comparison.cheapestOption.costBreakdown.persistentDisk.toFixed(2)}</div>
                      )}
                      {recommendations.comparison.cheapestOption.costBreakdown.dataTransfer > 0 && (
                        <div>Data Transfer: ${recommendations.comparison.cheapestOption.costBreakdown.dataTransfer.toFixed(2)}</div>
                      )}
                      {recommendations.comparison.cheapestOption.costBreakdown.bandwidth > 0 && (
                        <div>Bandwidth: ${recommendations.comparison.cheapestOption.costBreakdown.bandwidth.toFixed(2)}</div>
                      )}
                      {recommendations.comparison.cheapestOption.costBreakdown.networkEgress > 0 && (
                        <div>Network Egress: ${recommendations.comparison.cheapestOption.costBreakdown.networkEgress.toFixed(2)}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Annual Projection */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-700 mb-2">Annual Projection</h5>
                  <div className="text-sm space-y-1">
                    <div className="text-lg font-bold text-green-600">
                      ${(recommendations.comparison.cheapestOption.totalMonthlyCost * 12).toFixed(2)}
                    </div>
                    <div className="text-gray-600">Total yearly cost</div>
                    {recommendations.comparison.costSavings && (
                      <div className="text-green-700 text-xs mt-2">
                        Annual savings: ${(recommendations.comparison.costSavings.amount * 12).toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Resource Utilization */}
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h5 className="font-semibold text-gray-700 mb-2">Resource Match</h5>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>RAM Required:</span>
                      <span className="text-green-600">{recommendations.workload.requiredRamGB} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>CPU Required:</span>
                      <span className="text-green-600">{recommendations.workload.requiredCpu} cores</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Storage Needed:</span>
                      <span className="text-green-600">{recommendations.workload.totalStorageRequiredGB} GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transfer Needed:</span>
                      <span className="text-green-600">{recommendations.workload.totalTransferRequiredTB} TB</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-purple-200">
              <button 
                className="flex-1 bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                onClick={() => {
                  // Update form data with selected plan
                  const selectedPlan = recommendations.comparison.cheapestOption;
                  if (selectedPlan.id && selectedPlan.id.includes('lightsail')) {
                    handleInputChange('cloudProvider', 'aws');
                    handleInputChange('vmService', 'lightsail');
                    handleInputChange('lightsailPlan', selectedPlan.id);
                  } else if (selectedPlan.id && selectedPlan.id.includes('ec2')) {
                    handleInputChange('cloudProvider', 'aws');
                    handleInputChange('vmService', 'ec2');
                    handleInputChange('ec2Plan', selectedPlan.id);
                  } else if (selectedPlan.id && selectedPlan.id.includes('azure')) {
                    handleInputChange('cloudProvider', 'azure');
                    handleInputChange('azureVm', selectedPlan.id);
                  } else if (selectedPlan.id && selectedPlan.id.includes('gcp')) {
                    handleInputChange('cloudProvider', 'google');
                    handleInputChange('googleVm', selectedPlan.id);
                  }
                  
                  // Store final costing information
                  handleInputChange('finalPlan', {
                    name: selectedPlan.name,
                    provider: selectedPlan.id ? selectedPlan.id.split('-')[0] : 'unknown',
                    monthlyCost: selectedPlan.totalMonthlyCost,
                    annualCost: selectedPlan.totalMonthlyCost * 12,
                    costBreakdown: selectedPlan.costBreakdown,
                    specifications: {
                      ram: selectedPlan.ram,
                      cpu: selectedPlan.cpu,
                      storage: selectedPlan.storage,
                      transfer: selectedPlan.transfer
                    },
                    workloadMatch: {
                      requiredRam: recommendations.workload.requiredRamGB,
                      requiredCpu: recommendations.workload.requiredCpu,
                      requiredStorage: recommendations.workload.totalStorageRequiredGB,
                      requiredTransfer: recommendations.workload.totalTransferRequiredTB
                    }
                  });

                  handleNext()
                }}
              >
                🚀 Confirm & Proceed with This Plan
              </button>
            </div>          
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderPage5 = () => {
    const totalCost = calculateTotalCost();
    const selectedCloudBroker = cloudBrokers.find(b => b.id === formData.cloudBroker);
    const selectedMqttBroker = mqttBrokers.find(m => m.id === formData.mqttBroker);
    const selectedDatabase = databases.find(d => d.id === formData.database);
    const vmCost = vmCostCalculation().price

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <FileText className="mx-auto mb-4 text-indigo-500" size={48} />
          <h2 className="text-2xl font-bold text-gray-800">Cost Report</h2>
          <p className="text-gray-600">Complete cost breakdown and summary</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Device Configuration</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Machines:</span>
                <span className="font-medium">{formData.machines}</span>
              </div>
              <div className="flex justify-between">
                <span>Tags per Machine:</span>
                <span className="font-medium">{formData.tagsPerMachine}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tags:</span>
                <span className="font-medium">{formData.machines * formData.tagsPerMachine}</span>
              </div>
              <div className="flex justify-between">
                <span>Message Size:</span>
                <span className="font-medium">{formData.messageSize} KB</span>
              </div>
              <div className="flex justify-between">
                <span>Frequency:</span>
                <span className="font-medium">{formData.frequency} seconds</span>
              </div>
              <div className="flex justify-between">
                <span>IoT Gateways:</span>
                <span className="font-medium">{formData.iotGateways}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Data Metrics</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Messages/Month:</span>
                <span className="font-medium">{calculations.monthlyMessages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Messages/Year:</span>
                <span className="font-medium">{calculations.yearlyMessages.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Data/Month:</span>
                <span className="font-medium">{(calculations.monthlyData / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between">
                <span>Data/Year:</span>
                <span className="font-medium">{(calculations.yearlyData / 1024 / 1024).toFixed(2)} GB</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Selected Services</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Cloud Broker</h4>
              <p className="text-sm text-green-700">
                {selectedCloudBroker ? selectedCloudBroker.name : 'Not selected'}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-800 mb-2">VM Broker</h4>
              <p className="text-sm text-purple-700">
                {formData.provider ? (formData.provider.toUpperCase() + " - " + formData.vmService.charAt(0).toUpperCase() + formData.vmService.slice(1) + " - " + getCurrentService()) : 'Not selected'}
              </p>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-medium text-orange-800 mb-2">Cold Data Storage</h4>
              <p className="text-sm text-orange-700">
                {selectedDatabase ? selectedDatabase.name : 'Not selected'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
          <h3 className="text-xl font-bold mb-4 text-indigo-800">Cost Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-indigo-600">
                ${totalCost.toFixed(2)}
              </p>
              <p className="text-indigo-700">Monthly Cost</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-600">
                ${(totalCost * 12).toFixed(2)}
              </p>
              <p className="text-indigo-700">Annual Cost</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Cost Breakdown</h3>
          <div className="space-y-3">
            {selectedCloudBroker && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{selectedCloudBroker.name}</span>
                <span className="font-medium">
                  ${((calculations.monthlyMessages / 1000000) * selectedCloudBroker.pricing.messagesPerMillion).toFixed(2)}/month
                </span>
              </div>
            )}
            {selectedDatabase && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{selectedDatabase.name}</span>
                <span className="font-medium">
                  ${((calculations.monthlyData / 1024 / 1024) * selectedDatabase.pricing.storagePerGB).toFixed(2)}/month
                </span>
              </div>
            )}
            {formData.provider && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">{formData.provider.toUpperCase() + " - " + formData.vmService.charAt(0).toUpperCase() + formData.vmService.slice(1) + " - " + getCurrentService()}</span>
                <span className="font-medium">
                  ${(() => {
                    return parseFloat(formData.finalPlan.monthlyCost).toFixed(2)
                  })()}/month
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const canProceed = () => {
    switch (currentPage) {
      case 1:
        return formData.machines > 0 && formData.tagsPerMachine > 0 && formData.messageSize > 0 && formData.frequency > 0;
      case 2:
        return formData.cloudBroker !== null;
      case 3:
        return formData.database !== null;
      case 4:
        return formData.lightsailPlan !== null || formData.ec2Plan !== null || formData.azureVm !== null || formData.googleVm !== null;
      case 5:
        return true;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className='flex flex-row justify-center items-center gap-4 text-center'>
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
              className={`flex items-center px-6 py-2 rounded-lg font-medium ${currentPage === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-500 text-white hover:bg-gray-600'
                }`}
            >
              <ChevronLeft size={20} className="mr-2" />
              Previous
            </button>

            <button
              onClick={currentPage === 5 ? handleDownload : handleNext}
              disabled={currentPage === 5 ? true : !canProceed()}
              className={`flex items-center px-6 py-2 rounded-lg font-medium ${currentPage === 5 || !canProceed()
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
            >
              {currentPage === 5 ? 'Download' : 'Next'}
              {currentPage !== 5 && <ChevronRight size={20} className="ml-2" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IIoTCostCalculator;