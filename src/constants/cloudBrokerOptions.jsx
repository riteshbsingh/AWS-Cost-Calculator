// cloudBrokerOptions.js
export const cloudBrokers = [
  {
    id: "aws_iot_core",
    name: "AWS IoT Core",
    pricePerMillionMessages: 1.0, // USD
    supportedProtocols: ["MQTT", "HTTP", "WebSocket"],
    sla: "99.9%",
    notes: "Scales automatically with no infrastructure to manage.",
  },
];
