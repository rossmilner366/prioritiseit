const RICE_GUIDE = [
  {
    key: 'reach', label: 'Reach',
    question: 'How many users or sessions will this affect per quarter?',
    scale: '0–100',
    levels: [
      { range: '80–100', label: 'Very high', desc: 'Affects most of your user base', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '50–79', label: 'High', desc: 'Significant portion of users', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '20–49', label: 'Medium', desc: 'A moderate user segment', color: 'text-amber-600 dark:text-amber-400' },
      { range: '1–19', label: 'Low', desc: 'Niche feature, small group', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Use real data — GA sessions, active users, support tickets. Estimate when you must, but lower your confidence score accordingly.',
  },
  {
    key: 'impact', label: 'Impact',
    question: 'How much will this move the needle for users who encounter it?',
    scale: '1–3',
    levels: [
      { range: '3', label: 'High', desc: 'Transforms the experience or directly drives a key metric', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '2', label: 'Medium', desc: 'Noticeable improvement, solves a real but non-critical problem', color: 'text-amber-600 dark:text-amber-400' },
      { range: '1', label: 'Low', desc: 'Nice to have, incremental polish', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Score the outcome, not the feature. "Add filters" is low; "Help users find products 3× faster" is high.',
  },
  {
    key: 'confidence', label: 'Confidence',
    question: 'How confident are you in your Reach and Impact estimates?',
    scale: '1–3',
    levels: [
      { range: '3', label: 'High', desc: 'Backed by analytics, research, or A/B test results', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '2', label: 'Medium', desc: 'Informed opinion with some supporting data', color: 'text-amber-600 dark:text-amber-400' },
      { range: '1', label: 'Low', desc: 'Gut feel, novel territory, no evidence', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Be honest. Low confidence isn\'t bad — it means validate first. The formula naturally deprioritises speculation.',
  },
  {
    key: 'effort', label: 'Effort',
    question: 'How many person-weeks to ship this?',
    scale: '1–5',
    levels: [
      { range: '1', label: 'Tiny', desc: 'Hours to a day — config change, copy tweak', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '2', label: 'Small', desc: '1–2 weeks, single dev, clear scope', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '3', label: 'Medium', desc: '3–4 weeks, needs design + dev', color: 'text-amber-600 dark:text-amber-400' },
      { range: '4', label: 'Large', desc: '5–8 weeks, multiple contributors', color: 'text-red-600 dark:text-red-400' },
      { range: '5', label: 'XL', desc: '8+ weeks, cross-team coordination', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Include design, dev, QA, and rollout. If it needs legal review or partner coordination, factor that in too.',
  },
]

const ICE_GUIDE = [
  {
    key: 'impact', label: 'Impact',
    question: 'If this works, how much will it move the needle?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Transformative', desc: 'Game-changing for users or business', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '5–7', label: 'Significant', desc: 'Clear, measurable improvement', color: 'text-amber-600 dark:text-amber-400' },
      { range: '2–4', label: 'Moderate', desc: 'Helpful but not major', color: 'text-amber-600 dark:text-amber-400' },
      { range: '1', label: 'Minimal', desc: 'Barely noticeable', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Score relative to current goals. High for acquisition might be low if your focus is retention.',
  },
  {
    key: 'confidence', label: 'Confidence',
    question: 'How sure are you this will work?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Proven', desc: 'Strong data, validated by research or tests', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '5–7', label: 'Likely', desc: 'Good evidence, customer feedback supports it', color: 'text-amber-600 dark:text-amber-400' },
      { range: '2–4', label: 'Uncertain', desc: 'Hypothesis, limited data', color: 'text-amber-600 dark:text-amber-400' },
      { range: '1', label: 'Speculative', desc: 'Pure bet, no evidence', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'If you\'d want to run an experiment before committing, your confidence is probably 5 or below.',
  },
  {
    key: 'effort', label: 'Ease',
    question: 'How easy is this to implement?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Trivial', desc: 'Quick config, simple, no dependencies', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '5–7', label: 'Manageable', desc: 'Standard project, known territory', color: 'text-amber-600 dark:text-amber-400' },
      { range: '2–4', label: 'Hard', desc: 'Complex, cross-team, uncertain scope', color: 'text-red-600 dark:text-red-400' },
      { range: '1', label: 'Extremely hard', desc: 'Major initiative, many unknowns', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'ICE inverts effort — higher is easier. Easy wins naturally score higher.',
  },
]

const WSJF_GUIDE = [
  {
    key: 'reach', label: 'User/Business Value',
    question: 'How much value does this deliver to users or the business?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Critical', desc: 'Core to user journey or revenue; major pain if absent', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '5–7', label: 'High', desc: 'Clear improvement to outcomes users care about', color: 'text-amber-600 dark:text-amber-400' },
      { range: '2–4', label: 'Moderate', desc: 'Helpful but not central to the core experience', color: 'text-amber-600 dark:text-amber-400' },
      { range: '1', label: 'Low', desc: 'Nice to have; minimal user or business impact', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Think about revenue impact, retention, NPS, and support volume reduction. Compare relative to other items on the board.',
  },
  {
    key: 'impact', label: 'Time Criticality',
    question: 'How urgent is this — does value decay if we delay?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Now or never', desc: 'Regulatory deadline, competitor launch, or expiring opportunity', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '5–7', label: 'Soon', desc: 'Grows more costly or less effective with delay', color: 'text-amber-600 dark:text-amber-400' },
      { range: '2–4', label: 'Flexible', desc: 'Can wait a quarter without meaningful cost', color: 'text-amber-600 dark:text-amber-400' },
      { range: '1', label: 'Evergreen', desc: 'No time sensitivity — equally valuable later', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Ask: what happens if we ship this 3 months later? If the answer is "nothing", time criticality is low.',
  },
  {
    key: 'confidence', label: 'Risk Reduction / OE',
    question: 'Does this reduce risk or unlock future opportunities?',
    scale: '1–10',
    levels: [
      { range: '8–10', label: 'Unblocks critical work', desc: 'Removes a blocker or de-risks a major dependency', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '5–7', label: 'Enables options', desc: 'Opens up future features or reduces architectural risk', color: 'text-amber-600 dark:text-amber-400' },
      { range: '2–4', label: 'Marginal', desc: 'Small risk reduction or optional enablement', color: 'text-amber-600 dark:text-amber-400' },
      { range: '1', label: 'None', desc: 'Standalone item with no knock-on effects', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Foundation work, API contracts, and security patches often score high here even when business value alone looks low.',
  },
  {
    key: 'effort', label: 'Job Size',
    question: 'How big is the job — relative effort to deliver?',
    scale: '1–10',
    levels: [
      { range: '1–2', label: 'Tiny', desc: 'Hours to a few days', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '3–4', label: 'Small', desc: '1–2 weeks of work', color: 'text-emerald-600 dark:text-emerald-400' },
      { range: '5–6', label: 'Medium', desc: '3–5 weeks, needs cross-functional effort', color: 'text-amber-600 dark:text-amber-400' },
      { range: '7–8', label: 'Large', desc: '6–10 weeks, multiple teams', color: 'text-red-600 dark:text-red-400' },
      { range: '9–10', label: 'Epic', desc: 'Quarter-scale initiative', color: 'text-red-600 dark:text-red-400' },
    ],
    tip: 'Unlike ICE Ease, larger job size lowers the WSJF score. Smaller, focused work that delivers similar value ranks higher.',
  },
]

export default function ScoringGuidePanel({ scoringModel, onClose }) {
  const factors = scoringModel === 'rice' ? RICE_GUIDE : scoringModel === 'wsjf' ? WSJF_GUIDE : ICE_GUIDE
  const formula = scoringModel === 'rice' ? '(R × I × C) ÷ E' : scoringModel === 'wsjf' ? '(Value + Urgency + Risk) ÷ Job Size' : 'I × C × E'

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
        <div>
          <h3 className="text-slate-900 dark:text-white text-sm font-semibold">{scoringModel.toUpperCase()} scoring guide</h3>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">Reference while you score</p>
        </div>
        <button onClick={onClose} className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="px-5 py-3 bg-brand-50 dark:bg-brand-400/5 border-b border-slate-100 dark:border-white/[0.04]">
        <p className="text-sm">
          <span className="text-slate-500 dark:text-slate-400">Score = </span>
          <span className="font-mono text-brand-600 dark:text-brand-400 font-medium">{formula}</span>
        </p>
      </div>

      <div className="divide-y divide-slate-100 dark:divide-white/[0.04]">
        {factors.map(factor => (
          <div key={factor.key} className="px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-900 dark:text-white text-sm font-medium">{factor.label}</span>
              <span className="text-slate-400 dark:text-slate-600 text-xs font-mono">{factor.scale}</span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-3">{factor.question}</p>
            <div className="space-y-2">
              {factor.levels.map(level => (
                <div key={level.range} className="flex items-start gap-2.5">
                  <span className={`text-sm font-mono font-medium w-12 shrink-0 ${level.color}`}>{level.range}</span>
                  <div>
                    <span className="text-slate-800 dark:text-white text-sm">{level.label}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm"> — {level.desc}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 pl-3 border-l-2 border-brand-200 dark:border-brand-400/20">
              <p className="text-slate-400 dark:text-slate-500 text-xs leading-relaxed">{factor.tip}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="px-5 py-4 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-200 dark:border-white/[0.06]">
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          {scoringModel === 'rice'
            ? 'Higher scores = higher priority. High reach and impact with low effort rise to the top. Low confidence penalises speculation — validate first.'
            : scoringModel === 'wsjf'
              ? 'Higher scores = higher priority. WSJF surfaces work with high cost of delay relative to its size — commonly used in SAFe and agile-at-scale programmes.'
              : 'Higher scores = higher priority. ICE is faster than RICE — ideal for rapid triage when you don\'t have detailed reach data.'
          }
        </p>
      </div>
    </div>
  )
}
