import React, { useState, useEffect } from 'react';
import { Calculator, Info, DollarSign, Wifi, MessageSquare, Database, Zap, Radio, MapPin, Shield } from 'lucide-react';

const AWSIoTCoreCalculator = () => {
    const [inputs, setInputs] = useState({
        // Basic configuration
        region: 'us-east-1',
        devices: 1000,
        days: 30,

        // Connectivity
        connectivityHours: 24,

        // Messaging
        messagesPerDay: 100,
        messageSize: 5, // KB
        protocolType: 'mqtt',
        basicIngestPercent: 0,

        // Device Shadow & Registry
        shadowUpdatesPerDay: 10,
        shadowSize: 1, // KB
        registryOperationsPerDay: 5,
        registrySize: 1, // KB

        // Rules Engine
        rulesPerDay: 50,
        actionsPerRule: 1,
        ruleMessageSize: 5, // KB

        // LoRaWAN
        useLoRaWAN: false,
        lorawanUplinksPerDay: 24,
        lorawanDownlinksPerDay: 2,
        lorawanJoinsPerWeek: 1,
        useLoRaWANMetrics: false,
        fuotaTasks: 0,

        // Device Location
        useDeviceLocation: false,
        locationSolves: 0,
        advancedTransportData: 0, // MB

        // Free tier
        applyFreeTier: true
    });

    const [results, setResults] = useState({
        connectivity: 0,
        messaging: 0,
        deviceShadow: 0,
        registry: 0,
        rulesEngine: 0,
        lorawanMessaging: 0,
        lorawanMetrics: 0,
        fuota: 0,
        deviceLocation: 0,
        advancedTransport: 0,
        total: 0
    });

    // Regional pricing
    const pricing = {
        'us-east-1': {
            connectivity: 0.08, // per million minutes
            messaging: 1.00, // per million messages
            deviceShadow: 1.25, // per million operations
            registry: 1.25, // per million operations
            rulesTriggered: 0.15, // per million rules
            actionsApplied: 0.15, // per million actions
            lorawanMessaging: 2.3, // per million messages
            lorawanMetrics: 2.0, // per million records
            fuota: 0.1, // per task after first 100
            deviceLocation: 0.0014, // per location solve after first 1000
            advancedTransport1: 0.145, // per MB for first 50MB
            advancedTransport2: 0.116 // per MB above 50MB
        },
        'eu-west-1': {
            connectivity: 0.08,
            messaging: 1.00,
            deviceShadow: 1.25,
            registry: 1.25,
            rulesTriggered: 0.15,
            actionsApplied: 0.15,
            lorawanMessaging: 2.3,
            lorawanMetrics: 2.0,
            fuota: 0.1,
            deviceLocation: 0.0014,
            advancedTransport1: 0.145,
            advancedTransport2: 0.116
        },
        'ap-southeast-1': {
            connectivity: 0.08,
            messaging: 1.20,
            deviceShadow: 1.50,
            registry: 1.50,
            rulesTriggered: 0.18,
            actionsApplied: 0.18,
            lorawanMessaging: 2.76,
            lorawanMetrics: 2.4,
            fuota: 0.12,
            deviceLocation: 0.00168,
            advancedTransport1: 0.174,
            advancedTransport2: 0.139
        },
        'ap-south-1': {
            connectivity: 0.092, // per million minutes
            messaging: 1.05,
            deviceShadow: 1.31, // per million operations
            registry: 1.31, // per million operations
            rulesTriggered: 0.158, // per million rules
            actionsApplied: 0.158, // per million actions
            lorawanMessaging: 'Not Available',
            lorawanMetrics: 'Not Available',
            fuota: 'Not Available',
            deviceLocation: 'Not Available',
            advancedTransport1: 'Not Available',
            advancedTransport2: 'Not Available'
        }
    };

    // Free tier limits (per month)
    const freeTier = {
        connectivityMinutes: 2250000,
        messages: 500000,
        shadowRegistryOps: 225000,
        rulesTriggered: 250000,
        actionsApplied: 250000,
        fuotaTasks: 100,
        locationSolves: 1000
    };

    const calculateCosts = () => {
        const regionPricing = pricing[inputs.region];
        const totalDevices = inputs.devices;
        const totalDays = inputs.days;

        // Connectivity calculations
        const connectivityMinutes = totalDevices * (inputs.connectivityHours * 60) * totalDays;
        let billableConnectivityMinutes = connectivityMinutes;
        if (inputs.applyFreeTier) {
            billableConnectivityMinutes = Math.max(0, connectivityMinutes - freeTier.connectivityMinutes);
        }
        const connectivityCost = (billableConnectivityMinutes / 1000000) * regionPricing.connectivity;

        // Messaging calculations
        const messageCount = totalDevices * inputs.messagesPerDay * totalDays;
        const meteredMessages = Math.ceil(inputs.messageSize / 5) * messageCount;
        const basicIngestMessages = (meteredMessages * inputs.basicIngestPercent) / 100;
        const billableMessages = meteredMessages - basicIngestMessages;
        let finalBillableMessages = billableMessages;
        if (inputs.applyFreeTier) {
            finalBillableMessages = Math.max(0, billableMessages - freeTier.messages);
        }
        const messagingCost = (finalBillableMessages / 1000000) * regionPricing.messaging;

        // Device Shadow calculations
        const shadowOperations = totalDevices * inputs.shadowUpdatesPerDay * totalDays;
        const meteredShadowOps = Math.ceil(inputs.shadowSize / 1) * shadowOperations;
        let billableShadowOps = meteredShadowOps;
        if (inputs.applyFreeTier) {
            const remainingFreeTier = Math.max(0, freeTier.shadowRegistryOps - 0);
            billableShadowOps = Math.max(0, meteredShadowOps - remainingFreeTier);
        }
        const shadowCost = (billableShadowOps / 1000000) * regionPricing.deviceShadow;

        // Registry calculations
        const registryOperations = totalDevices * inputs.registryOperationsPerDay * totalDays;
        const meteredRegistryOps = Math.ceil(inputs.registrySize / 1) * registryOperations;
        let billableRegistryOps = meteredRegistryOps;
        if (inputs.applyFreeTier) {
            const usedFreeTier = inputs.applyFreeTier ? Math.min(freeTier.shadowRegistryOps, meteredShadowOps) : 0;
            const remainingFreeTier = Math.max(0, freeTier.shadowRegistryOps - usedFreeTier);
            billableRegistryOps = Math.max(0, meteredRegistryOps - remainingFreeTier);
        }
        const registryCost = (billableRegistryOps / 1000000) * regionPricing.registry;

        // Rules Engine calculations
        const rulesTriggered = totalDevices * inputs.rulesPerDay * totalDays;
        const actionsApplied = rulesTriggered * inputs.actionsPerRule;
        const meteredRules = Math.ceil(inputs.ruleMessageSize / 5) * rulesTriggered;
        const meteredActions = Math.ceil(inputs.ruleMessageSize / 5) * actionsApplied;

        let billableRules = meteredRules;
        let billableActions = meteredActions;
        if (inputs.applyFreeTier) {
            billableRules = Math.max(0, meteredRules - freeTier.rulesTriggered);
            billableActions = Math.max(0, meteredActions - freeTier.actionsApplied);
        }

        const rulesCost = (billableRules / 1000000) * regionPricing.rulesTriggered +
            (billableActions / 1000000) * regionPricing.actionsApplied;

        // LoRaWAN calculations
        let lorawanMessagingCost = 0;
        let lorawanMetricsCost = 0;
        let fuotaCost = 0;

        if (inputs.useLoRaWAN) {
            const uplinks = totalDevices * inputs.lorawanUplinksPerDay * totalDays;
            const downlinks = totalDevices * inputs.lorawanDownlinksPerDay * totalDays;
            const joins = totalDevices * inputs.lorawanJoinsPerWeek * (totalDays / 7);
            const totalLoRaWANMessages = uplinks + downlinks + joins;

            lorawanMessagingCost = (totalLoRaWANMessages / 1000000) * regionPricing.lorawanMessaging;

            if (inputs.useLoRaWANMetrics) {
                lorawanMetricsCost = (totalLoRaWANMessages / 1000000) * regionPricing.lorawanMetrics;
            }

            if (inputs.fuotaTasks > 0) {
                const billableFuotaTasks = inputs.applyFreeTier ?
                    Math.max(0, inputs.fuotaTasks - freeTier.fuotaTasks) : inputs.fuotaTasks;
                fuotaCost = billableFuotaTasks * regionPricing.fuota;
            }
        }

        // Device Location calculations
        let deviceLocationCost = 0;
        let advancedTransportCost = 0;

        if (inputs.useDeviceLocation) {
            const billableLocationSolves = inputs.applyFreeTier ?
                Math.max(0, inputs.locationSolves - freeTier.locationSolves) : inputs.locationSolves;
            deviceLocationCost = billableLocationSolves * regionPricing.deviceLocation;

            if (inputs.advancedTransportData > 0) {
                const first50MB = Math.min(inputs.advancedTransportData, 50);
                const above50MB = Math.max(0, inputs.advancedTransportData - 50);
                advancedTransportCost = (first50MB * regionPricing.advancedTransport1) +
                    (above50MB * regionPricing.advancedTransport2);
            }
        }

        const total = connectivityCost + messagingCost + shadowCost + registryCost +
            rulesCost + lorawanMessagingCost + lorawanMetricsCost + fuotaCost +
            deviceLocationCost + advancedTransportCost;

        setResults({
            connectivity: connectivityCost,
            messaging: messagingCost,
            deviceShadow: shadowCost,
            registry: registryCost,
            rulesEngine: rulesCost,
            lorawanMessaging: lorawanMessagingCost,
            lorawanMetrics: lorawanMetricsCost,
            fuota: fuotaCost,
            deviceLocation: deviceLocationCost,
            advancedTransport: advancedTransportCost,
            total: total
        });
    };

    useEffect(() => {
        calculateCosts();
    }, [inputs]);

    const handleInputChange = (field, value) => {
        setInputs(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 6
        }).format(amount);
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white">
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <Calculator className="w-8 h-8 text-orange-600" />
                    <h1 className="text-3xl font-bold text-gray-900">AWS IoT Core Cost Calculator</h1>
                </div>
                <p className="text-gray-600">Calculate your AWS IoT Core costs across all service components</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Input Panel */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Configuration */}
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5" />
                            Basic Configuration
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">AWS Region</label>
                                <select
                                    value={inputs.region}
                                    onChange={(e) => handleInputChange('region', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="us-east-1">US East (N. Virginia)</option>
                                    <option value="eu-west-1">Europe (Ireland)</option>
                                    <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                                    <option value="ap-south-1">Asia Pacific (Mumbai)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Number of Devices</label>
                                <input
                                    type="number"
                                    value={inputs.devices}
                                    onChange={(e) => handleInputChange('devices', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Time Period (Days)</label>
                                <input
                                    type="number"
                                    value={inputs.days}
                                    onChange={(e) => handleInputChange('days', parseInt(e.target.value) || 1)}
                                    className="w-full p-2 border rounded-md"
                                    min="1"
                                />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={inputs.applyFreeTier}
                                    onChange={(e) => handleInputChange('applyFreeTier', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm">Apply AWS Free Tier (12 months)</span>
                            </label>
                        </div>
                    </div>

                    {/* Connectivity */}
                    <div className="bg-blue-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Wifi className="w-5 h-5 text-blue-600" />
                            Connectivity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Connection Hours per Day</label>
                                <input
                                    type="number"
                                    value={inputs.connectivityHours}
                                    onChange={(e) => handleInputChange('connectivityHours', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                    max="24"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Messaging */}
                    <div className="bg-green-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            Messaging
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Messages per Device per Day</label>
                                <input
                                    type="number"
                                    value={inputs.messagesPerDay}
                                    onChange={(e) => handleInputChange('messagesPerDay', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Average Message Size (KB)</label>
                                <input
                                    type="number"
                                    value={inputs.messageSize}
                                    onChange={(e) => handleInputChange('messageSize', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Protocol Type</label>
                                <select
                                    value={inputs.protocolType}
                                    onChange={(e) => handleInputChange('protocolType', e.target.value)}
                                    className="w-full p-2 border rounded-md"
                                >
                                    <option value="mqtt">MQTT</option>
                                    <option value="http">HTTP</option>
                                    <option value="websocket">WebSocket</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Basic Ingest Usage (%)</label>
                                <input
                                    type="number"
                                    value={inputs.basicIngestPercent}
                                    onChange={(e) => handleInputChange('basicIngestPercent', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                    max="100"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Device Shadow & Registry */}
                    <div className="bg-purple-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Database className="w-5 h-5 text-purple-600" />
                            Device Shadow & Registry
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Shadow Updates per Device per Day</label>
                                <input
                                    type="number"
                                    value={inputs.shadowUpdatesPerDay}
                                    onChange={(e) => handleInputChange('shadowUpdatesPerDay', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Average Shadow Size (KB)</label>
                                <input
                                    type="number"
                                    value={inputs.shadowSize}
                                    onChange={(e) => handleInputChange('shadowSize', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Registry Operations per Device per Day</label>
                                <input
                                    type="number"
                                    value={inputs.registryOperationsPerDay}
                                    onChange={(e) => handleInputChange('registryOperationsPerDay', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Average Registry Record Size (KB)</label>
                                <input
                                    type="number"
                                    value={inputs.registrySize}
                                    onChange={(e) => handleInputChange('registrySize', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Rules Engine */}
                    <div className="bg-yellow-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Zap className="w-5 h-5 text-yellow-600" />
                            Rules Engine
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Rules per Device per Day</label>
                                <input
                                    type="number"
                                    value={inputs.rulesPerDay}
                                    onChange={(e) => handleInputChange('rulesPerDay', parseInt(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Actions per Rule</label>
                                <input
                                    type="number"
                                    value={inputs.actionsPerRule}
                                    onChange={(e) => handleInputChange('actionsPerRule', parseInt(e.target.value) || 1)}
                                    className="w-full p-2 border rounded-md"
                                    min="1"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Rule Message Size (KB)</label>
                                <input
                                    type="number"
                                    value={inputs.ruleMessageSize}
                                    onChange={(e) => handleInputChange('ruleMessageSize', parseFloat(e.target.value) || 0)}
                                    className="w-full p-2 border rounded-md"
                                    min="0"
                                    step="0.1"
                                />
                            </div>
                        </div>
                    </div>

                    {/* LoRaWAN */}
                    {/* <div className="bg-red-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Radio className="w-5 h-5 text-red-600" />
                            LoRaWAN
                        </h3>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={inputs.useLoRaWAN}
                                    onChange={(e) => handleInputChange('useLoRaWAN', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium">Use LoRaWAN</span>
                            </label>
                        </div>
                        {inputs.useLoRaWAN && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Uplinks per Device per Day</label>
                                        <input
                                            type="number"
                                            value={inputs.lorawanUplinksPerDay}
                                            onChange={(e) => handleInputChange('lorawanUplinksPerDay', parseInt(e.target.value) || 0)}
                                            className="w-full p-2 border rounded-md"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Downlinks per Device per Day</label>
                                        <input
                                            type="number"
                                            value={inputs.lorawanDownlinksPerDay}
                                            onChange={(e) => handleInputChange('lorawanDownlinksPerDay', parseInt(e.target.value) || 0)}
                                            className="w-full p-2 border rounded-md"
                                            min="0"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Joins per Device per Week</label>
                                        <input
                                            type="number"
                                            value={inputs.lorawanJoinsPerWeek}
                                            onChange={(e) => handleInputChange('lorawanJoinsPerWeek', parseInt(e.target.value) || 0)}
                                            className="w-full p-2 border rounded-md"
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                checked={inputs.useLoRaWANMetrics}
                                                onChange={(e) => handleInputChange('useLoRaWANMetrics', e.target.checked)}
                                                className="mr-2"
                                            />
                                            <span className="text-sm">Use LoRaWAN Metrics</span>
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">FUOTA Tasks</label>
                                        <input
                                            type="number"
                                            value={inputs.fuotaTasks}
                                            onChange={(e) => handleInputChange('fuotaTasks', parseInt(e.target.value) || 0)}
                                            className="w-full p-2 border rounded-md"
                                            min="0"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div> */}

                    {/* Device Location */}
                    {/* <div className="bg-indigo-50 p-6 rounded-lg">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-indigo-600" />
                            Device Location
                        </h3>
                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={inputs.useDeviceLocation}
                                    onChange={(e) => handleInputChange('useDeviceLocation', e.target.checked)}
                                    className="mr-2"
                                />
                                <span className="text-sm font-medium">Use Device Location</span>
                            </label>
                        </div>
                        {inputs.useDeviceLocation && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Location Solves per Month</label>
                                    <input
                                        type="number"
                                        value={inputs.locationSolves}
                                        onChange={(e) => handleInputChange('locationSolves', parseInt(e.target.value) || 0)}
                                        className="w-full p-2 border rounded-md"
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Advanced Transport Data (MB/month)</label>
                                    <input
                                        type="number"
                                        value={inputs.advancedTransportData}
                                        onChange={(e) => handleInputChange('advancedTransportData', parseFloat(e.target.value) || 0)}
                                        className="w-full p-2 border rounded-md"
                                        min="0"
                                        step="0.1"
                                    />
                                </div>
                            </div>
                        )}
                    </div> */}
                </div>

                {/* Results Panel */}
                <div className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 top-6">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <DollarSign className="w-6 h-6 text-green-600" />
                            Cost Breakdown
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600">Connectivity</span>
                                <span className="font-medium">{formatCurrency(results.connectivity)}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600">Messaging</span>
                                <span className="font-medium">{formatCurrency(results.messaging)}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600">Device Shadow</span>
                                <span className="font-medium">{formatCurrency(results.deviceShadow)}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600">Registry</span>
                                <span className="font-medium">{formatCurrency(results.registry)}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b">
                                <span className="text-sm text-gray-600">Rules Engine</span>
                                <span className="font-medium">{formatCurrency(results.rulesEngine)}</span>
                            </div>

                            {inputs.useLoRaWAN && (
                                <>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-sm text-gray-600">LoRaWAN Messaging</span>
                                        <span className="font-medium">{formatCurrency(results.lorawanMessaging)}</span>
                                    </div>

                                    {inputs.useLoRaWANMetrics && (
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">LoRaWAN Metrics</span>
                                            <span className="font-medium">{formatCurrency(results.lorawanMetrics)}</span>
                                        </div>
                                    )}

                                    {inputs.fuotaTasks > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">FUOTA Tasks</span>
                                            <span className="font-medium">{formatCurrency(results.fuota)}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {inputs.useDeviceLocation && (
                                <>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-sm text-gray-600">Device Location</span>
                                        <span className="font-medium">{formatCurrency(results.deviceLocation)}</span>
                                    </div>

                                    {inputs.advancedTransportData > 0 && (
                                        <div className="flex justify-between items-center py-2 border-b">
                                            <span className="text-sm text-gray-600">Advanced Transport</span>
                                            <span className="font-medium">{formatCurrency(results.advancedTransport)}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="mt-6 pt-4 border-t-2 border-gray-300">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold">Total Cost</span>
                                <span className="text-2xl font-bold text-green-600">{formatCurrency(results.total)}</span>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                For {inputs.days} days with {inputs.devices.toLocaleString()} devices
                            </div>
                        </div>

                        {inputs.applyFreeTier && (
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-800">Free Tier Applied</span>
                                </div>
                                <div className="text-xs text-blue-600">
                                    <div>• 2.25M connection minutes</div>
                                    <div>• 500K messages</div>
                                    <div>• 225K shadow/registry operations</div>
                                    <div>• 250K rules + 250K actions</div>
                                    <div>• 100 FUOTA tasks</div>
                                    <div>• 1K location solves</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Monthly Projection */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <h4 className="font-semibold mb-4">Monthly Projection</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Current Period ({inputs.days} days)</span>
                                <span className="font-medium">{formatCurrency(results.total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Projected Monthly (30 days)</span>
                                <span className="font-medium text-blue-600">
                                    {formatCurrency(results.total * (30 / inputs.days))}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Projected Annual</span>
                                <span className="font-medium text-purple-600">
                                    {formatCurrency(results.total * (365 / inputs.days))}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Cost Per Device */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h4 className="font-semibold mb-4">Cost Per Device</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Per Device (Current Period)</span>
                                <span className="font-medium">
                                    {formatCurrency(inputs.devices > 0 ? results.total / inputs.devices : 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Per Device Monthly</span>
                                <span className="font-medium text-green-600">
                                    {formatCurrency(inputs.devices > 0 ? (results.total * (30 / inputs.days)) / inputs.devices : 0)}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Per Device Annual</span>
                                <span className="font-medium text-green-700">
                                    {formatCurrency(inputs.devices > 0 ? (results.total * (365 / inputs.days)) / inputs.devices : 0)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Usage Summary */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <h4 className="font-semibold mb-4">Usage Summary</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Connection Minutes</span>
                                <span>{(inputs.devices * inputs.connectivityHours * 60 * inputs.days).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Messages</span>
                                <span>{(inputs.devices * inputs.messagesPerDay * inputs.days).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Shadow Operations</span>
                                <span>{(inputs.devices * inputs.shadowUpdatesPerDay * inputs.days).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Registry Operations</span>
                                <span>{(inputs.devices * inputs.registryOperationsPerDay * inputs.days).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Rules Triggered</span>
                                <span>{(inputs.devices * inputs.rulesPerDay * inputs.days).toLocaleString()}</span>
                            </div>
                            {inputs.useLoRaWAN && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">LoRaWAN Uplinks</span>
                                        <span>{(inputs.devices * inputs.lorawanUplinksPerDay * inputs.days).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">LoRaWAN Downlinks</span>
                                        <span>{(inputs.devices * inputs.lorawanDownlinksPerDay * inputs.days).toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 p-6 bg-gray-100 rounded-lg">
                <h4 className="font-semibold mb-3">Important Notes</h4>
                <div className="text-sm text-gray-600 space-y-2">
                    <p>• Pricing is based on current AWS IoT Core rates and may vary by region</p>
                    <p>• Messages are metered in 5KB increments (e.g., 8KB message = 2 metered messages)</p>
                    <p>• Device Shadow and Registry operations are metered in 1KB increments</p>
                    <p>• Rules Engine processing is metered in 5KB increments for both rules and actions</p>
                    <p>• Free tier applies for the first 12 months after creating your AWS account</p>
                    <p>• Basic Ingest messages via MQTT/HTTP reserved topics are free</p>
                    <p>• Data transfer charges may apply for certain rule actions</p>
                    <p>• This calculator provides estimates only - actual costs may vary</p>
                </div>
            </div>
        </div>
    );
};

export default AWSIoTCoreCalculator;