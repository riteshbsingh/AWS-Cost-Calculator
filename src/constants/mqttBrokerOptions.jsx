// mqttBrokerOptions.js
export const mqttBrokers = [
  {
    id: "aws_mqtt",
    name: "AWS Managed MQTT (via IoT Core)",
    pricePerMillionMessages: 1.0,
    deployment: "Managed",
    supportsQoS: [0, 1],
    notes: "Built into AWS IoT Core. Secure and scalable.",
  },
];
