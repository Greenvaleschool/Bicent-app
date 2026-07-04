export interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  type: 'stock' | 'crypto' | 'commodity';
  volume: string;
  status?: 'live' | 'delayed';
}

export const INITIAL_ASSETS: Asset[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 64231.50, change: 1240.20, changePercent: 1.96, type: 'crypto', volume: '34.2B', status: 'live' },
  { symbol: 'ETH', name: 'Ethereum', price: 3421.12, change: -45.10, changePercent: -1.30, type: 'crypto', volume: '12.1B', status: 'live' },
  { symbol: 'SOL', name: 'Solana', price: 145.67, change: 8.42, changePercent: 6.13, type: 'crypto', volume: '4.5B', status: 'live' },
  { symbol: 'SCOM', name: 'Safaricom PLC', price: 17.45, change: 0.25, changePercent: 1.45, type: 'stock', volume: '12.4M', status: 'live' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.43, change: 2.15, changePercent: 1.15, type: 'stock', volume: '56.2M', status: 'delayed' },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 175.22, change: -3.84, changePercent: -2.14, type: 'stock', volume: '102.1M', status: 'delayed' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 894.50, change: 12.45, changePercent: 1.41, type: 'stock', volume: '44.8M', status: 'delayed' },
  { symbol: 'GOLD', name: 'Gold Spot', price: 2178.40, change: 15.20, changePercent: 0.70, type: 'commodity', volume: '1.2B', status: 'live' },
  { symbol: 'SILVER', name: 'Silver Spot', price: 31.42, change: 0.45, changePercent: 1.45, type: 'commodity', volume: '450M', status: 'live' },
  { symbol: 'OIL', name: 'Crude Oil WTI', price: 78.45, change: 1.15, changePercent: 1.49, type: 'commodity', volume: '1.8M', status: 'live' },
  { symbol: 'NATGAS', name: 'Natural Gas', price: 2.14, change: -0.08, changePercent: -3.60, type: 'commodity', volume: '2.4B', status: 'live' },
  { symbol: 'COPPER', name: 'Copper Spot', price: 4.54, change: 0.12, changePercent: 2.71, type: 'commodity', volume: '180M', status: 'live' },
  { symbol: 'NICKEL', name: 'Nickel Spot', price: 16450.00, change: -210.50, changePercent: -1.26, type: 'commodity', volume: '850M', status: 'live' },
  { symbol: 'PLAT', name: 'Platinum', price: 985.20, change: 4.30, changePercent: 0.44, type: 'commodity', volume: '15M', status: 'live' },
  { symbol: 'PALL', name: 'Palladium', price: 1024.50, change: -12.40, changePercent: -1.20, type: 'commodity', volume: '8M', status: 'live' },
  { symbol: 'ALUM', name: 'Aluminium Spot', price: 2542.00, change: 12.50, changePercent: 0.49, type: 'commodity', volume: '120M', status: 'live' },
  { symbol: 'ZINC', name: 'Zinc Spot', price: 2895.50, change: -15.20, changePercent: -0.52, type: 'commodity', volume: '85M', status: 'live' },
  { symbol: 'LITH', name: 'Lithium Carbonate', price: 14200.00, change: 450.00, changePercent: 3.27, type: 'commodity', volume: '12M', status: 'live' },
  { symbol: 'URAN', name: 'Uranium (U3O8)', price: 92.45, change: 1.15, changePercent: 1.26, type: 'commodity', volume: '2M', status: 'live' },
  { symbol: 'COAL', name: 'Coal (Newcastle)', price: 132.50, change: -2.40, changePercent: -1.78, type: 'commodity', volume: '15M', status: 'live' },
  { symbol: 'IRON', name: 'Iron Ore 62% Fe', price: 105.40, change: 1.20, changePercent: 1.15, type: 'commodity', volume: '250M', status: 'live' },
  { symbol: 'COFFEE', name: 'Coffee Arabica', price: 185.30, change: 2.15, changePercent: 1.17, type: 'commodity', volume: '45k', status: 'live' },
  { symbol: 'COCOA', name: 'Cocoa Futures', price: 9845.00, change: 125.00, changePercent: 1.29, type: 'commodity', volume: '12k', status: 'live' },
  { symbol: 'SUGAR', name: 'Sugar No. 11', price: 21.45, change: -0.32, changePercent: -1.47, type: 'commodity', volume: '120k', status: 'live' },
  { symbol: 'WHEAT', name: 'Wheat SRW', price: 542.50, change: 12.40, changePercent: 2.34, type: 'commodity', volume: '310k', status: 'live' },
  { symbol: 'CORN', name: 'Corn Futures', price: 432.25, change: -5.15, changePercent: -1.18, type: 'commodity', volume: '420k', status: 'live' },
  { symbol: 'SOYB', name: 'Soybean Futures', price: 1185.50, change: 8.40, changePercent: 0.71, type: 'commodity', volume: '350k', status: 'live' },
  { symbol: 'COTTON', name: 'Cotton No. 2', price: 82.14, change: 0.85, changePercent: 1.05, type: 'commodity', volume: '25k', status: 'live' },
  { symbol: 'LCAT', name: 'Live Cattle', price: 182.45, change: 0.65, changePercent: 0.36, type: 'commodity', volume: '18k', status: 'live' },
  { symbol: 'RUBR', name: 'Natural Rubber', price: 1.62, change: 0.02, changePercent: 1.25, type: 'commodity', volume: '5k', status: 'live' },
];

export const generateChartData = (basePrice: number, points = 30) => {
  const data = [];
  let lastClose = basePrice;
  const now = new Date();

  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 1000);
    const volatility = basePrice * 0.006;
    const open = lastClose;
    const close = open + (Math.random() - 0.5) * volatility;
    const high = Math.max(open, close) + Math.random() * (volatility * 0.3);
    const low = Math.min(open, close) - Math.random() * (volatility * 0.3);
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open,
      high,
      low,
      close,
      body: [open, close],
      price: close
    });
    lastClose = close;
  }
  return data;
};