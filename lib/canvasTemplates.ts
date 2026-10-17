export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  badge: string;
  tags: string[];
  content: string;
}

export const CANVAS_TEMPLATES: CanvasTemplate[] = [
  {
    id: 'freelancer-invoice',
    name: 'Freelancer Invoice & Tax Withholding',
    description: 'Calculate billable development hours, software tools, 18% tax withholding, and total invoice due.',
    badge: 'Invoicing',
    tags: ['Hourly Billing', 'Tax Withholding', 'Freelance', 'Contractor'],
    content: `hours = 45 (Billable Client Hours)
rate = 90 (Hourly Consulting Rate)
engineering = hours * rate (Fullstack Architecture)
software_tools: 180 (Cloud Services & Figma)
tax 18% (Tax Withholding)
total`,
  },
  {
    id: 'restaurant-bill-split',
    name: 'Restaurant Bill Split with Tip & Liquor Tax',
    description: 'Split a group dinner across appetizers, main entrees, wine, 10% voucher discount, 8.875% tax, and 20% gratuity.',
    badge: 'Dining',
    tags: ['Bill Split', 'Group Dining', 'Liquor Tax', 'Tip & Gratuity'],
    content: `appetizers: 54 (Charcuterie & Bruschetta)
entrees: 146 (Prime Rib & Sea Bass)
cocktails: 48 (Craft Drinks & Wine)
desserts: 28 (Tiramisu & Gelato)
discount 10% (Early Bird Promo)
tax 8.875% (State & Liquor Tax)
tip: 20% (Staff Gratuity)
split between 4 people`,
  },
  {
    id: 'home-renovation',
    name: 'Home Renovation Material & Labor Estimation',
    description: 'Estimate flooring, paint materials, fixture supplies, contractor labor hours, and municipal materials tax.',
    badge: 'Renovation',
    tags: ['Construction', 'Labor Hours', 'Material Estimate', 'Contractor'],
    content: `flooring_materials: 1850 (Hardwood Planks & Underlay)
drywall_paint: 620 (Primer, Paint & Supplies)
fixtures: 950 (Lighting & Electrical)
labor_hours = 60 (Contractor On-Site Work)
labor_rate = 65 (Hourly Labor Rate)
contractor_labor = labor_hours * labor_rate
tax 8% (Municipal Material Tax)
total`,
  },
  {
    id: 'saas-burn-tracker',
    name: 'SaaS Subscription Run-Rate & Burn Tracker',
    description: 'Compute Monthly Recurring Revenue (MRR), ARR, cloud infrastructure hosting, payment gateway fees, and operating margin.',
    badge: 'SaaS & Startup',
    tags: ['MRR / ARR', 'Run-Rate', 'SaaS Metrics', 'Operating Margin'],
    content: `subscribers = 450 (Active Pro Users)
monthly_arpu = 49 (Average Price / User)
mrr = subscribers * monthly_arpu (Monthly Recurring Revenue)
arr = mrr * 12 (Annual Run-Rate)
hosting_infra = 2800 (AWS & Databases)
support_tools = 950 (Helpdesk & Analytics)
payment_fees = mrr * 0.029 (Payment Gateway)
total_expenses = hosting_infra + support_tools + payment_fees
net_margin = mrr - total_expenses (Monthly Operating Profit)`,
  },
];
