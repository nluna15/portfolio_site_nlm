export type ProjectKind = 'ai' | 'corporate' | 'writing';

export type TagTone = 'navy' | 'rust' | 'moss' | 'gold' | 'plum' | 'teal';

export interface Tag {
  label: string;
  tone: TagTone;
}

const TONE_CYCLE: TagTone[] = ['navy', 'rust', 'moss', 'gold', 'plum', 'teal'];

/** Stable tone for feed-derived tags — the same label always gets the same color. */
export function toneForLabel(label: string): TagTone {
  let hash = 0;
  for (let i = 0; i < label.length; i += 1) {
    hash = (hash * 31 + label.charCodeAt(i)) | 0;
  }
  return TONE_CYCLE[Math.abs(hash) % TONE_CYCLE.length];
}

export interface ProjectItem {
  /** Stable slug — used as React key and modal identity. */
  id: string;
  kind: ProjectKind;
  title: string;
  /** Short description shown on cards / rows. */
  blurb: string;
  image: string;
  imageAlt: string;
  caption?: string;
  tags?: Tag[];
  /** Period ("2025 — NOW") for work, or date ("MAR 2026") for writing. */
  meta: string;
  /** Writing venue, e.g. "The Sporting Ledger ↗". */
  venue?: string;
  /** Roman numeral shown on corporate rows. */
  numeral?: string;
  featured?: boolean;
  /** Detail fields — surfaced in the pop-up. */
  role?: string;
  summary: string[];
  highlights?: string[];
  link?: { label: string; href: string };
  /** Optional lead sentence shown above the link button(s). */
  linksLead?: string;
  /** Optional second link button, rendered after `link`. */
  secondaryLink?: { label: string; href: string };
}

export const AI_PROJECTS: ProjectItem[] = [
  {
    id: 'footy-eleven',
    kind: 'ai',
    title: 'Pick Your Footy Eleven',
    blurb:
      'A crowdsourced lineup builder for the 2026 World Cup — fans pick a formation and starting XI from real player data, and the site tallies the crowd\'s choices by country. Idea to public launch in five days.',
    image: '/footy-eleven.webp',
    imageAlt: 'Aerial view of soccer players on a green pitch',
    caption: 'Pick Your Footy Eleven — lineup builder',
    tags: [
      { label: 'SubAgents', tone: 'navy' },
      { label: 'Database Design', tone: 'teal' },
      { label: 'Cursor', tone: 'rust' },
      { label: 'Claude Code', tone: 'rust' },
    ],
    meta: '2026',
    featured: true,
    summary: [
      'Pick Your Footy Eleven is a crowdsourced lineup builder for the 2026 World Cup — the tournament\'s first return to the United States in my lifetime. Fans choose a formation, fill in a starting eleven from real player data, and the site synthesizes everyone\'s submissions into a picture of what the crowd would actually pick for each nation.',
      'I took it from idea to public launch in five days, leaning on multiple AI agents and custom sub-agents. When no existing soccer-pitch component fit my needs, I spun off a dedicated project to build one — a React/Tailwind pitch with 12 formations and configurable color schemes — and published it as a reusable npm package.',
    ],
    highlights: [
      'Idea to public launch in five days using multiple AI agents',
      'Built and published a reusable soccer-pitch React component (npm install soccer-pitch)',
      'Real player data + Neon DB power live, per-country crowd tallies',
    ],
    link: { label: 'Visit startingxi2026.app ↗', href: 'https://startingxi2026.app/' },
  },
  {
    id: 'world-cup-player-picker',
    kind: 'ai',
    title: 'World Cup Player Picker',
    blurb:
      'A daily guessing game built on the cleaned player data from Pick Your Footy Eleven — one puzzle a day to test how well fans really know the tournament\'s squads. Idea to live in about three hours.',
    image: '/world-cup-player-picker.webp',
    imageAlt: 'Panoramic view of a packed World Cup stadium draped in national flags',
    caption: 'World Cup Player Picker — daily puzzle',
    tags: [
      { label: 'Analytics', tone: 'plum' },
      { label: 'Game', tone: 'teal' },
      { label: 'Sports', tone: 'moss' },
    ],
    meta: '2026',
    summary: [
      'World Cup Player Picker is a daily game that reuses the cleaned, structured player data I assembled for Pick Your Footy Eleven — turning a dataset I already trusted into a second product. Each day serves one fresh puzzle that challenges fans to prove their player knowledge, with a deliberately tiny surface area: show up, take your guess, come back tomorrow.',
      'I built it in about three hours by running multiple Claude agents in parallel — one iterating toward a radically simplified design, others wiring up the game mechanics and persisting each game\'s outcome. It was also my first time standing up an analytics dashboard with AI agents, so I could see exactly where players dropped off in the funnel and tighten the loop from there.',
    ],
    highlights: [
      'Idea to live in ~3 hours by running Claude agents in parallel',
      'Reused Pick Your Footy Eleven\'s cleaned player data — one dataset, a second product',
      'First AI-agent-built analytics dashboard, used to find and fix funnel drop-off points',
    ],
    link: { label: 'Play player-quiz.vercel.app ↗', href: 'https://player-quiz.vercel.app/' },
  },
  {
    id: 'safepaws',
    kind: 'ai',
    title: 'SafePaws',
    blurb:
      'A native iOS app that turns live weather and air-quality data into safe dog-walking windows — tailored by breed, age, weight, and health conditions.',
    image: '/safepaws.webp',
    imageAlt: 'Beagle on a leash during a sunny walk',
    caption: 'SafePaws — walk recommendations',
    tags: [
      { label: 'MCP', tone: 'navy' },
      { label: 'iOS', tone: 'teal' },
      { label: 'Cursor', tone: 'rust' },
      { label: 'Claude Code', tone: 'rust' },
    ],
    meta: '2026 — NOW',
    role: 'Solo build · iOS',
    summary: [
      'SafePaws is a native iOS app I\'m building to solve a problem I hit after moving from mild Seattle to volatile Philadelphia: knowing when it\'s actually safe and pleasant to walk my dog, Steele. It combines live weather and air-quality data with a dog\'s breed, age, weight, and medical conditions to recommend the best walking windows.',
      'I\'m treating the build like an agile sprint — Linear\'s MCP server automates ticket creation and prioritization, and custom "Engineering Lead" and "Principal UX Designer" sub-agents in Cursor pressure-test my tradeoffs. The recommendation engine came out of running competing models against each other until they converged on shared weather-triage logic.',
    ],
    highlights: [
      'Weather-triage logic flags severe conditions across global locations',
      'Breed-, age-, and condition-aware walk recommendations',
      'Ran an agile, Linear-MCP-driven workflow with custom AI sub-agents',
    ],
  },
  {
    id: 'interview-xp',
    kind: 'ai',
    title: 'PM Interview Simulator',
    blurb:
      'A voice-enabled PM interview simulator dressed as Windows XP — practice out loud, get each answer scored 0–100, and track your progress.',
    image: '/interview-xp.webp',
    imageAlt: 'Close-up of a resume with glasses and a pen resting on it',
    caption: 'Interview Simulator — XP desktop',
    tags: [
      { label: 'LLM Scoring', tone: 'navy' },
      { label: 'Lovable', tone: 'rust' },
      { label: 'Claude Code', tone: 'rust' },
    ],
    meta: '2026',
    summary: [
      'Interview Simulator is a PM interview-prep tool wrapped in the Windows XP interface of my first laptop — a deliberate bit of nostalgia to make practice feel engaging instead of like flipping through a question bank. You can change the wallpaper and drag windows around while you work.',
      'It was a "Priority 0" that users could answer out loud: responses are transcribed and saved so you can review your own language, and an LLM scores each answer 0–100 on clarity, approach, and depth. I built it with Lovable and Claude using a planning-first workflow to keep scope tight.',
    ],
    highlights: [
      'Voice-first practice with saved transcripts for self-review',
      'LLM-scored answers (0–100) on clarity, approach, and depth',
      'Nostalgic Windows XP UX built to stand out from generic prep tools',
    ],
    link: { label: 'Try pm-interview-xp.lovable.app ↗', href: 'https://pm-interview-xp.lovable.app' },
  },
  {
    id: 'hollywood-agent',
    kind: 'ai',
    title: 'Hollywood Agent Simulator',
    blurb:
      'A text-based game where you play a Hollywood super-agent — negotiate with studios and talent through dynamic, LLM-driven characters à la Ari Gold.',
    image: '/hollywood-agent.webp',
    imageAlt: 'Hollywood Boulevard at sunset with neon signs and palm trees',
    caption: 'Hollywood Agent — deal in progress',
    tags: [
      { label: 'Prompt Engineering', tone: 'navy' },
      { label: 'Anthropic API', tone: 'gold' },
    ],
    meta: '2026',
    summary: [
      'Hollywood Agent is a text-based game inspired by Entourage\'s Ari Gold: you play a talent agent living on your phone, texting studios and actors to close deals. It came out of wanting to build something genuinely fun with AI rather than another utility.',
      'The design challenge was making each playthrough feel alive — I used nested, co-dependent prompts to give studios and actors dynamic attributes and unique negotiation dynamics, backed by the Anthropic API. A static database of movie projects keeps API usage, and cost, in check.',
    ],
    highlights: [
      'Nested, co-dependent prompts generate dynamic characters and negotiations',
      'Static movie-project database keeps API calls fast and cheap',
      'In-game shop rewards players for growing their agency\'s reputation',
    ],
  },
  {
    id: 'llm-tester',
    kind: 'ai',
    title: 'LLM Tester',
    blurb:
      'A side-by-side LLM comparison tool built for PMs — run one prompt across providers and models, rate the outputs, and let Claude summarize which model fits which use case.',
    image: '/llm-tester.webp',
    imageAlt: 'Rows of glowing server racks in a data center',
    caption: 'LLM Tester — side-by-side compare',
    tags: [
      { label: 'LLM Evaluation', tone: 'navy' },
      { label: 'Claude API', tone: 'gold' },
      { label: 'OpenAI API', tone: 'gold' },
      { label: 'Gemini API', tone: 'gold' },
    ],
    meta: '2026',
    summary: [
      'LLM Tester lets you run the same prompt across providers and models side by side — Claude Haiku vs Sonnet, one provider vs another — so you can build real intuition for which model to reach for. I built it because lab benchmarks rarely map to the actual PM work of writing PRDs, synthesizing interviews, and drafting strategy.',
      'Assessments are stored client-side, so there\'s no login to revisit your chats. A starter library of PM prompts solves the cold-start problem, and Claude summarizes your 1–5 star ratings into a preferred model per use case. A deliberately minimal UI leans on small color-coded signifiers to show system-prompt and journal state.',
    ],
    highlights: [
      'Compare models across providers on identical prompts, side by side',
      'Client-side journaling + Claude-summarized ratings → a preferred model per use case',
      'A PM prompt library solves the cold-start problem',
    ],
    link: { label: 'Try llm-tester-black.vercel.app ↗', href: 'https://llm-tester-black.vercel.app' },
  },
];

/**
 * Ordered newest-first. Numerals are assigned below (not stored here) so the
 * latest entry always carries the highest number — adding a new project to
 * the front of this list is all that's needed to renumber everything.
 */
const CORPORATE_PROJECTS_SOURCE: ProjectItem[] = [
  {
    id: 'prelude-nonprofit',
    kind: 'corporate',
    title: 'Scaling Prelude in Camden & Philly',
    blurb:
      'A growth-minded nonprofit needed to land corporate internship partners faster in Camden and Philly. As AI Lead on a pro bono team, I stood up AI tooling for marketing cadence and shaped the GTM plan they could actually run.',
    image: '/prelude-camden.webp',
    imageAlt: 'Aerial view of Camden, New Jersey with the Philadelphia skyline across the Delaware River',
    tags: [
      { label: 'GTM Strategy', tone: 'moss' },
      { label: 'B2B Marketing', tone: 'moss' },
      { label: 'AI Lead', tone: 'navy' },
    ],
    meta: 'FEB 2026 — JUN 2026',
    role: 'AI Lead · Pro Bono',
    summary: [
      'Prelude places high school seniors into corporate internships during the academic year. Through Compass Pro Bono, I joined a four-month skill-based volunteering team as their AI Lead. Our charter was advising Prelude on expansion tactics in Camden and Philadelphia — ambitious growth targets, thin operating capacity, and a need for both sharper GTM clarity and faster day-to-day execution.',
      'I built AI-enabled onboarding materials so the consulting team could get fluent on the client quickly, and shipped a custom subagent to raise Prelude\'s digital-marketing posting frequency. In parallel, I advised on go-to-market and client-portfolio strategy — conducting stakeholder interviews, market research, and competitor analysis that folded into recommendations the team could hand off and use.',
      'The engagement left Prelude with clearer expansion priorities for two markets and a practical AI assist for marketing ops.',
    ],
    highlights: [
      'Built AI onboarding resources so the team could get fluent on the client fast',
      "Stood up a custom subagent to raise Prelude's digital-marketing posting cadence",
      'Delivered GTM and client-portfolio recommendations from interviews, research, and competitive analysis',
    ],
    linksLead: 'To learn more about Prelude or Compass Pro Bono, explore the links below.',
    link: { label: 'joinprelude.org ↗', href: 'https://joinprelude.org' },
    secondaryLink: { label: 'compassprobono.org ↗', href: 'https://compassprobono.org' },
  },
  {
    id: 'creator-itineraries',
    kind: 'corporate',
    title: 'Creator Itineraries Beyond Hotels',
    blurb:
      'Creators on a large travel marketplace could only affiliate hotels — incomplete trips, weaker engagement, churn. I led a multi-inventory itinerary pilot that ran at $1M GBV, with a modeled path to ~$23M a year.',
    image: '/creator-itineraries.webp',
    imageAlt: 'Traveler with a backpack spreading their arms at a mountain lake',
    tags: [
      { label: '2-sided Marketplace', tone: 'moss' },
      { label: 'UX Research', tone: 'plum' },
      { label: '0 to 1', tone: 'moss' },
      { label: 'New Revenue Stream', tone: 'moss' },
    ],
    meta: '2025',
    role: 'Product Lead · Growth',
    summary: [
      'At a large travel marketplace, the influencer affiliate platform only let creators share hotels. That created a value mismatch: creators couldn\'t show the breadth of how they actually travel, users landed on incomplete trip plans, engagement sagged, and creators churned. Leadership asked whether multi-inventory itineraries — restaurants, landmarks, activities alongside stays — could convert travelers.',
      'I led a team of ten across design, engineering, and marketing to ship a proof of concept for fifteen pilot creators. We built a three-day itinerary experience with hotels, restaurants, activities, and attractions — dynamic maps, chronological guides, and rich UGC — a first for the affiliate platform. I partnered with research on a two-sided usability study, restructured database and API schemas for new inventory types and media, and owned the manual data pipeline: survey collection, JSON vetting, and PR tracking with engineering.',
      'The pilot ran at roughly $1M GBV per year; across all creators it modeled to ~$23M GBV and ~$2.3M to the bottom line. Participation blew past targets, user session length nearly doubled, engagement (share, save, click-through) lifted ~10%, and the work surfaced a new revenue path.',
    ],
    highlights: [
      'Proven gains in team KPIs, including increases in user engagement',
      'Pilot itineraries at ~$1M GBV/year; full-creator scale modeled to ~$23M GBV / ~$2.3M bottom line',
      'Exceeded participation targets and opened an enterprise-built-itinerary revenue opportunity',
    ],
  },
  {
    id: 'social-graph',
    kind: 'corporate',
    title: 'When Not to Build a Social Graph',
    blurb:
      'Retention was flat on a large travel platform, and “add social” was the easy answer. I ran the full discovery — architecture, experiments, investment model — and learned the most valuable lesson of building from zero to one.',
    image: '/social-graph.webp',
    imageAlt: 'Winding mountain road symbolizing the exploratory path into social networks',
    tags: [
      { label: 'Software Architecture', tone: 'teal' },
      { label: 'Full Stack', tone: 'teal' },
      { label: 'Roadmap Development', tone: 'moss' },
      { label: 'A/B Testing', tone: 'plum' },
    ],
    meta: '2024',
    role: 'Full-Stack PM · 0 → 1',
    summary: [
      'Travel platforms often chase retention strategies when repeat visits stall, and the mandate was to build quickly. I ran it full-stack: architecture with a principal engineer, the full social connection lifecycle (add, request, approve, deny, block), profile and connection-flow mockups, and A/B tests on supporting pieces — aligned across product, eng, design, architecture, and legal.',
      'We hit alpha on time and in spec, but support collapsed on the investment case when we entered a precarious environment in the travel industry. The social graph\'s high startup costs made its investment profile impossible to defend, regardless of build quality — shipping on time and in spec isn\'t the same as having a durable investment case.',
      'The day I shared the news with the team was one of the hardest in my career, but it sharpened how I\'d approach the next one. The lesson I carry into ambiguous 0→1 work now: understand where your most critical assumptions lie, then build the quickest means to collect a signal that validates whether the strategy could deliver meaningful ROI. While I didn\'t get to ship our work to consumers, the growth from the experience shaped each product thereafter.',
    ],
    highlights: [
      'Delivered a cross-functional, full-stack build — architecture, lifecycle, mockups, live A/B test — to alpha, on time and in spec',
      'Used sensitivity analyses and a data deep-dive to defer further investment across the project portfolio',
      'Left a reusable architectural blueprint and shaped adjacent roadmaps',
    ],
  },
  {
    id: 'ai-travel',
    kind: 'corporate',
    title: 'First GenAI Bet in Travel',
    blurb:
      'In early 2023, a large travel marketplace had to decide whether GenAI belonged in core discovery — or wait and get disrupted. I led a controlled experiment that informed budget, trust & safety, and a 100M-impression positioning campaign.',
    image: '/ai-travel.webp',
    imageAlt: 'Munich Airport terminal, representing AI in the travel industry',
    tags: [
      { label: 'Gen AI', tone: 'navy' },
      { label: 'Funnel Optimization', tone: 'moss' },
      { label: 'Go To Market', tone: 'moss' },
      { label: 'A/B Testing', tone: 'plum' },
    ],
    meta: '2023',
    role: 'Product Lead · GenAI',
    summary: [
      'In early 2023, leadership at a large travel marketplace faced its first critical Generative AI investment call: put AI into the core shopping experience, or risk being leapfrogged by AI-first players and the model providers themselves. I was asked to lead a team that could answer three questions in a finite window — would users adopt AI-assisted discovery over traditional search, would AI raise booking likelihood, and where did AI-powered experiences still fail users?',
      'I framed the work as a controlled product to learn from, not a revenue driver. We reused existing chat infrastructure and UX to reach market fast, ran usability research to surface discoverability and friction, and tracked sessions, conversation length, intent, and repeat rate. Partnering with ML and Legal, I helped shape responses and guardrails to reduce hallucinations while upskilling product, eng, design, and ML on GenAI foundations, prompting, and trust & safety.',
      "Findings steered budget toward AI in the shopping funnel and anchored a market-positioning campaign that reached 100M+ impressions — the company's first serious GenAI bet was a major success in informing our future AI investments.",
    ],
    highlights: [
      'Findings steered budget toward AI features throughout the shopping and post-booking funnels',
      'Anchored a positioning campaign that reached 100M+ impressions',
      'Upskilled product and design on GenAI, prompting, and trust & safety',
    ],
  },
  {
    id: 'invoicing-observability',
    kind: 'corporate',
    title: 'Making Invoicing Observable & Scalable',
    blurb:
      'A major cloud computing provider\'s marketing ops was drowning in a manual Salesforce invoicing pipeline — no visibility, rising delinquencies. I built measurement, fixed the friction points, and cut delinquent payments ~30% while volume grew ~40%.',
    image: '/invoicing-observability.webp',
    imageAlt: 'Rows of server racks in a cloud data center',
    tags: [
      { label: 'KPI Development', tone: 'moss' },
      { label: 'User Research', tone: 'plum' },
    ],
    meta: '2019',
    role: 'PM · Strategy & Ops',
    summary: [
      'A notable cloud computing provider was scaling fast enough to break internal systems. One of them was marketing invoicing: marketers submitted invoices through Salesforce against budgets, payment status, and delinquency tracking. The process was manual, error-prone, and blind — fires only became visible after they started. As volume rose, submission errors cascaded into bad budget tracking, delayed payments, and delinquent accounts.',
      'Operating as a solo driver with a Salesforce engineer on implementation, I owned diagnosis, strategy, experimentation, and enablement. I built a measurement layer by error type, frequency, and origin; stood up KPI dashboards for volume, delinquency, and error rate; and researched how marketers actually worked. The key insight: training lived on wiki pages no one read. The fix was dual — UI changes that reduced Salesforce submission friction, plus step-by-step video walkthroughs that matched how people learned.',
      'Delinquent payments fell ~30% by cutting errors at the source. The pipeline absorbed a ~40% volume increase without breaking, and the team kept a reusable playbook: observability, KPIs, and video-based enablement. When I left for my MBA, the role\'s job description was shaped around the strategies and framework I had pioneered.',
    ],
    highlights: [
      'Cut delinquent payments ~30% by fixing submission errors at the source',
      'Absorbed ~40% more invoice volume without the process breaking',
      'Left a playbook: observability layer, KPI dashboards, and video enablement',
    ],
  },
];

const ROMAN_NUMERALS: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function toRoman(num: number): string {
  let result = '';
  let remaining = num;
  for (const [value, symbol] of ROMAN_NUMERALS) {
    while (remaining >= value) {
      result += symbol;
      remaining -= value;
    }
  }
  return result;
}

export const CORPORATE_PROJECTS: ProjectItem[] = CORPORATE_PROJECTS_SOURCE.map((project, index) => ({
  ...project,
  numeral: `${toRoman(CORPORATE_PROJECTS_SOURCE.length - index)}.`,
}));

export const ALL_ITEMS: ProjectItem[] = [...AI_PROJECTS, ...CORPORATE_PROJECTS];
