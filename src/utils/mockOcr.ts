export interface MockOcrResult {
  amount: number;
  merchant: string;
  dateLabel: string;
}

const SAMPLES: MockOcrResult[] = [
  { amount: 87500, merchant: 'Indomaret', dateLabel: 'Hari ini' },
  { amount: 125000, merchant: 'Alfamart', dateLabel: 'Hari ini' },
  { amount: 45200, merchant: 'Kopi Kenangan', dateLabel: 'Hari ini' },
  { amount: 210000, merchant: 'Superindo', dateLabel: 'Hari ini' },
];

export function mockOcr(): MockOcrResult {
  return SAMPLES[Math.floor(Math.random() * SAMPLES.length)];
}

export function mockOcrFromUri(): MockOcrResult {
  return mockOcr();
}
