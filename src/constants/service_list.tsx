export const azurePlans = [
    // B-Series Burstable VMs
    { id: 'azure-b1ls', name: 'B1ls', ram: 0.5, cpu: 1, storage: 32, price: 3.8 },
    { id: 'azure-b1s', name: 'B1s', ram: 1, cpu: 1, storage: 32, price: 7.6 },
    { id: 'azure-b1ms', name: 'B1ms', ram: 2, cpu: 1, storage: 32, price: 15.2 },
    { id: 'azure-b2s', name: 'B2s', ram: 4, cpu: 2, storage: 64, price: 30.4 },
    { id: 'azure-b2ms', name: 'B2ms', ram: 8, cpu: 2, storage: 64, price: 60.8 },
    { id: 'azure-b4ms', name: 'B4ms', ram: 16, cpu: 4, storage: 128, price: 121.6 },
    { id: 'azure-b8ms', name: 'B8ms', ram: 32, cpu: 8, storage: 256, price: 243.2 },
    { id: 'azure-b12ms', name: 'B12ms', ram: 48, cpu: 12, storage: 384, price: 364.8 },
    { id: 'azure-b16ms', name: 'B16ms', ram: 64, cpu: 16, storage: 512, price: 486.4 },
    { id: 'azure-b20ms', name: 'B20ms', ram: 80, cpu: 20, storage: 640, price: 608 },

    // D-Series v5 General Purpose
    { id: 'azure-d2s_v5', name: 'D2s_v5', ram: 8, cpu: 2, storage: 75, price: 70.1 },
    { id: 'azure-d4s_v5', name: 'D4s_v5', ram: 16, cpu: 4, storage: 150, price: 140.2 },
    { id: 'azure-d8s_v5', name: 'D8s_v5', ram: 32, cpu: 8, storage: 300, price: 280.4 },
    { id: 'azure-d16s_v5', name: 'D16s_v5', ram: 64, cpu: 16, storage: 600, price: 560.8 },
    { id: 'azure-d32s_v5', name: 'D32s_v5', ram: 128, cpu: 32, storage: 1200, price: 1121.6 },
    { id: 'azure-d48s_v5', name: 'D48s_v5', ram: 192, cpu: 48, storage: 1800, price: 1682.4 },
    { id: 'azure-d64s_v5', name: 'D64s_v5', ram: 256, cpu: 64, storage: 2400, price: 2243.2 },
    { id: 'azure-d96s_v5', name: 'D96s_v5', ram: 384, cpu: 96, storage: 3600, price: 3364.8 },

    // D-Series v4 General Purpose
    { id: 'azure-d2s_v4', name: 'D2s_v4', ram: 8, cpu: 2, storage: 75, price: 70.1 },
    { id: 'azure-d4s_v4', name: 'D4s_v4', ram: 16, cpu: 4, storage: 150, price: 140.2 },
    { id: 'azure-d8s_v4', name: 'D8s_v4', ram: 32, cpu: 8, storage: 300, price: 280.4 },
    { id: 'azure-d16s_v4', name: 'D16s_v4', ram: 64, cpu: 16, storage: 600, price: 560.8 },
    { id: 'azure-d32s_v4', name: 'D32s_v4', ram: 128, cpu: 32, storage: 1200, price: 1121.6 },
    { id: 'azure-d48s_v4', name: 'D48s_v4', ram: 192, cpu: 48, storage: 1800, price: 1682.4 },
    { id: 'azure-d64s_v4', name: 'D64s_v4', ram: 256, cpu: 64, storage: 2400, price: 2243.2 },

    // D-Series v3 General Purpose
    { id: 'azure-d2s_v3', name: 'D2s_v3', ram: 8, cpu: 2, storage: 75, price: 70.1 },
    { id: 'azure-d4s_v3', name: 'D4s_v3', ram: 16, cpu: 4, storage: 150, price: 140.2 },
    { id: 'azure-d8s_v3', name: 'D8s_v3', ram: 32, cpu: 8, storage: 300, price: 280.4 },
    { id: 'azure-d16s_v3', name: 'D16s_v3', ram: 64, cpu: 16, storage: 600, price: 560.8 },
    { id: 'azure-d32s_v3', name: 'D32s_v3', ram: 128, cpu: 32, storage: 1200, price: 1121.6 },
    { id: 'azure-d48s_v3', name: 'D48s_v3', ram: 192, cpu: 48, storage: 1800, price: 1682.4 },
    { id: 'azure-d64s_v3', name: 'D64s_v3', ram: 256, cpu: 64, storage: 2400, price: 2243.2 },

    // E-Series v5 Memory Optimized
    { id: 'azure-e2s_v5', name: 'E2s_v5', ram: 16, cpu: 2, storage: 75, price: 122.6 },
    { id: 'azure-e4s_v5', name: 'E4s_v5', ram: 32, cpu: 4, storage: 150, price: 245.2 },
    { id: 'azure-e8s_v5', name: 'E8s_v5', ram: 64, cpu: 8, storage: 300, price: 490.4 },
    { id: 'azure-e16s_v5', name: 'E16s_v5', ram: 128, cpu: 16, storage: 600, price: 980.8 },
    { id: 'azure-e20s_v5', name: 'E20s_v5', ram: 160, cpu: 20, storage: 750, price: 1226 },
    { id: 'azure-e32s_v5', name: 'E32s_v5', ram: 256, cpu: 32, storage: 1200, price: 1961.6 },
    { id: 'azure-e48s_v5', name: 'E48s_v5', ram: 384, cpu: 48, storage: 1800, price: 2942.4 },
    { id: 'azure-e64s_v5', name: 'E64s_v5', ram: 512, cpu: 64, storage: 2400, price: 3923.2 },
    { id: 'azure-e96s_v5', name: 'E96s_v5', ram: 672, cpu: 96, storage: 3600, price: 5148.8 },

    // E-Series v4 Memory Optimized
    { id: 'azure-e2s_v4', name: 'E2s_v4', ram: 16, cpu: 2, storage: 75, price: 122.6 },
    { id: 'azure-e4s_v4', name: 'E4s_v4', ram: 32, cpu: 4, storage: 150, price: 245.2 },
    { id: 'azure-e8s_v4', name: 'E8s_v4', ram: 64, cpu: 8, storage: 300, price: 490.4 },
    { id: 'azure-e16s_v4', name: 'E16s_v4', ram: 128, cpu: 16, storage: 600, price: 980.8 },
    { id: 'azure-e20s_v4', name: 'E20s_v4', ram: 160, cpu: 20, storage: 750, price: 1226 },
    { id: 'azure-e32s_v4', name: 'E32s_v4', ram: 256, cpu: 32, storage: 1200, price: 1961.6 },
    { id: 'azure-e48s_v4', name: 'E48s_v4', ram: 384, cpu: 48, storage: 1800, price: 2942.4 },
    { id: 'azure-e64s_v4', name: 'E64s_v4', ram: 512, cpu: 64, storage: 2400, price: 3923.2 },

    // F-Series v2 Compute Optimized
    { id: 'azure-f2s_v2', name: 'F2s_v2', ram: 4, cpu: 2, storage: 75, price: 85.3 },
    { id: 'azure-f4s_v2', name: 'F4s_v2', ram: 8, cpu: 4, storage: 150, price: 170.6 },
    { id: 'azure-f8s_v2', name: 'F8s_v2', ram: 16, cpu: 8, storage: 300, price: 341.2 },
    { id: 'azure-f16s_v2', name: 'F16s_v2', ram: 32, cpu: 16, storage: 600, price: 682.4 },
    { id: 'azure-f32s_v2', name: 'F32s_v2', ram: 64, cpu: 32, storage: 1200, price: 1364.8 },
    { id: 'azure-f48s_v2', name: 'F48s_v2', ram: 96, cpu: 48, storage: 1800, price: 2047.2 },
    { id: 'azure-f64s_v2', name: 'F64s_v2', ram: 128, cpu: 64, storage: 2400, price: 2729.6 },
    { id: 'azure-f72s_v2', name: 'F72s_v2', ram: 144, cpu: 72, storage: 2700, price: 3071.8 },

    // A-Series Basic
    { id: 'azure-a0', name: 'A0', ram: 0.75, cpu: 1, storage: 20, price: 13.1 },
    { id: 'azure-a1', name: 'A1', ram: 1.75, cpu: 1, storage: 70, price: 51.8 },
    { id: 'azure-a2', name: 'A2', ram: 3.5, cpu: 2, storage: 135, price: 103.7 },
    { id: 'azure-a3', name: 'A3', ram: 7, cpu: 4, storage: 285, price: 207.4 },
    { id: 'azure-a4', name: 'A4', ram: 14, cpu: 8, storage: 605, price: 414.7 },

    // A-Series v2
    { id: 'azure-a1_v2', name: 'A1_v2', ram: 2, cpu: 1, storage: 10, price: 40.9 },
    { id: 'azure-a2_v2', name: 'A2_v2', ram: 4, cpu: 2, storage: 20, price: 81.8 },
    { id: 'azure-a4_v2', name: 'A4_v2', ram: 8, cpu: 4, storage: 40, price: 163.7 },
    { id: 'azure-a8_v2', name: 'A8_v2', ram: 16, cpu: 8, storage: 80, price: 327.4 },
    { id: 'azure-a2m_v2', name: 'A2m_v2', ram: 16, cpu: 2, storage: 20, price: 142.3 },
    { id: 'azure-a4m_v2', name: 'A4m_v2', ram: 32, cpu: 4, storage: 40, price: 284.6 },
    { id: 'azure-a8m_v2', name: 'A8m_v2', ram: 64, cpu: 8, storage: 80, price: 569.2 },

    // M-Series Memory Optimized (High Memory)
    { id: 'azure-m8ms', name: 'M8ms', ram: 219, cpu: 8, storage: 256, price: 1556.3 },
    { id: 'azure-m16ms', name: 'M16ms', ram: 438, cpu: 16, storage: 512, price: 3112.6 },
    { id: 'azure-m32ms', name: 'M32ms', ram: 875, cpu: 32, storage: 1024, price: 6225.2 },
    { id: 'azure-m64ms', name: 'M64ms', ram: 1750, cpu: 64, storage: 2048, price: 12450.4 },
    { id: 'azure-m128ms', name: 'M128ms', ram: 3800, cpu: 128, storage: 4096, price: 26987.5 },

    // G-Series Memory Optimized
    { id: 'azure-g1', name: 'G1', ram: 28, cpu: 2, storage: 384, price: 512.8 },
    { id: 'azure-g2', name: 'G2', ram: 56, cpu: 4, storage: 768, price: 1025.6 },
    { id: 'azure-g3', name: 'G3', ram: 112, cpu: 8, storage: 1536, price: 2051.2 },
    { id: 'azure-g4', name: 'G4', ram: 224, cpu: 16, storage: 3072, price: 4102.4 },
    { id: 'azure-g5', name: 'G5', ram: 448, cpu: 32, storage: 6144, price: 8204.8 },

    // GS-Series Memory Optimized with Premium Storage
    { id: 'azure-gs1', name: 'GS1', ram: 28, cpu: 2, storage: 56, price: 512.8 },
    { id: 'azure-gs2', name: 'GS2', ram: 56, cpu: 4, storage: 112, price: 1025.6 },
    { id: 'azure-gs3', name: 'GS3', ram: 112, cpu: 8, storage: 224, price: 2051.2 },
    { id: 'azure-gs4', name: 'GS4', ram: 224, cpu: 16, storage: 448, price: 4102.4 },
    { id: 'azure-gs5', name: 'GS5', ram: 448, cpu: 32, storage: 896, price: 8204.8 },

    // L-Series Storage Optimized
    { id: 'azure-l4s', name: 'L4s', ram: 32, cpu: 4, storage: 678, price: 313.3 },
    { id: 'azure-l8s', name: 'L8s', ram: 64, cpu: 8, storage: 1388, price: 626.6 },
    { id: 'azure-l16s', name: 'L16s', ram: 128, cpu: 16, storage: 2807, price: 1253.2 },
    { id: 'azure-l32s', name: 'L32s', ram: 256, cpu: 32, storage: 5630, price: 2506.4 },

    // N-Series GPU VMs
    { id: 'azure-nc6', name: 'NC6', ram: 56, cpu: 6, storage: 340, price: 1686.4 },
    { id: 'azure-nc12', name: 'NC12', ram: 112, cpu: 12, storage: 680, price: 3372.8 },
    { id: 'azure-nc24', name: 'NC24', ram: 224, cpu: 24, storage: 1440, price: 6745.6 },
    { id: 'azure-nc6s_v2', name: 'NC6s_v2', ram: 112, cpu: 6, storage: 336, price: 2029.2 },
    { id: 'azure-nc12s_v2', name: 'NC12s_v2', ram: 224, cpu: 12, storage: 672, price: 4058.4 },
    { id: 'azure-nc24s_v2', name: 'NC24s_v2', ram: 448, cpu: 24, storage: 1344, price: 8116.8 },

    // H-Series High Performance Computing
    { id: 'azure-h8', name: 'H8', ram: 56, cpu: 8, storage: 1000, price: 1095.2 },
    { id: 'azure-h16', name: 'H16', ram: 112, cpu: 16, storage: 2000, price: 2190.4 },
    { id: 'azure-h8m', name: 'H8m', ram: 112, cpu: 8, storage: 1000, price: 1542.4 },
    { id: 'azure-h16m', name: 'H16m', ram: 224, cpu: 16, storage: 2000, price: 3084.8 }
];

export const AWS_LIGHTSAIL_PLANS = [
    { id: 'plan-5', name: '$5/mo', price: 5, ram: 0.5, cpu: '2 vCPUs', storage: '20 GB SSD', transfer: '1 TB', service: 'Lightsail' },
    { id: 'plan-7', name: '$7/mo', price: 7, ram: 1, cpu: '2 vCPUs', storage: '40 GB SSD', transfer: '2 TB', service: 'Lightsail' },
    { id: 'plan-12', name: '$12/mo', price: 12, ram: 2, cpu: '2 vCPUs', storage: '60 GB SSD', transfer: '3 TB', service: 'Lightsail' },
    { id: 'plan-24', name: '$24/mo', price: 24, ram: 4, cpu: '2 vCPUs', storage: '80 GB SSD', transfer: '4 TB', service: 'Lightsail' },
    { id: 'plan-44', name: '$44/mo', price: 44, ram: 8, cpu: '2 vCPUs', storage: '160 GB SSD', transfer: '5 TB', service: 'Lightsail' },
    { id: 'plan-84', name: '$84/mo', price: 84, ram: 16, cpu: '4 vCPUs', storage: '320 GB SSD', transfer: '6 TB', service: 'Lightsail' },
    { id: 'plan-164', name: '$164/mo', price: 164, ram: 32, cpu: '8 vCPUs', storage: '640 GB SSD', transfer: '7 TB', service: 'Lightsail' },
    { id: 'plan-384', name: '$384/mo', price: 384, ram: 64, cpu: '16 vCPUs', storage: '1280 GB SSD', transfer: '8 TB', service: 'Lightsail' },
];

export const AWS_EC2_PLANS = [
    { id: 'ec2-t3a.nano', name: 't3a.nano', price: 3.43, ram: 0.5, cpu: '2 vCPUs (Burstable)', storage: 'EBS only', transfer: 'Up to 5 Gbps', service: 'EC2' },
    { id: 'ec2-t3a.micro', name: 't3a.micro', price: 6.95, ram: 1, cpu: '2 vCPUs (Burstable)', storage: 'EBS only', transfer: 'Up to 5 Gbps', service: 'EC2' },
    { id: 'ec2-t3a.small', name: 't3a.small', price: 13.96, ram: 2, cpu: '2 vCPUs (Burstable)', storage: 'EBS only', transfer: 'Up to 5 Gbps', service: 'EC2' },
    { id: 'ec2-t3a.medium', name: 't3a.medium', price: 27.89, ram: 4, cpu: '2 vCPUs (Burstable)', storage: 'EBS only', transfer: 'Up to 5 Gbps', service: 'EC2' },
    { id: 'ec2-t3a.large', name: 't3a.large', price: 54.90, ram: 8, cpu: '2 vCPUs (Burstable)', storage: 'EBS only', transfer: 'Up to 5 Gbps', service: 'EC2' },
    { id: 'ec2-t3a.xlarge', name: 't3a.xlarge', price: 109.79, ram: 16, cpu: '4 vCPUs (Burstable)', storage: 'EBS only', transfer: 'Up to 5 Gbps', service: 'EC2' },
    { id: 'ec2-t3a.2xlarge', name: 't3a.2xlarge', price: 219.58, ram: 32, cpu: '8 vCPUs (Burstable)', storage: 'EBS only', transfer: 'Up to 5 Gbps', service: 'EC2' },
];

export const gcpPlans = [
    {
        id: 'gcp-e2-micro',
        name: 'e2-micro',
        ram: 1,
        cpu: 2,
        storage: 10,
        price: 6.11,
        service: 'GCP'
    },
    {
        id: 'gcp-e2-small',
        name: 'e2-small',
        ram: 2,
        cpu: 2,
        storage: 10,
        price: 12.23,
        service: 'GCP'
    },
    {
        id: 'gcp-e2-medium',
        name: 'e2-medium',
        ram: 4,
        cpu: 2,
        storage: 10,
        price: 24.45,
        service: 'GCP'
    },
    {
        id: 'gcp-e2-standard-2',
        name: 'e2-standard-2',
        ram: 8,
        cpu: 2,
        storage: 10,
        price: 48.91,
        service: 'GCP'
    },
    {
        id: 'gcp-e2-standard-4',
        name: 'e2-standard-4',
        ram: 16,
        cpu: 4,
        storage: 10,
        price: 97.81,
        service: 'GCP'
    },
    {
        id: 'gcp-e2-standard-8',
        name: 'e2-standard-8',
        ram: 32,
        cpu: 8,
        storage: 10,
        price: 195.62,
        service: 'GCP'
    }
];
