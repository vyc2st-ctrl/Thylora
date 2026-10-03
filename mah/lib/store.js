// MAH' · Store throughput and gap math (WR-MAH-001)
// Every formula carries the question it asks (rule I1).

/** G = E_required − E_present. Question: what is still missing before this can be called done? */
export function gap(required, present) {
  const missing = required.filter(r => !present.includes(r));
  return { G: missing.length, missing, question: 'What is still missing before this can be called done?' };
}

// Release pipeline for ONE digital product, in minutes of focused human work.
// MODELLED planning numbers, not measured. Overwrite with real timings once witnessed.
export const STAGES = Object.freeze([
  { stage: 'RIGHTS_CLEAR', dept: 'Rights & Clearance', minutes: 20 },
  { stage: 'FILE_FINAL', dept: 'Studio / Production', minutes: 45 },
  { stage: 'COVER_IMAGE', dept: 'Studio / Production', minutes: 30 },
  { stage: 'COPY_AND_PRICE', dept: 'Merchandising', minutes: 20 },
  { stage: 'SERIAL_PASSPORT', dept: 'Passports & Serials', minutes: 10 },
  { stage: 'QA_PRECHECK', dept: 'QA / Release', minutes: 15 },
  { stage: 'CHECKOUT_WITNESS', dept: 'QA / Release', minutes: 10 },
  { stage: 'PUBLISH_AND_POST', dept: 'Marketing / Social', minutes: 15 }
]);

/**
 * People needed. Question: how many hands does it take to release N products a week
 * without anyone rushing past a gate?
 * N = products/week, H = productive hours per person per week (default 25 of 40).
 */
export function staffing(productsPerWeek, productiveHoursPerPerson = 25, stages = STAGES) {
  const byDept = {};
  for (const s of stages) byDept[s.dept] = (byDept[s.dept] || 0) + s.minutes * productsPerWeek / 60;
  const depts = Object.entries(byDept).map(([dept, hours]) => ({
    dept, hours: Math.round(hours * 10) / 10, people: Math.max(1, Math.ceil(hours / productiveHoursPerPerson))
  }));
  const minutesPerProduct = stages.reduce((a, s) => a + s.minutes, 0);
  return {
    products_per_week: productsPerWeek,
    minutes_per_product: minutesPerProduct,
    total_people: depts.reduce((a, d) => a + d.people, 0),
    departments: depts,
    question: 'How many hands does it take to release this many products a week without anyone rushing past a gate?'
  };
}

/** Weeks to clear a draft backlog. Question: at this pace, when is the shelf full? */
export function weeksToClear(drafts, productsPerWeek) {
  if (productsPerWeek <= 0) return { weeks: Infinity, question: 'At this pace, when is the shelf full?' };
  return { weeks: Math.ceil(drafts / productsPerWeek), question: 'At this pace, when is the shelf full?' };
}

/** Net to us per sale, N = P − F − T − D (matches THY-MONEY-PATH-CARD-001). */
export function netPerSale(price, feeRate = 0.029, feeFixed = 0.30, tax = 0, delivery = 0) {
  const N = Math.round((price - (price * feeRate + feeFixed) - tax - delivery) * 100) / 100;
  return { N, question: 'Of every dollar a customer pays, how much actually reaches us?' };
}
