
export interface CountryNode {
  name: string;
  code: string;
  symbol: string;
  rateToUSD: number;
}

export const COUNTRIES: CountryNode[] = [
  { name: "United States", code: "USD", symbol: "$", rateToUSD: 1 },
  { name: "Kenya", code: "KES", symbol: "KSh", rateToUSD: 129.5 },
  { name: "United Kingdom", code: "GBP", symbol: "£", rateToUSD: 0.78 },
  { name: "European Union", code: "EUR", symbol: "€", rateToUSD: 0.92 },
  { name: "Japan", code: "JPY", symbol: "¥", rateToUSD: 154.2 },
  { name: "United Arab Emirates", code: "AED", symbol: "د.إ", rateToUSD: 3.67 },
  { name: "South Africa", code: "ZAR", symbol: "R", rateToUSD: 18.25 },
  { name: "Nigeria", code: "NGN", symbol: "₦", rateToUSD: 1480.0 },
  { name: "India", code: "INR", symbol: "₹", rateToUSD: 83.4 },
  { name: "China", code: "CNY", symbol: "¥", rateToUSD: 7.24 },
  { name: "Australia", code: "AUD", symbol: "A$", rateToUSD: 1.51 },
  { name: "Brazil", code: "BRL", symbol: "R$", rateToUSD: 5.18 },
  { name: "Switzerland", code: "CHF", symbol: "CHF", rateToUSD: 0.89 },
  { name: "Hong Kong", code: "HKD", symbol: "HK$", rateToUSD: 7.8 },
  { name: "Sweden", code: "SEK", symbol: "kr", rateToUSD: 10.5 },
  { name: "Canada", code: "CAD", symbol: "C$", rateToUSD: 1.37 },
];
