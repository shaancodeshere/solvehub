export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  content: string;
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: 'freelance-invoice',
    name: 'Freelance Invoice',
    description: 'Hourly sprint, software licenses, 18% tax & total',
    badge: 'Invoice',
    content: `hours = 40 (Billable Development Hours)
rate = 85 (Hourly Consulting Rate)
engineering = hours * rate (Fullstack Sprint)
software_costs: 150 (Cloud Infrastructure & Tools)
tax 18% (Service Tax)
total`,
  },
  {
    id: 'restaurant-bill-split',
    name: 'Restaurant Bill Split',
    description: 'Food courses, drinks, 10% discount, tax & split 4-ways',
    badge: 'Split',
    content: `appetizers: 45 (Crispy Calamari & Dip)
mains: 120 (Ribeye & Wild Salmon)
drinks: 38 (Craft Cocktails & Wine)
dessert: 22 (Tiramisu & Espresso)
discount 10% (Happy Hour Special)
tax 8.5%
split between 4 people`,
  },
  {
    id: 'wealth-loan-compare',
    name: 'Wealth & Loan Compare',
    description: 'Systematic SIP wealth growth alongside loan EMI',
    badge: 'Finance',
    content: `sip ₹25000 at 12% for 15 years
emi ₹5000000 at 8.5% for 20 years`,
  },
  {
    id: 'monthly-living-budget',
    name: 'Monthly Living Budget',
    description: 'Salary take-home, rent, groceries, utilities & savings rate',
    badge: 'Budget',
    content: `salary = 6500 (Monthly Take-Home)
rent: 2200 (Apartment Lease)
groceries: 650 (Food & Essentials)
utilities: 280 (Power, Water & Fiber)
transport: 220 (Transit & Fuel)
living_expenses = rent + groceries + utilities + transport
savings_rate = ((salary - living_expenses) / salary) * 100
total`,
  },
];
