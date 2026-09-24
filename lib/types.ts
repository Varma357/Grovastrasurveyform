export type UserRole = 'ADMIN' | 'INTERVIEWER';

export interface Shop {
  id: string;
  shop_code: string;
  shop_name: string;
  client_name: string;
  location: string;
  contact_number?: string;
  shop_type?: string;
  staff_count?: number;
  years_in_business?: number;
  online_presence?: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Interviewer {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  mobile?: string;
  active: boolean;
  created_at: string;
}

export interface EmployeeUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: UserRole;
  password?: string;
  active: boolean;
  created_at: string;
}

export interface SurveyVersion {
  id: string;
  version_name: string;
  version_number: string;
  active: boolean;
  created_at: string;
}

export interface Interview {
  id: string;
  interview_code: string;
  shop_id: string;
  interviewer_id?: string;
  survey_version_id?: string;
  started_at: string;
  completed_at?: string;
  duration_minutes?: number;
  main_completed: boolean;
  optional_completed: boolean;
  optional_declined: boolean;
  quick_followup: boolean;
  status: 'draft' | 'main_completed' | 'completed';
  overall_score?: number;
  verdict?: 'Strong Current Process' | 'Moderate Opportunity' | 'Significant Opportunity';
  is_walkin?: boolean;
  created_at: string;
  // Joined fields for UI
  shop?: Shop;
  interviewer?: Interviewer;
  photo_url?: string;
}

export interface Category {
  id: string;
  category_code: string;
  category_name: string;
  description?: string;
  active: boolean;
  display_order: number;
}

export interface Feature {
  id: string;
  feature_code: string;
  feature_name: string;
  category_id: string;
  description?: string;
  active: boolean;
  category_code?: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_label: string;
  score: number | null;
  display_order: number;
}

export interface Question {
  id: string;
  question_code: string;
  category_id: string;
  question_type: 'Main' | 'Optional';
  question_text: string;
  display_order: number;
  priority: number;
  active: boolean;
  feature_id?: string | null;
  trigger_rule?: any;
  options?: QuestionOption[];
  category_code?: string;
  feature_code?: string;
}

export interface SurveyResponse {
  id: string;
  interview_id: string;
  question_id: string;
  selected_option_id?: string | null;
  answer_text?: string | null;
  score?: number | null;
  created_at: string;
}

export interface PainPoint {
  id: string;
  interview_id: string;
  category_id: string;
  pain_type?: string;
  severity?: number;
  frequency?: 'Never' | 'Rarely' | 'Sometimes' | 'Frequently' | 'Very Frequently';
  impact?: string;
  created_at: string;
}

export interface PurchaseIntent {
  id: string;
  interview_id: string;
  interest_level?: string;
  readiness_level?: string;
  price_range?: string;
  created_at: string;
}

export interface ShopPhoto {
  id: string;
  shop_id: string;
  interview_id: string;
  storage_path?: string;
  photo_url: string;
  captured_at: string;
}

export interface CategoryScore {
  id: string;
  interview_id: string;
  category_id: string;
  total_score: number;
  maximum_score: number;
  percentage: number;
  status: 'Strong' | 'Moderate Opportunity' | 'Significant Opportunity';
  created_at: string;
  category_code?: string;
  category_name?: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: any;
  created_at: string;
}

export interface CalculatedFeatureDemand {
  featureId: string;
  featureCode: string;
  featureName: string;
  categoryCode: string;
  categoryName: string;
  shopsAffectedCount: number;
  totalSampleShops: number;
  painSignalPercentage: number;
  conditionalSignalPercentage: number;
  overallDemandSignal: 'High Demand' | 'Moderate Demand' | 'Low Demand' | 'Insufficient Data';
  priorityLevel: 'P1 - Critical' | 'P2 - High' | 'P3 - Medium' | 'Needs Validation';
}
