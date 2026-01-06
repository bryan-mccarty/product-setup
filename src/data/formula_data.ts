export const METRICS = [
  "Desirability",
  "Cost",
  "Sourness",
  "Sweetness",
  "Saltiness",
  "Thickness",
  "Shine",
  "Off Notes",
] as const;

export type Metric = (typeof METRICS)[number];

export interface Sample {
  id: string;
  batch: "existing" | "next" | "benchmark";
  Desirability: number;
  Cost: number;
  Cost_d;
  Sourness: number;
  Sourness_d;
  Sweetness: number;
  Sweetness_d;
  Saltiness: number;
  Saltiness_d;
  Thickness: number;
  Thickness_d;
  Shine: number;
  Shine_d;
  "Off Notes": number;
  "Off Notes_d": number;
}

export interface NeedleAngles {
  // [angle, sigma1, sigma2]
  projectedImprovement: [number, number, number];
  chanceOfImprovement: number;
  exploreExploit: number;
}

export const Optimal_NA: NeedleAngles = {
  projectedImprovement: [18, 8, 22],
  chanceOfImprovement: 24,
  exploreExploit: -30,
};

export const SAMPLES: Sample[] = [
  {id:"A",batch:"existing",Desirability:0.62,Cost:0.31,Cost_d:0.57,Sourness:3,Sourness_d:0.60,Sweetness:5,Sweetness_d:0.50,Saltiness:4,Saltiness_d:0.86,Thickness:5,Thickness_d:0.83,Shine:6,Shine_d:0.86,"Off Notes":2,"Off Notes_d":0.80},
  {id:"B",batch:"existing",Desirability:0.78,Cost:0.27,Cost_d:0.79,Sourness:4,Sourness_d:0.80,Sweetness:7,Sweetness_d:0.70,Saltiness:3,Saltiness_d:1.00,Thickness:6,Thickness_d:0.67,Shine:8,Shine_d:0.86,"Off Notes":1,"Off Notes_d":0.90},
  {id:"C",batch:"existing",Desirability:0.55,Cost:0.25,Cost_d:0.85,Sourness:6,Sourness_d:0.80,Sweetness:6,Sweetness_d:0.60,Saltiness:5,Saltiness_d:0.71,Thickness:4,Thickness_d:1.00,Shine:5,Shine_d:0.71,"Off Notes":3,"Off Notes_d":0.70},
  {id:"D",batch:"existing",Desirability:0.45,Cost:0.31,Cost_d:0.57,Sourness:7,Sourness_d:0.60,Sweetness:4,Sweetness_d:0.40,Saltiness:6,Saltiness_d:0.57,Thickness:7,Thickness_d:0.50,Shine:4,Shine_d:0.57,"Off Notes":4,"Off Notes_d":0.60},
  {id:"E",batch:"existing",Desirability:0.76,Cost:0.29,Cost_d:0.65,Sourness:3,Sourness_d:0.60,Sweetness:8,Sweetness_d:0.80,Saltiness:2,Saltiness_d:0.86,Thickness:5,Thickness_d:0.83,Shine:7,Shine_d:1.00,"Off Notes":2,"Off Notes_d":0.80},
  {id:"F",batch:"existing",Desirability:0.52,Cost:0.24,Cost_d:0.88,Sourness:5,Sourness_d:1.00,Sweetness:3,Sweetness_d:0.30,Saltiness:7,Saltiness_d:0.43,Thickness:6,Thickness_d:0.67,Shine:3,Shine_d:0.43,"Off Notes":5,"Off Notes_d":0.50},
  {id:"G",batch:"next",Desirability:0.89,Cost:0.258,Cost_d:0.82,Sourness:2,Sourness_d:0.40,Sweetness:9,Sweetness_d:0.90,Saltiness:2,Saltiness_d:0.86,Thickness:5,Thickness_d:0.83,Shine:9,Shine_d:0.71,"Off Notes":1,"Off Notes_d":0.90},
  {id:"H",batch:"next",Desirability:0.85,Cost:0.25,Cost_d:0.85,Sourness:3,Sourness_d:0.60,Sweetness:8,Sweetness_d:0.80,Saltiness:3,Saltiness_d:1.00,Thickness:4,Thickness_d:1.00,Shine:8,Shine_d:0.86,"Off Notes":1,"Off Notes_d":0.90},
  {id:"I",batch:"next",Desirability:0.82,Cost:0.26,Cost_d:0.82,Sourness:2,Sourness_d:0.40,Sweetness:8,Sweetness_d:0.80,Saltiness:2,Saltiness_d:0.86,Thickness:4,Thickness_d:1.00,Shine:8,Shine_d:0.86,"Off Notes":1,"Off Notes_d":0.90},
  {id:"BENCH",batch:"benchmark",Desirability:0.79,Cost:0.28,Cost_d:0.75,Sourness:2,Sourness_d:0.58,Sweetness:8,Sweetness_d:0.85,Saltiness:2,Saltiness_d:0.86,Thickness:4,Thickness_d:1.00,Shine:8,Shine_d:0.86,"Off Notes":1,"Off Notes_d":0.90},

];


export const ERROR_BAR_VALUES: Record<string, Partial<Record<Metric, number>>> = {
  G: { Desirability: 0.09, Sourness: 0.3, Sweetness: 0.4, Saltiness: 0.2, Thickness: 0.3, Shine: 0.4, "Off Notes": 0.2 },
  H: { Desirability: 0.07, Sourness: 0.2, Sweetness: 0.3, Saltiness: 0.2, Thickness: 0.2, Shine: 0.3, "Off Notes": 0.1 },
  I: { Desirability: 0.08, Sourness: 0.2, Sweetness: 0.3, Saltiness: 0.1, Thickness: 0.2, Shine: 0.3, "Off Notes": 0.1 },
};

export const INPUT_VALUES: Record<string, Record<string, number>> = {
  A: { "Input A": 4.2, "Input B": 6.8, "Input C": 3.1, "Input D": 5.5, "Input E": 7.2, "Input F": 2.9, "Input G": 8.1 },
  B: { "Input A": 5.7, "Input B": 7.3, "Input C": 4.2, "Input D": 6.1, "Input E": 8.5, "Input F": 3.8, "Input G": 7.6 },
  C: { "Input A": 3.5, "Input B": 5.9, "Input C": 6.7, "Input D": 4.8, "Input E": 5.3, "Input F": 7.1, "Input G": 4.4 },
  D: { "Input A": 2.8, "Input B": 4.1, "Input C": 7.8, "Input D": 8.2, "Input E": 3.6, "Input F": 6.5, "Input G": 5.9 },
  E: { "Input A": 6.9, "Input B": 8.7, "Input C": 2.5, "Input D": 7.4, "Input E": 9.1, "Input F": 4.3, "Input G": 6.8 },
  F: { "Input A": 1.6, "Input B": 3.2, "Input C": 8.9, "Input D": 2.7, "Input E": 4.5, "Input F": 8.8, "Input G": 3.7 },
  G: { "Input A": 8.3, "Input B": 9.5, "Input C": 1.8, "Input D": 8.9, "Input E": 9.7, "Input F": 2.1, "Input G": 9.2 },
  H: { "Input A": 7.5, "Input B": 8.9, "Input C": 2.3, "Input D": 7.8, "Input E": 8.8, "Input F": 3.2, "Input G": 8.4 },
  I: { "Input A": 7.8, "Input B": 9.1, "Input C": 2.0, "Input D": 8.2, "Input E": 9.0, "Input F": 2.7, "Input G": 8.7 },
};


export const FORMULA_COLUMNS = [
  "id",
  "Desirability",
  "Cost",
  "Sourness",
  "Sweetness",
  "Saltiness",
  "Thickness",
  "Shine",
  "Off Notes",
];


/* ------------------------------------------------------------------
 *  OUTCOME METADATA
 * -----------------------------------------------------------------*/
export interface OutcomeMeta {
  /** canonical label used across the app (must match a Metric name) */
  label: (typeof METRICS)[number];
  goal: number | 'Maximize' | 'Minimize';
  bounds_min: number;
  bounds_max: number;
  goal_direction: 'up' | 'down';
  benchmark: number;
  /** business importance */
  priority: 'high' | 'low';
}

/* High‑priority rows come straight from the hard‑coded table,
 * the rest are filled in using the older “GOAL_INFO” helper.     */
export const OUTCOMES_META: OutcomeMeta[] = [
  { label: 'Sourness',   goal: 5,          bounds_min: 0,  bounds_max: 7,  goal_direction: 'up',   benchmark: 3.9, priority: 'high' }, // :contentReference[oaicite:0]{index=0}
  { label: 'Sweetness',  goal: 'Maximize', bounds_min: 0,  bounds_max: 8,  goal_direction: 'up',   benchmark: 6.5, priority: 'high' }, // :contentReference[oaicite:1]{index=1}
  { label: 'Saltiness',  goal: 3,          bounds_min: 0,  bounds_max: 7,  goal_direction: 'up',   benchmark: 2.8, priority: 'high' }, // :contentReference[oaicite:2]{index=2}
  { label: 'Cost',       goal: 0.25,       bounds_min: 0.2,bounds_max: 0.6,goal_direction: 'down', benchmark: 0.3, priority: 'high' }, // :contentReference[oaicite:3]{index=3}

  // generated from the old GOAL_INFO block (goal “Minimize” ⇒ direction = 'down')
  { label: 'Thickness',  goal: 5, bounds_min: 0,  bounds_max: 10, goal_direction: 'up', benchmark: 6.0, priority: 'low' },  // :contentReference[oaicite:4]{index=4}
  { label: 'Shine',      goal: 7, bounds_min: 0,  bounds_max: 10, goal_direction: 'up', benchmark: 6.5, priority: 'low' },   // :contentReference[oaicite:5]{index=5}
  { label: 'Off Notes',  goal: 'Minimize', bounds_min: 0,  bounds_max: 5,  goal_direction: 'down', benchmark: 2.5, priority: 'low' },   // :contentReference[oaicite:6]{index=6}
  { label: 'Desirability',goal:'Maximize', bounds_min: 0,  bounds_max:10, goal_direction: 'up',   benchmark: 7.0, priority: 'low' },
];

/* ------------------------------------------------------------------
 *  ROUND‑BY‑ROUND PERFORMANCE  (best value in each round)
 * -----------------------------------------------------------------*/
export interface OutcomeRoundPerformance {
  /** value at project kickoff (“control” / benchmark) */
  start: number;
  /** best observations for each round R1, R2, ..., dynamically */
  rounds: number[];
  rounds_d: number[];
  /** the value for this outcome in the current “best‑overall” formula */
  currentBestOverall: number;
  lastBatchProgress: number;
  overallProgress: number;
}

export const OUTCOME_PERFORMANCE: Record<OutcomeMeta['label'], OutcomeRoundPerformance> = {
  Sourness:    { start: 4.2, rounds: [4.8, 5.1], rounds_d: [0.64, 0.69, 0.72],  currentBestOverall: 4.2, lastBatchProgress: -0.4, overallProgress: 1.2 },
  Sweetness:   { start: 6.5, rounds: [6.9, 7.4], rounds_d: [0.68, 0.75, 0.78], currentBestOverall: 7.1, lastBatchProgress: 0.3, overallProgress: 2.1 },
  Saltiness:   { start: 2.8, rounds: [3.2, 3.2], rounds_d: [0.64, 0.69, 0.72], currentBestOverall: 2.7, lastBatchProgress: -0.1, overallProgress: 0.8 },
  Cost:        { start: 0.3, rounds: [0.27, 0.24], rounds_d: [0.64, 0.69, 0.72], currentBestOverall: 0.27, lastBatchProgress: 0.02, overallProgress: -0.05 },
  Thickness:   { start: 6.4, rounds: [6.0, 5.6], rounds_d: [0.64, 0.69, 0.72], currentBestOverall: 5.5, lastBatchProgress: 0.12, overallProgress: 1.4 },
  Shine:       { start: 6.8, rounds: [6.4, 6.0], rounds_d: [0.64, 0.69, 0.72], currentBestOverall: 6.0, lastBatchProgress: -0.08, overallProgress: 0.9 },
  'Off Notes': { start: 3.2, rounds: [2.7, 2.0], rounds_d: [0.64, 0.69, 0.72], currentBestOverall: 2.0, lastBatchProgress: 0.15, overallProgress: 1.7 },
  Desirability:{ start: 0.6, rounds: [.68, .75], rounds_d: [0.64, 0.69, 0.72], currentBestOverall: .71, lastBatchProgress: 0.10, overallProgress: .25 },
};

/* ------------------------------------------------------------------
 *  PROJECTIONS  (room for ML in the future ‑‑ stub for now)
 * -----------------------------------------------------------------*/
export interface OutcomeProjection {
  confidence: 'achieved' | 'high' | 'medium' | 'low' | 'danger';
  /** Desirability 90% CI per round (normalized 0–1) */
  desirability: [number, number][];
  /** Probability of success per round (0–1) */
  success: number[];
}

export const OUTCOME_PROJECTIONS: Record<string, OutcomeProjection> = {
  Sourness:    {confidence:'medium',  desirability:[[0.59,0.73],[0.63,0.92],[0.65,0.94]], success:[0.60,0.62,0.65]},
  Sweetness:   {confidence:'achieved',desirability:[[0.78,0.82],[0.79,0.88],[0.80,0.98]], success:[0.95,0.96,0.97]},
  Saltiness:   {confidence:'high',    desirability:[[0.59,0.73],[0.63,0.92],[0.65,0.94]], success:[0.80,0.82,0.85]},
  Cost:        {confidence:'high',    desirability:[[0.59,0.73],[0.63,0.92],[0.65,0.94]], success:[0.78,0.80,0.82]},
  Thickness:   {confidence:'low',     desirability:[[0.59,0.73],[0.63,0.92],[0.65,0.94]], success:[0.40,0.42,0.45]},
  Shine:       {confidence:'medium',  desirability:[[0.59,0.73],[0.63,0.92],[0.65,0.94]], success:[0.60,0.63,0.65]},
  'Off Notes': {confidence:'high',    desirability:[[0.59,0.73],[0.63,0.92],[0.65,0.94]], success:[0.82,0.85,0.88]},
  Desirability:{confidence:'achieved',desirability:[[0.59,0.73],[0.63,0.92],[0.65,0.94]], success:[0.95,0.92,0.93]},
};
