import { Question, SurveyResponse, CategoryScore } from './types';

export interface CategorySummary {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  description: string;
  totalScore: number;
  maximumScore: number;
  percentage: number;
  status: 'Strong' | 'Moderate Opportunity' | 'Significant Opportunity';
  politeLabel: string;
  mainResponsesCount: number;
}

export function calculateCategoryScores(
  categories: Array<{ id: string; category_code: string; category_name: string; description?: string }>,
  mainQuestions: Question[],
  responses: Record<string, number> // question_id -> score (0, 1, 2)
): CategorySummary[] {
  const summaries: CategorySummary[] = [];

  for (const cat of categories) {
    const catQuestions = mainQuestions.filter(
      (q) => q.category_id === cat.id && q.question_type === 'Main'
    );

    if (catQuestions.length === 0) continue;

    let totalScore = 0;
    let answeredCount = 0;

    for (const q of catQuestions) {
      const s = responses[q.id];
      if (typeof s === 'number') {
        totalScore += s;
        answeredCount++;
      }
    }

    const maximumScore = catQuestions.length * 2;
    const percentage = maximumScore > 0 ? Math.round((totalScore / maximumScore) * 100 * 100) / 100 : 0;

    let status: 'Strong' | 'Moderate Opportunity' | 'Significant Opportunity' = 'Strong';
    let politeLabel = 'Process appears well-established.';

    if (percentage >= 67) {
      status = 'Significant Opportunity';
      politeLabel = 'We identified an area that may be worth exploring further.';
    } else if (percentage >= 34) {
      status = 'Moderate Opportunity';
      politeLabel = 'Area with potential for process optimization.';
    }

    summaries.push({
      categoryId: cat.id,
      categoryCode: cat.category_code,
      categoryName: cat.category_name,
      description: cat.description || '',
      totalScore,
      maximumScore,
      percentage,
      status,
      politeLabel,
      mainResponsesCount: answeredCount,
    });
  }

  return summaries;
}

export function getEligibleOptionalQuestions(
  optionalQuestions: Question[],
  categorySummaries: CategorySummary[],
  mainResponses: Record<string, { questionCode: string; score: number }>,
  quickFollowup: boolean = false
): Question[] {
  // Map category code to percentage
  const catScoreMap = new Map<string, number>();
  categorySummaries.forEach((cs) => catScoreMap.set(cs.categoryCode, cs.percentage));

  // Check if NETWORK reseller channel is inactive
  const networkM01Response = Object.values(mainResponses).find(
    (r) => r.questionCode === 'NETWORK-M01'
  );
  const skipResellers = networkM01Response?.score === 2; // "Not an important channel"

  const eligible: Question[] = [];

  for (const q of optionalQuestions) {
    const catCode = q.category_code || '';
    const catPercentage = catScoreMap.get(catCode) || 0;

    // Must have pain score >= 34%
    if (catPercentage < 34) continue;

    // Check reseller skip rule
    if (catCode === 'NETWORK' && skipResellers) {
      if (q.trigger_rule?.skip_if_no_resellers) continue;
    }

    eligible.push(q);
  }

  // Sort eligible questions by Category Pain % (descending), then Question Priority (ascending)
  eligible.sort((a, b) => {
    const painA = catScoreMap.get(a.category_code || '') || 0;
    const painB = catScoreMap.get(b.category_code || '') || 0;

    if (painB !== painA) return painB - painA;
    return a.priority - b.priority;
  });

  if (quickFollowup) {
    // Return at most 1 highest priority question per affected category
    const selected: Question[] = [];
    const seenCats = new Set<string>();

    for (const q of eligible) {
      const catCode = q.category_code || '';
      if (!seenCats.has(catCode)) {
        seenCats.add(catCode);
        selected.push(q);
      }
    }
    return selected;
  }

  return eligible;
}
