// @ts-nocheck
import { useMemo, useState } from "react";

const DEFAULTS = {
  regularMembers: 50,
  reducedMembers: 30,
  businessMembers: 5,

  regularFee: 50,
  regularFeePeriod: "year",
  reducedFee: 30,
  reducedFeePeriod: "year",
  businessFee: 120,
  businessFeePeriod: "year",

  deliveriesPerMemberMonth: 2,
  avgDeliveryFee: 5.5,

  errandTripsPerMemberMonth: 2,
  avgErrandFee: 20,

  dseeFundingEnabled: false,
  dseeFundingAmount: 500,

  courierPayModel: "minimumWage",
  managementPayModel: "minimumWage",
  minimumWage: 13.9,
  employerOnCostPct: 4,
  courierPersons: 4,
  tripMinutes: 45,
  managementHoursMonth: 20,
  allowancePerPersonYear: 960,

  paymentFeePct: 1.4,
  carSharePct: 15,
  kmPerCarTrip: 8,
  carCostKm: 0.3,
  operationalLossPct: 3,

  fundingEnabled: false,
  fundingPct: 50,

  cargoBikeMode: "lease",
  cargoBikeLeaseMonth: 90,
  cargoBikePurchase: 3000,

  bikeCount: 2,
  bikePrice: 400,
  usefulLifeYears: 3,
  bikeEquipmentPerBikeYear: 200,
  bikeMaintenancePerBikeYear: 100,

  hostingYear: 180,
  developerAccountsYear: 116,
  insuranceYear: 515,
  marketingYear: 300,

  basicAdminYear: 150,
  accountingTaxYear: 600,
  legalComplianceYear: 500,
  customerSupportYear: 120,
  contingencyPct: 10,
};

const DSEE_TOOLTIP_DE =
  "Deutsche Stiftung Engagement und Ehrenamt Mikroförderprogramm mit bis zu 1.500 Euro. Rein ehrenamtlich getragene Organisationen in ländlichen und strukturschwachen Regionen stehen dabei im Fokus der Förderung.";

const DSEE_TOOLTIP_EN =
  "German Foundation for Engagement and Volunteering micro-funding programme with up to €1,500. The focus is on purely volunteer-run organisations in rural and structurally weak regions.";

const TEXT = {
  de: {
    title1: "Profit & Loss",
    title2: "Calculator",
    revenue: "Umsatz",
    laborDelivery: "Lohn & Lieferung",
    equipmentOpex: "Equipment & OPEX",
    year: "/ Jahr",
    month: "/ Monat",
    reset: "Zurücksetzen",

    regularMembers: "Reguläre Mitglieder",
    regularAmount: "Regulärer Betrag",
    reducedMembers: "Ermäßigte Mitglieder",
    reducedAmount: "Ermäßigter Betrag",
    businessPartners: "Business-Partner",
    businessAmount: "Business-Betrag",
    deliveriesPerMemberMonth: "Lieferungen / Mitglied / Monat",
    deliveriesMonth: "Lieferungen / Monat (berechnet)",
    avgDeliveryFee: "Ø Liefergebühr",
    errandTripsPerMemberMonth: "Besorgungen / Mitglied / Monat",
    errandTripsMonth: "Besorgungsfahrten / Monat (berechnet)",
    avgErrandFee: "Ø Besorgungsgebühr",
    dseeFunding: "MikroFörderung-DSEE",
    dseeFundingAmount: "DSEE-Förderbetrag",

    courierPay: "Lohn Kurier:innen",
    managementPay: "Lohn Personalmanagement",
    minimumWage: "Mindestlohn: 13,90 €/h",
    allowance: "Ehrenamtspauschale: 960 €/Jahr",
    couriers: "Kurier:innen",
    management: "Personalmanagement",
    persons: "Person(en)",
    tripTime: "Zeit / Fahrt",
    pmHoursMonth: "PM-Stunden / Monat",
    carShare: "Auto-Anteil",
    kmPerCarTrip: "Km / Autofahrt",
    carCosts: "Auto-Kosten",
    paymentFee: "Payment Fee",
    operationalLoss: "Fehlfahrten / Erstattungen",
    funding: 'Förderung „Dig​itale regionale Heimatprojekte“',
    fundingRate: "Förderquote",

    cargoBikeModel: "Lastenrad-Modell",
    lease: "Leasing",
    buy: "Kauf",
    cargoBikeLease: "Lastenrad Leasing",
    cargoBikePurchase: "Lastenrad Kauf",
    bikes: "(Falt-)Räder",
    pricePerBike: "Preis / (Falt-)Rad",
    usefulLife: "Nutzungsdauer",
    bikeEquipment: "Fahrradequipment",
    bikeMaintenance: "Fahrrad-Instandhaltung",
    marketing: "Marketing",
    hosting: "Hosting / Website",
    developerAccounts: "Developer Accounts",
    insurance: "Versicherung",
    basicAdmin: "Basic Admin / Bank",
    accountingTax: "Buchhaltung / Steuer",
    legalCompliance: "Legal / Datenschutz / Compliance",
    customerSupport: "Kundensupport / Telefon",
    contingency: "Reserve / Contingency",

    netResult: "Nettoergebnis",
    costPerOrder: "Kosten / Auftrag",
    grossMargin: "Gross Margin",
    position: "Position",
    yearOneAmount: "Betrag Jahr 1",
    regularRevenue: "Reguläre Mitgliedsbeiträge",
    reducedRevenue: "Ermäßigte Mitgliedsbeiträge",
    businessRevenue: "Business-Beiträge",
    deliveryRevenue: "Liefergebühren",
    errandRevenue: "Besorgungsgebühren",
    dseeFundingRevenue: "MikroFörderung-DSEE",
    operatingRevenue: "Operativer Umsatz",
    courierLabor: "Personal Kurier:innen",
    managementLabor: "Personalmanagement",
    carTrips: "Fahrten / Auto",
    paymentFees: "Payment Fees",
    operationalLossOutput: "Fehlfahrten / Erstattungen",
    annualizedBikes: "(Falt-)Räder annualisiert",
    cargoBike: "Lastenrad",
    digitalCosts: "Hosting / App / Website",
    eligibleCosts: "Zuwendungsfähige Kosten",
    regionalFundingOutput: "Förderung digitale Heimatprojekte",
    totalFunding: "Förderung gesamt",
    netYearOne: "Nettoergebnis Jahr 1",
    ordersYear: "Aufträge / Jahr",
    costsBeforeFunding: "Kosten vor Förderung",
    grossProfit: "Gross Profit",

    overview: "Übersicht",
    amountEur: "in EUR",
    marginPct: "Marge in %",
    revenueOverview: "Revenue",
    cogsOverview: "Cost of Goods Sold (COGS)",
    sgaOverview: "Selling, General & Administrative (SG&A)",
    operatingProfit: "Operating Profit",

    years: "Jahre",
    minutes: "min",
  },

  en: {
    title1: "Profit & Loss",
    title2: "Calculator",
    revenue: "Revenue",
    laborDelivery: "Labor & Delivery",
    equipmentOpex: "Equipment & OPEX",
    year: "/ year",
    month: "/ month",
    reset: "Reset",

    regularMembers: "Regular members",
    regularAmount: "Regular fee",
    reducedMembers: "Reduced members",
    reducedAmount: "Reduced fee",
    businessPartners: "Business partners",
    businessAmount: "Business fee",
    deliveriesPerMemberMonth: "Deliveries / member / month",
    deliveriesMonth: "Deliveries / month (computed)",
    avgDeliveryFee: "Avg. delivery fee",
    errandTripsPerMemberMonth: "Errand trips / member / month",
    errandTripsMonth: "Errand trips / month (computed)",
    avgErrandFee: "Avg. errand fee",
    dseeFunding: "DSEE micro-funding",
    dseeFundingAmount: "DSEE funding amount",

    courierPay: "Courier pay",
    managementPay: "Staff management pay",
    minimumWage: "Minimum wage: €13.90/h",
    allowance: "Volunteer allowance: €960/year",
    couriers: "Couriers",
    management: "Staff management",
    persons: "person(s)",
    tripTime: "Time / trip",
    pmHoursMonth: "Management hours / month",
    carShare: "Car share",
    kmPerCarTrip: "Km / car trip",
    carCosts: "Car costs",
    paymentFee: "Payment fee",
    operationalLoss: "Failed trips / refunds",
    funding: "Funding: Digital regional home projects",
    fundingRate: "Funding rate",

    cargoBikeModel: "Cargo bike model",
    lease: "Lease",
    buy: "Buy",
    cargoBikeLease: "Cargo bike lease",
    cargoBikePurchase: "Cargo bike purchase",
    bikes: "Foldable bikes",
    pricePerBike: "Price / bike",
    usefulLife: "Useful life",
    bikeEquipment: "Bike equipment",
    bikeMaintenance: "Bike maintenance",
    marketing: "Marketing",
    hosting: "Hosting / website",
    developerAccounts: "Developer accounts",
    insurance: "Insurance",
    basicAdmin: "Basic admin / bank",
    accountingTax: "Accounting / tax",
    legalCompliance: "Legal / data protection / compliance",
    customerSupport: "Customer support / phone",
    contingency: "Contingency reserve",

    netResult: "Net result",
    costPerOrder: "Cost / order",
    grossMargin: "Gross margin",
    position: "Position",
    yearOneAmount: "Year 1 amount",
    regularRevenue: "Regular membership revenue",
    reducedRevenue: "Reduced membership revenue",
    businessRevenue: "Business revenue",
    deliveryRevenue: "Delivery fees",
    errandRevenue: "Errand fees",
    dseeFundingRevenue: "DSEE micro-funding",
    operatingRevenue: "Operating revenue",
    courierLabor: "Courier labor",
    managementLabor: "Staff management",
    carTrips: "Car trips",
    paymentFees: "Payment fees",
    operationalLossOutput: "Failed trips / refunds",
    annualizedBikes: "Annualized bikes",
    cargoBike: "Cargo bike",
    digitalCosts: "Hosting / app / website",
    eligibleCosts: "Eligible costs",
    regionalFundingOutput: "Digital regional funding",
    totalFunding: "Total funding",
    netYearOne: "Net result year 1",
    ordersYear: "Orders / year",
    costsBeforeFunding: "Costs before funding",
    grossProfit: "Gross profit",

    overview: "Overview",
    amountEur: "in EUR",
    marginPct: "Margin in %",
    revenueOverview: "Revenue",
    cogsOverview: "Cost of Goods Sold (COGS)",
    sgaOverview: "Selling, General & Administrative (SG&A)",
    operatingProfit: "Operating profit",

    years: "years",
    minutes: "min",
  },
};

function eur(value) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function signed(value) {
  return value >= 0 ? `+ ${eur(value)}` : `- ${eur(Math.abs(value))}`;
}

function annualize(amount, period) {
  return period === "month" ? amount * 12 : amount;
}

function pct(value) {
  if (!Number.isFinite(value)) return "0.0 %";
  return `${value.toFixed(1)} %`;
}

function SliderField({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "", tooltip = "" }) {
  return (
    <label className="pl-input" data-tooltip={tooltip}>
      <span>{label}</span>
      <div className="pl-slider-box">
        <input className="pl-range" type="range" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />
        <div className="pl-number-row">
          <input className="pl-number" type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))} />
          {suffix && <small>{suffix}</small>}
        </div>
      </div>
    </label>
  );
}

function AmountField({ label, amount, period, onAmountChange, onPeriodChange, maxYear = 1000, stepYear = 5, tooltip = "", t }) {
  const factor = period === "month" ? 12 : 1;
  const max = maxYear / factor;
  const step = stepYear / factor;
  return (
    <label className="pl-input" data-tooltip={tooltip}>
      <span>{label}</span>
      <div className="pl-slider-box">
        <input className="pl-range" type="range" value={amount} min={0} max={max} step={step} onChange={(e) => onAmountChange(Number(e.target.value))} />
        <div className="pl-number-row">
          <input className="pl-number" type="number" value={amount} min={0} max={max} step={step} onChange={(e) => onAmountChange(Number(e.target.value))} />
          <small>€</small>
          <select value={period} onChange={(e) => onPeriodChange(e.target.value)}>
            <option value="year">{t.year}</option>
            <option value="month">{t.month}</option>
          </select>
        </div>
      </div>
    </label>
  );
}

function PayModelSelect({ label, value, onChange, tooltip = "", t }) {
  return (
    <label className="pl-input" data-tooltip={tooltip}>
      <span>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="minimumWage">{t.minimumWage}</option>
        <option value="allowance">{t.allowance}</option>
      </select>
    </label>
  );
}

function DisplayField({ label, value, tooltip = "" }) {
  return (
    <div className="pl-input" data-tooltip={tooltip}>
      <span>{label}</span>
      <div className="pl-display-box">{value}</div>
    </div>
  );
}

function OverviewLabel({ children, tooltip }) {
  return (
    <span className="pl-row-tooltip" data-tooltip={tooltip}>
      {children}
    </span>
  );
}

export default function ProfitLossCalculator() {
  const [a, setA] = useState(DEFAULTS);
  const [lang, setLang] = useState("de");
  const t = TEXT[lang];

  const update = (key, value) => setA((prev) => ({ ...prev, [key]: value }));

  const updatePeriod = (amountKey, periodKey, newPeriod) => {
    setA((prev) => {
      const annualValue = annualize(prev[amountKey], prev[periodKey]);
      const newAmount = newPeriod === "month" ? annualValue / 12 : annualValue;
      return { ...prev, [periodKey]: newPeriod, [amountKey]: Math.round(newAmount * 100) / 100 };
    });
  };

  const r = useMemo(() => {
    const deliveriesMonth = Math.round(((a.regularMembers + a.reducedMembers) / 2) * a.deliveriesPerMemberMonth);
    const errandTripsMonth = Math.round(((a.regularMembers + a.reducedMembers) / 2) * a.errandTripsPerMemberMonth);
    const deliveriesYear = deliveriesMonth * 12;
    const errandTripsYear = errandTripsMonth * 12;
    const totalTripsYear = deliveriesYear + errandTripsYear;
    const tripHours = a.tripMinutes / 60;
    const managementPersons = Math.max(1, Math.ceil(a.courierPersons / 10));

    const regularRevenue = a.regularMembers * annualize(a.regularFee, a.regularFeePeriod);
    const reducedRevenue = a.reducedMembers * annualize(a.reducedFee, a.reducedFeePeriod);
    const businessRevenue = a.businessMembers * annualize(a.businessFee, a.businessFeePeriod);
    const deliveryRevenue = deliveriesYear * a.avgDeliveryFee;
    const errandRevenue = errandTripsYear * a.avgErrandFee;
    const operatingRevenue = regularRevenue + reducedRevenue + businessRevenue + deliveryRevenue + errandRevenue;

    const courierBaseLabor = a.courierPayModel === "minimumWage"
      ? totalTripsYear * tripHours * a.minimumWage
      : a.courierPersons * a.allowancePerPersonYear;
    const courierEmployerOnCosts = a.courierPayModel === "minimumWage" ? courierBaseLabor * (a.employerOnCostPct / 100) : 0;
    const courierLabor = courierBaseLabor + courierEmployerOnCosts;

    const managementBaseLabor = a.managementPayModel === "minimumWage"
      ? a.managementHoursMonth * 12 * a.minimumWage * managementPersons
      : managementPersons * a.allowancePerPersonYear;
    const managementEmployerOnCosts = a.managementPayModel === "minimumWage" ? managementBaseLabor * (a.employerOnCostPct / 100) : 0;
    const managementLabor = managementBaseLabor + managementEmployerOnCosts;

    const carTrips = totalTripsYear * (a.carSharePct / 100);
    const carCosts = carTrips * a.kmPerCarTrip * a.carCostKm;
    const paymentFees = operatingRevenue * (a.paymentFeePct / 100);
    const serviceRevenue = deliveryRevenue + errandRevenue;
    const operationalLoss = serviceRevenue * (a.operationalLossPct / 100);

    const bikePurchaseAnnualized = (a.bikeCount * a.bikePrice) / Math.max(a.usefulLifeYears, 1);
    const cargoBikeAnnualized = a.cargoBikeMode === "buy" ? a.cargoBikePurchase / Math.max(a.usefulLifeYears, 1) : 0;
    const cargoBikeLease = a.cargoBikeMode === "lease" ? a.cargoBikeLeaseMonth * 12 : 0;
    const totalBikeCount = a.bikeCount + 1;
    const bikeEquipment = totalBikeCount * a.bikeEquipmentPerBikeYear;
    const bikeMaintenance = totalBikeCount * a.bikeMaintenancePerBikeYear;
    const digitalCosts = a.hostingYear + a.developerAccountsYear;

    const cogs = courierLabor + carCosts + paymentFees + operationalLoss + bikePurchaseAnnualized + cargoBikeAnnualized + cargoBikeLease + bikeEquipment + bikeMaintenance;
    const grossProfit = operatingRevenue - cogs;

    const operatingOpex = a.insuranceYear + a.marketingYear + a.basicAdminYear + a.accountingTaxYear + a.legalComplianceYear + a.customerSupportYear;
    const sgaBeforeContingency = managementLabor + digitalCosts + operatingOpex;
    const contingency = (cogs + sgaBeforeContingency) * (a.contingencyPct / 100);
    const sga = sgaBeforeContingency + contingency;

    const eligibleCosts = courierLabor + managementLabor + carCosts + a.marketingYear + digitalCosts + a.accountingTaxYear + a.legalComplianceYear + bikePurchaseAnnualized + cargoBikeAnnualized + cargoBikeLease + bikeEquipment + bikeMaintenance;
    const regionalFundingAmount = a.fundingEnabled ? eligibleCosts * (a.fundingPct / 100) : 0;
    const dseeFundingAmount = a.dseeFundingEnabled ? a.dseeFundingAmount : 0;
    const totalFunding = regionalFundingAmount + dseeFundingAmount;

    const operatingProfit = grossProfit - sga + totalFunding;
    const netResult = operatingProfit;
    const totalCostsBeforeFunding = cogs + sga;
    const grossMargin = operatingRevenue > 0 ? (grossProfit / operatingRevenue) * 100 : 0;
    const cogsMargin = operatingRevenue > 0 ? (cogs / operatingRevenue) * 100 : 0;
    const sgaMargin = operatingRevenue > 0 ? (sga / operatingRevenue) * 100 : 0;
    const fundingMargin = operatingRevenue > 0 ? (totalFunding / operatingRevenue) * 100 : 0;
    const operatingMargin = operatingRevenue > 0 ? (operatingProfit / operatingRevenue) * 100 : 0;
    const cogsPerTrip = totalTripsYear > 0 ? cogs / totalTripsYear : 0;

    return { deliveriesMonth, errandTripsMonth, deliveriesYear, errandTripsYear, totalTripsYear, managementPersons, regularRevenue, reducedRevenue, businessRevenue, deliveryRevenue, errandRevenue, operatingRevenue, courierBaseLabor, courierEmployerOnCosts, courierLabor, managementBaseLabor, managementEmployerOnCosts, managementLabor, carTrips, carCosts, paymentFees, operationalLoss, bikePurchaseAnnualized, cargoBikeAnnualized, cargoBikeLease, bikeEquipment, bikeMaintenance, digitalCosts, operatingOpex, contingency, eligibleCosts, regionalFundingAmount, dseeFundingAmount, totalFunding, totalCostsBeforeFunding, cogs, cogsMargin, grossProfit, grossMargin, sga, sgaMargin, fundingMargin, operatingProfit, operatingMargin, netResult, cogsPerTrip };
  }, [a]);

  const overviewTooltips = {
    revenue: lang === "de" ? "Revenue = reguläre Mitgliedsbeiträge + ermäßigte Mitgliedsbeiträge + Business-Beiträge + Liefergebühren + Besorgungsgebühren. Förderungen werden separat ausgewiesen." : "Revenue = regular memberships + reduced memberships + business fees + delivery fees + errand fees. Funding is shown separately.",
    cogs: lang === "de" ? "COGS = Personal Kurier:innen inkl. 4 % Arbeitgebernebenkosten + Fahrten/Auto + Payment Fees + Fehlfahrten/Erstattungen + annualisierte (Falt-)Räder + Lastenrad + Fahrradequipment + Fahrrad-Instandhaltung." : "COGS = courier labor including 4% employer on-costs + car trips + payment fees + failed trips/refunds + annualized bikes + cargo bike + bike equipment + bike maintenance.",
    grossProfit: lang === "de" ? "Gross Profit = Revenue − COGS." : "Gross profit = revenue − COGS.",
    sga: lang === "de" ? "SG&A = Personalmanagement inkl. 4 % Arbeitgebernebenkosten + Hosting/App/Website + Versicherung + Marketing + Basic Admin/Bank + Buchhaltung/Steuer + Legal/Datenschutz/Compliance + Kundensupport/Telefon + Reserve." : "SG&A = staff management including 4% employer on-costs + hosting/app/website + insurance + marketing + basic admin/bank + accounting/tax + legal/data protection/compliance + customer support/phone + contingency reserve.",
    funding: lang === "de" ? "Förderung gesamt = Förderung digitale regionale Heimatprojekte + DSEE-Mikroförderung, sofern jeweils aktiviert." : "Total funding = digital regional funding + DSEE micro-funding if selected.",
    operatingProfit: lang === "de" ? "Operating Profit = Gross Profit − SG&A + Förderung gesamt." : "Operating profit = gross profit − SG&A + total funding.",
    courierLabor: lang === "de" ? "Kurier:innenkosten = Basislohn + 4 % Arbeitgebernebenkosten. Bei Mindestlohn: Aufträge/Jahr × Minuten/Fahrt ÷ 60 × 13,90 € × 1,04. Bei Ehrenamtspauschale: Kurier:innen × 960 €/Jahr, ohne Arbeitgebernebenkosten." : "Courier labor = base wage + 4% employer on-costs. Minimum wage: orders/year × minutes/trip ÷ 60 × €13.90 × 1.04. Volunteer allowance: couriers × €960/year, without employer on-costs.",
    managementLabor: lang === "de" ? "Personalmanagement = Basislohn + 4 % Arbeitgebernebenkosten. Bei Mindestlohn: PM-Stunden/Monat × 12 × 13,90 € × PM-Personen × 1,04. Bei Ehrenamtspauschale: PM-Personen × 960 €/Jahr." : "Staff management = base wage + 4% employer on-costs. Minimum wage: management hours/month × 12 × €13.90 × management persons × 1.04. Volunteer allowance: management persons × €960/year.",
  };

  return (
    <section className="bringo-pl">
      <style>{styles}</style>

      <aside className="pl-left">
        <div className="pl-logo">
          <div className="pl-logo-icon">↗</div>
          <strong>bringo</strong>
        </div>

        <h1>{t.title1}<br /><span>{t.title2}</span></h1>

        <details className="pl-form-section" open>
          <summary>{t.revenue}</summary>
          <div className="pl-pair">
            <SliderField label={t.regularMembers} value={a.regularMembers} min={0} max={150} onChange={(v) => update("regularMembers", v)} tooltip="Revenue = regular members × annual regular fee." />
            <AmountField label={t.regularAmount} amount={a.regularFee} period={a.regularFeePeriod} maxYear={300} onAmountChange={(v) => update("regularFee", v)} onPeriodChange={(p) => updatePeriod("regularFee", "regularFeePeriod", p)} tooltip="Annual value = amount × 12 if monthly is selected." t={t} />
          </div>
          <div className="pl-pair">
            <SliderField label={t.reducedMembers} value={a.reducedMembers} min={0} max={150} onChange={(v) => update("reducedMembers", v)} tooltip="Revenue = reduced members × annual reduced fee." />
            <AmountField label={t.reducedAmount} amount={a.reducedFee} period={a.reducedFeePeriod} maxYear={300} onAmountChange={(v) => update("reducedFee", v)} onPeriodChange={(p) => updatePeriod("reducedFee", "reducedFeePeriod", p)} tooltip="Annual value = amount × 12 if monthly is selected." t={t} />
          </div>
          <div className="pl-pair">
            <SliderField label={t.businessPartners} value={a.businessMembers} min={0} max={20} onChange={(v) => update("businessMembers", v)} tooltip="Business revenue = business partners × annual business fee." />
            <AmountField label={t.businessAmount} amount={a.businessFee} period={a.businessFeePeriod} maxYear={3000} stepYear={50} onAmountChange={(v) => update("businessFee", v)} onPeriodChange={(p) => updatePeriod("businessFee", "businessFeePeriod", p)} tooltip="Default: €120/year." t={t} />
          </div>
          <div className="pl-pair">
            <SliderField label={t.deliveriesPerMemberMonth} value={a.deliveriesPerMemberMonth} min={0} max={10} step={0.5} onChange={(v) => update("deliveriesPerMemberMonth", v)} tooltip="Deliveries/month = ((regular + reduced members) / 2) × this value." />
            <SliderField label={t.avgDeliveryFee} value={a.avgDeliveryFee} min={0} max={20} step={0.5} suffix="€" onChange={(v) => update("avgDeliveryFee", v)} tooltip="Average revenue per simple delivery." />
          </div>
          <DisplayField label={t.deliveriesMonth} value={`${r.deliveriesMonth}`} tooltip="Computed: ((regular + reduced members) / 2) × deliveries per member per month." />
          <div className="pl-pair">
            <SliderField label={t.errandTripsPerMemberMonth} value={a.errandTripsPerMemberMonth} min={0} max={10} step={0.5} onChange={(v) => update("errandTripsPerMemberMonth", v)} tooltip="Errand trips/month = ((regular + reduced members) / 2) × this value." />
            <SliderField label={t.avgErrandFee} value={a.avgErrandFee} min={0} max={60} step={1} suffix="€" onChange={(v) => update("avgErrandFee", v)} tooltip="Average revenue per errand trip." />
          </div>
          <DisplayField label={t.errandTripsMonth} value={`${r.errandTripsMonth}`} tooltip="Computed: ((regular + reduced members) / 2) × errand trips per member per month." />
          <label className="pl-check" data-tooltip={lang === "de" ? DSEE_TOOLTIP_DE : DSEE_TOOLTIP_EN}>
            <input type="checkbox" checked={a.dseeFundingEnabled} onChange={(e) => update("dseeFundingEnabled", e.target.checked)} />
            <span>{t.dseeFunding}</span>
          </label>
          {a.dseeFundingEnabled && (
            <SliderField label={t.dseeFundingAmount} value={a.dseeFundingAmount} min={500} max={1500} step={500} suffix="€/Jahr" onChange={(v) => update("dseeFundingAmount", v)} tooltip={lang === "de" ? DSEE_TOOLTIP_DE : DSEE_TOOLTIP_EN} />
          )}
        </details>

        <details className="pl-form-section" open>
          <summary>{t.laborDelivery}</summary>
          <div className="pl-control-grid">
            <PayModelSelect label={t.courierPay} value={a.courierPayModel} onChange={(v) => update("courierPayModel", v)} tooltip="Minimum wage: orders/year × minutes/trip ÷ 60 × €13.90 × 1.04. Allowance: couriers × €960/year." t={t} />
            <PayModelSelect label={t.managementPay} value={a.managementPayModel} onChange={(v) => update("managementPayModel", v)} tooltip="Minimum wage: management hours/month × 12 × €13.90 × management persons × 1.04. Allowance: management persons × €960/year." t={t} />
            <SliderField label={t.couriers} value={a.courierPersons} min={1} max={50} onChange={(v) => update("courierPersons", v)} tooltip="Number of active couriers. Also determines staff management demand." />
            <DisplayField label={t.management} value={`${r.managementPersons} ${t.persons}`} tooltip="Automatically calculated: 1 staff management person per 10 couriers." />
            <SliderField label={t.tripTime} value={a.tripMinutes} min={15} max={120} step={15} suffix={t.minutes} onChange={(v) => update("tripMinutes", v)} tooltip="Applies to deliveries and errand trips." />
            <SliderField label={t.pmHoursMonth} value={a.managementHoursMonth} min={0} max={40} step={0.5} suffix="h" onChange={(v) => update("managementHoursMonth", v)} tooltip="Only relevant if staff management is calculated with minimum wage." />
            <SliderField label={t.carShare} value={a.carSharePct} min={0} max={100} suffix="%" onChange={(v) => update("carSharePct", v)} tooltip="Car trips = total orders/year × car share." />
            <SliderField label={t.kmPerCarTrip} value={a.kmPerCarTrip} min={0} max={40} suffix="km" onChange={(v) => update("kmPerCarTrip", v)} tooltip="Car costs = car trips × km per car trip × €0.30/km." />
            <SliderField label={t.operationalLoss} value={a.operationalLossPct} min={0} max={10} step={0.5} suffix="%" onChange={(v) => update("operationalLossPct", v)} tooltip="Operational loss = (delivery revenue + errand revenue) × selected percentage." />
            <DisplayField label={t.carCosts} value="0,30 €/km" tooltip="Fixed value: €0.30/km." />
            <DisplayField label={t.paymentFee} value="1,4 %" tooltip="Fixed value: 1.4% of operating revenue." />
          </div>
          <label className="pl-check">
            <input type="checkbox" checked={a.fundingEnabled} onChange={(e) => update("fundingEnabled", e.target.checked)} />
            <span>{t.funding}</span>
          </label>
          {a.fundingEnabled && (
            <SliderField label={t.fundingRate} value={a.fundingPct} min={50} max={75} step={5} suffix="%" onChange={(v) => update("fundingPct", v)} tooltip="Funding = eligible costs × funding rate." />
          )}
        </details>

        <details className="pl-form-section" open>
          <summary>{t.equipmentOpex}</summary>
          <div className="pl-control-grid">
            <label className="pl-input" data-tooltip="Cargo bike costs: lease = monthly rate × 12; purchase = purchase price ÷ useful life.">
              <span>{t.cargoBikeModel}</span>
              <select value={a.cargoBikeMode} onChange={(e) => update("cargoBikeMode", e.target.value)}>
                <option value="lease">{t.lease}</option>
                <option value="buy">{t.buy}</option>
              </select>
            </label>
            {a.cargoBikeMode === "lease" ? (
              <SliderField label={t.cargoBikeLease} value={a.cargoBikeLeaseMonth} min={0} max={300} step={5} suffix="€/Monat" onChange={(v) => update("cargoBikeLeaseMonth", v)} tooltip="Cargo bike leasing per year = monthly lease × 12." />
            ) : (
              <SliderField label={t.cargoBikePurchase} value={a.cargoBikePurchase} min={0} max={8000} step={100} suffix="€" onChange={(v) => update("cargoBikePurchase", v)} tooltip="Annualized cargo bike costs = purchase price ÷ useful life." />
            )}
            <SliderField label={t.bikes} value={a.bikeCount} min={0} max={10} onChange={(v) => update("bikeCount", v)} tooltip="Number of regular bikes excluding the cargo bike." />
            <SliderField label={t.pricePerBike} value={a.bikePrice} min={0} max={1500} step={50} suffix="€" onChange={(v) => update("bikePrice", v)} tooltip="Annualized bike costs = number of bikes × price per bike ÷ useful life." />
            <SliderField label={t.usefulLife} value={a.usefulLifeYears} min={1} max={7} suffix={t.years} onChange={(v) => update("usefulLifeYears", v)} tooltip="Useful life for purchased bikes and cargo bike." />
            <DisplayField label={t.bikeEquipment} value={`${a.bikeEquipmentPerBikeYear} €/Rad/Jahr`} tooltip="Fixed value: €200/bike/year." />
            <DisplayField label={t.bikeMaintenance} value={`${a.bikeMaintenancePerBikeYear} €/Rad/Jahr`} tooltip="Fixed value: €100/bike/year." />
            <SliderField label={t.marketing} value={a.marketingYear} min={0} max={3000} step={50} suffix="€/Jahr" onChange={(v) => update("marketingYear", v)} tooltip="Annual marketing costs." />
            <SliderField label={t.hosting} value={a.hostingYear} min={0} max={1000} step={20} suffix="€/Jahr" onChange={(v) => update("hostingYear", v)} tooltip="Digital infrastructure costs." />
            <SliderField label={t.developerAccounts} value={a.developerAccountsYear} min={0} max={500} step={10} suffix="€/Jahr" onChange={(v) => update("developerAccountsYear", v)} tooltip="App and developer account costs." />
            <SliderField label={t.insurance} value={a.insuranceYear} min={0} max={2000} step={25} suffix="€/Jahr" onChange={(v) => update("insuranceYear", v)} tooltip="Annual insurance costs." />
            <SliderField label={t.basicAdmin} value={a.basicAdminYear} min={0} max={1000} step={25} suffix="€/Jahr" onChange={(v) => update("basicAdminYear", v)} tooltip="Basic admin, bank fees." />
            <SliderField label={t.accountingTax} value={a.accountingTaxYear} min={0} max={2500} step={50} suffix="€/Jahr" onChange={(v) => update("accountingTaxYear", v)} tooltip="Bookkeeping, tax, accounting software." />
            <SliderField label={t.legalCompliance} value={a.legalComplianceYear} min={0} max={2500} step={50} suffix="€/Jahr" onChange={(v) => update("legalComplianceYear", v)} tooltip="Legal review, privacy, GDPR." />
            <SliderField label={t.customerSupport} value={a.customerSupportYear} min={0} max={1500} step={25} suffix="€/Jahr" onChange={(v) => update("customerSupportYear", v)} tooltip="Phone line, customer communication." />
            <SliderField label={t.contingency} value={a.contingencyPct} min={0} max={30} step={5} suffix="%" onChange={(v) => update("contingencyPct", v)} tooltip="Contingency reserve = selected percentage × operating costs before funding." />
          </div>
        </details>

        <button className="pl-reset" onClick={() => setA(DEFAULTS)}>{t.reset}</button>
      </aside>

      <main className="pl-right">
        <div className="pl-topbar">
          <div className="pl-language">
            <button className={lang === "de" ? "active" : ""} onClick={() => setLang("de")}>🇩🇪 DE</button>
            <button className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>🇬🇧 EN</button>
          </div>
        </div>

        <section className="pl-overview-card">
          <table>
            <thead>
              <tr><th>{t.overview}</th><th>{t.amountEur}</th><th>{t.marginPct}</th></tr>
            </thead>
            <tbody>
              <tr>
                <td><OverviewLabel tooltip={overviewTooltips.revenue}>{t.revenueOverview}</OverviewLabel></td>
                <td className="pos">{eur(r.operatingRevenue)}</td>
                <td>100.0 %</td>
              </tr>
              <tr>
                <td><OverviewLabel tooltip={overviewTooltips.cogs}>{t.cogsOverview}</OverviewLabel></td>
                <td className="neg">{eur(r.cogs)}</td>
                <td>{pct(r.cogsMargin)}</td>
              </tr>
              <tr>
                <td><OverviewLabel tooltip={overviewTooltips.grossProfit}>{t.grossProfit}</OverviewLabel></td>
                <td className={r.grossProfit >= 0 ? "pos" : "neg"}>{eur(r.grossProfit)}</td>
                <td>{pct(r.grossMargin)}</td>
              </tr>
              <tr>
                <td><OverviewLabel tooltip={overviewTooltips.sga}>{t.sgaOverview}</OverviewLabel></td>
                <td className="neg">{eur(r.sga)}</td>
                <td>{pct(r.sgaMargin)}</td>
              </tr>
              {(a.fundingEnabled || a.dseeFundingEnabled) && (
                <tr>
                  <td><OverviewLabel tooltip={overviewTooltips.funding}>{t.totalFunding}</OverviewLabel></td>
                  <td className="pos">{eur(r.totalFunding)}</td>
                  <td>{pct(r.fundingMargin)}</td>
                </tr>
              )}
              <tr className="overview-net">
                <td><OverviewLabel tooltip={overviewTooltips.operatingProfit}>{t.operatingProfit}</OverviewLabel></td>
                <td className={r.operatingProfit >= 0 ? "pos" : "neg"}>
                  {r.operatingProfit >= 0 ? eur(r.operatingProfit) : `-${eur(Math.abs(r.operatingProfit))}`}
                </td>
                <td className={r.operatingProfit >= 0 ? "pos" : "neg"}>{pct(r.operatingMargin)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <div className="pl-kpis">
          <div><span>{t.netResult}</span><strong className={r.netResult >= 0 ? "pos" : "neg"}>{signed(r.netResult)}</strong></div>
          <div><span>{t.costPerOrder}</span><strong>{eur(r.cogsPerTrip)}</strong></div>
          <div><span>{t.grossMargin}</span><strong>{pct(r.grossMargin)}</strong></div>
        </div>

        <section className="pl-table-card">
          <table>
            <thead><tr><th>{t.position}</th><th>{t.yearOneAmount}</th></tr></thead>
            <tbody>
              <tr><td>{t.regularRevenue}</td><td className="pos">{signed(r.regularRevenue)}</td></tr>
              <tr><td>{t.reducedRevenue}</td><td className="pos">{signed(r.reducedRevenue)}</td></tr>
              <tr><td>{t.businessRevenue}</td><td className="pos">{signed(r.businessRevenue)}</td></tr>
              <tr><td>{t.deliveryRevenue}</td><td className="pos">{signed(r.deliveryRevenue)}</td></tr>
              <tr><td>{t.errandRevenue}</td><td className="pos">{signed(r.errandRevenue)}</td></tr>
              <tr className="sum"><td>{t.operatingRevenue}</td><td className="pos">{signed(r.operatingRevenue)}</td></tr>
              <tr><td><OverviewLabel tooltip={overviewTooltips.courierLabor}>{t.courierLabor}</OverviewLabel></td><td className="neg">{signed(-r.courierLabor)}</td></tr>
              <tr><td>{t.carTrips}</td><td className="neg">{signed(-r.carCosts)}</td></tr>
              <tr><td>{t.paymentFees}</td><td className="neg">{signed(-r.paymentFees)}</td></tr>
              <tr><td>{t.operationalLossOutput}</td><td className="neg">{signed(-r.operationalLoss)}</td></tr>
              <tr><td>{t.annualizedBikes}</td><td className="neg">{signed(-r.bikePurchaseAnnualized)}</td></tr>
              <tr><td>{t.cargoBike}</td><td className="neg">{signed(-(r.cargoBikeAnnualized + r.cargoBikeLease))}</td></tr>
              <tr><td>{t.bikeEquipment}</td><td className="neg">{signed(-r.bikeEquipment)}</td></tr>
              <tr><td>{t.bikeMaintenance}</td><td className="neg">{signed(-r.bikeMaintenance)}</td></tr>
              <tr className="sum"><td>{t.cogsOverview}</td><td className="neg">{signed(-r.cogs)}</td></tr>
              <tr><td><OverviewLabel tooltip={overviewTooltips.managementLabor}>{t.managementLabor}</OverviewLabel></td><td className="neg">{signed(-r.managementLabor)}</td></tr>
              <tr><td>{t.digitalCosts}</td><td className="neg">{signed(-r.digitalCosts)}</td></tr>
              <tr><td>{t.insurance}</td><td className="neg">{signed(-a.insuranceYear)}</td></tr>
              <tr><td>{t.marketing}</td><td className="neg">{signed(-a.marketingYear)}</td></tr>
              <tr><td>{t.basicAdmin}</td><td className="neg">{signed(-a.basicAdminYear)}</td></tr>
              <tr><td>{t.accountingTax}</td><td className="neg">{signed(-a.accountingTaxYear)}</td></tr>
              <tr><td>{t.legalCompliance}</td><td className="neg">{signed(-a.legalComplianceYear)}</td></tr>
              <tr><td>{t.customerSupport}</td><td className="neg">{signed(-a.customerSupportYear)}</td></tr>
              <tr><td>{t.contingency}</td><td className="neg">{signed(-r.contingency)}</td></tr>
              <tr className="sum"><td>{t.sgaOverview}</td><td className="neg">{signed(-r.sga)}</td></tr>
              {(a.fundingEnabled || a.dseeFundingEnabled) && (
                <>
                  {a.fundingEnabled && (
                    <>
                      <tr className="sum"><td>{t.eligibleCosts}</td><td>{eur(r.eligibleCosts)}</td></tr>
                      <tr><td>{t.regionalFundingOutput} ({a.fundingPct} %)</td><td className="pos">{signed(r.regionalFundingAmount)}</td></tr>
                    </>
                  )}
                  {a.dseeFundingEnabled && (
                    <tr><td>{t.dseeFundingRevenue}</td><td className="pos">{signed(r.dseeFundingAmount)}</td></tr>
                  )}
                  <tr className="sum"><td>{t.totalFunding}</td><td className="pos">{signed(r.totalFunding)}</td></tr>
                </>
              )}
              <tr className="net">
                <td>{t.netYearOne}</td>
                <td className={r.netResult >= 0 ? "pos" : "neg"}>{signed(r.netResult)}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="pl-breakdown">
          <div><span>{t.ordersYear}</span><strong>{r.totalTripsYear}</strong></div>
          <div><span>{t.costsBeforeFunding}</span><strong>{eur(r.totalCostsBeforeFunding)}</strong></div>
          <div><span>{t.totalFunding}</span><strong>{eur(r.totalFunding)}</strong></div>
          <div><span>{t.grossProfit}</span><strong>{eur(r.grossProfit)}</strong></div>
        </section>
      </main>
    </section>
  );
}

const styles = `
.bringo-pl {
  display: grid;
  grid-template-columns: 0.95fr 1.05fr;
  min-height: 100vh;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #ffffff;
  color: #071225;
}
.pl-left {
  background: radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(145deg, #0c4425 0%, #135f34 100%);
  background-size: 32px 32px, auto;
  color: white;
  padding: 30px 36px;
  overflow-y: auto;
}
.pl-logo { display: flex; align-items: center; gap: 14px; font-size: 24px; margin-bottom: 34px; }
.pl-logo-icon { width: 42px; height: 42px; border-radius: 14px; background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.22); display: grid; place-items: center; }
.pl-left h1 { font-size: clamp(34px, 3.5vw, 52px); line-height: 0.98; margin: 0 0 26px; letter-spacing: -0.05em; }
.pl-left h1 span { color: #86efac; }
.pl-form-section { margin-bottom: 14px; border-radius: 16px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); padding: 12px; }
.pl-form-section summary { cursor: pointer; color: #d8fbe5; font-size: 17px; font-weight: 900; list-style: none; }
.pl-form-section summary::-webkit-details-marker { display: none; }
.pl-form-section summary::after { content: "⌄"; float: right; transition: transform 0.2s ease; }
.pl-form-section[open] summary::after { transform: rotate(180deg); }
.pl-form-section[open] summary { margin-bottom: 12px; }
.pl-pair, .pl-control-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
.pl-pair { margin-bottom: 10px; }
.pl-input, .pl-check, .pl-row-tooltip { position: relative; }
.pl-input[data-tooltip]:hover::after, .pl-check[data-tooltip]:hover::after, .pl-row-tooltip[data-tooltip]:hover::after { content: attr(data-tooltip); position: absolute; left: 0; bottom: calc(100% + 8px); z-index: 50; width: min(420px, 90vw); background: #071225; color: white; border: 1px solid rgba(255,255,255,0.18); border-radius: 12px; padding: 10px 12px; font-size: 12px; font-weight: 700; line-height: 1.35; box-shadow: 0 18px 40px rgba(0,0,0,0.25); white-space: normal; }
.pl-input span { display: block; font-size: 12px; font-weight: 800; color: rgba(255,255,255,0.78); margin-bottom: 5px; }
.pl-slider-box, .pl-input select, .pl-display-box { background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); border-radius: 13px; padding: 8px 10px; min-height: 56px; }
.pl-input select { width: 100%; height: 40px; color: white; font-weight: 900; font-size: 14px; outline: 0; }
.pl-input select option { color: #071225; }
.pl-display-box { display: flex; align-items: center; color: white; font-weight: 900; font-size: 15px; }
.pl-range { width: 100%; accent-color: #86efac; }
.pl-number-row { display: flex; align-items: center; gap: 6px; margin-top: 5px; }
.pl-number { width: 100%; border: 0; outline: 0; background: rgba(255,255,255,0.16); color: white; font-weight: 900; font-size: 15px; border-radius: 9px; padding: 6px 8px; }
.pl-number-row small { color: rgba(255,255,255,0.72); font-weight: 800; white-space: nowrap; }
.pl-number-row select { width: auto; height: 32px; min-height: 32px; padding: 0 8px; }
.pl-check { display: flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.18); border-radius: 13px; padding: 12px 14px; margin: 14px 0 10px; font-weight: 900; color: #d8fbe5; }
.pl-check input { width: 18px; height: 18px; accent-color: #86efac; }
.pl-reset { width: 100%; border: 0; border-radius: 14px; background: #ffffff; color: #15803d; font-weight: 900; padding: 13px 16px; cursor: pointer; margin-top: 4px; }
.pl-right { padding: 14px 22px 22px; overflow-x: hidden; }
.pl-topbar { display: flex; justify-content: flex-end; align-items: center; margin-bottom: 12px; }
.pl-language { background: #f0f2f5; border-radius: 999px; padding: 4px; display: flex; box-shadow: 0 6px 16px rgba(10,20,40,0.08); }
.pl-language button { border: 0; background: transparent; font-weight: 900; font-size: 14px; padding: 7px 12px; border-radius: 999px; cursor: pointer; }
.pl-language .active { background: white; box-shadow: 0 3px 10px rgba(10,20,40,0.1); }
.pl-overview-card { background: #ffffff; border: 1px solid #e5eaf0; border-radius: 16px; padding: 10px; box-shadow: 0 8px 22px rgba(15,23,42,0.06); margin-bottom: 10px; overflow-x: auto; }
.pl-overview-card table { width: 100%; border-collapse: collapse; min-width: 520px; }
.pl-overview-card th, .pl-overview-card td { padding: 7px 8px; border-bottom: 1px solid #e9edf2; text-align: right; vertical-align: middle; }
.pl-overview-card th:first-child, .pl-overview-card td:first-child { text-align: left; }
.pl-overview-card th { color: #697386; font-size: 12px; font-weight: 900; }
.pl-overview-card td { font-size: 14px; font-weight: 850; color: #1f2937; }
.pl-overview-card tr:last-child td { border-bottom: 0; }
.pl-row-tooltip { display: inline-block; cursor: help; border-bottom: 1px dotted #9ca3af; }
.overview-net td { background: #effcf3; font-size: 15px; font-weight: 950; }
.overview-net td:first-child { border-radius: 12px 0 0 12px; }
.overview-net td:last-child { border-radius: 0 12px 12px 0; }
.pl-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 10px; }
.pl-kpis div, .pl-breakdown div { background: #effcf3; border: 1px solid #d6f7df; border-radius: 13px; padding: 10px; }
.pl-kpis span, .pl-breakdown span { display: block; color: #087b38; font-weight: 800; font-size: 12px; margin-bottom: 5px; }
.pl-kpis strong, .pl-breakdown strong { font-size: 18px; }
.pl-table-card { background: #ffffff; border: 1px solid #e5eaf0; border-radius: 16px; padding: 10px; box-shadow: 0 8px 22px rgba(15,23,42,0.06); overflow-x: auto; }
.pl-table-card table { width: 100%; border-collapse: collapse; min-width: 580px; }
.pl-table-card th, .pl-table-card td { padding: 5px 7px; border-bottom: 1px solid #e9edf2; text-align: left; vertical-align: top; }
.pl-table-card th { color: #697386; font-size: 11px; }
.pl-table-card td:first-child { font-weight: 900; color: #1f2937; }
.pl-table-card td { font-weight: 800; font-size: 12px; }
.sum td { background: #f8fafc; }
.pos { color: #15803d !important; }
.neg { color: #dc2626 !important; }
.net td { border-bottom: 0; font-size: 14px; background: #effcf3; }
.net td:first-child { border-radius: 12px 0 0 12px; }
.net td:last-child { border-radius: 0 12px 12px 0; }
.pl-breakdown { margin-top: 10px; display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
@media (max-width: 1100px) {
  .bringo-pl { grid-template-columns: 1fr; }
  .pl-kpis, .pl-breakdown { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 700px) {
  .pl-left, .pl-right { padding: 22px; }
  .pl-pair, .pl-control-grid, .pl-kpis, .pl-breakdown { grid-template-columns: 1fr; }
  .pl-topbar { margin-bottom: 18px; }
  .pl-left h1 { font-size: 42px; }
}
`;
