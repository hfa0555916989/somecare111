import { listDocs, totals } from "./docs";
import { listEntries, getSettings } from "./accounting";
import {
  KINDS, CATS, INCOME_CATS, EXPENSE_CATS, FUNDING_SOURCES, CHANNELS, AD_CHANNELS,
  summarize, periodRange, receivables, riyadhToday,
} from "./finance";

// ملخص المحاسبة الذي يقرأه الذكاء الاصطناعي (أرقام مجمّعة + آخر العمليات، بدون بيانات العملاء الشخصية)
export async function financeContext({ recent = 40 } = {}) {
  const [entries, settings, docs] = await Promise.all([listEntries(), getSettings(), listDocs()]);
  const today = riyadhToday();
  const pick = (s) => ({
    income: s.income, expenses: s.expense, adSpend: s.ads, netProfit: s.net, margin: s.margin,
    adIncome: s.adIncome, roas: s.roas,
    expenseByItem: s.expenseByCat.map(([k, v]) => ({ item: EXPENSE_CATS[k] || k, amount: v })),
    incomeByType: s.incomeByCat.map(([k, v]) => ({ type: INCOME_CATS[k] || k, amount: v })),
    incomeBySource: s.incomeByChannel.map(([k, v]) => ({ source: CHANNELS[k] || k, amount: v })),
    adPlatforms: s.platforms.map((p) => ({ platform: AD_CHANNELS[p.key] || "غير محدد", spend: p.spend, clientIncome: p.revenue, roas: p.roas })),
  });
  const all = summarize(entries, [null, null], settings, today);
  const accepted = receivables(
    docs.filter((d) => d.status === "accepted").map((d) => ({ number: d.number, title: d.title, total: totals(d).total })),
    entries
  ).filter((d) => d.due > 0);
  return {
    today,
    settings: { reinvestPct: settings.reinvestPct, monthlyBudgetTarget: settings.monthlyBudget || null, monthlyAdsBudget: settings.adsBudget || null },
    balances: {
      budgetBalance: all.budget, availableProfits: all.profits, totalCash: all.cash,
      totalFunding: all.fundingTotal, externalFunding: all.external, reinvestedFromProfits: all.reinvested, withdrawn: all.withdrawn,
      fundingBySource: all.fundingBySource.map(([k, v]) => ({ source: FUNDING_SOURCES[k] || k, amount: v })),
      suggestedReinvestByFormula: all.suggestReinvest,
    },
    thisMonth: pick(summarize(entries, periodRange("month", today), settings, today)),
    lastMonth: pick(summarize(entries, periodRange("last", today), settings, today)),
    last3Months: pick(summarize(entries, periodRange("quarter", today), settings, today)),
    thisYear: pick(summarize(entries, periodRange("year", today), settings, today)),
    allTime: pick(all),
    monthly: all.months,
    receivables: accepted.map((d) => ({ doc: d.number, title: d.title, total: d.total, paid: d.paid, due: d.due })),
    recentEntries: entries.slice(0, recent).map((e) => ({
      id: e.id, date: e.date, kind: KINDS[e.kind], item: CATS[e.kind]?.[e.cat] || e.cat,
      amount: e.amount, note: e.note, client: e.client || "", channel: CHANNELS[e.channel] || "", docRef: e.docRef || "",
    })),
  };
}
