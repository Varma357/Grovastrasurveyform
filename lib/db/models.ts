import mongoose, { Schema, Document, Model } from 'mongoose';

// ---------------------------------------------------------
// 1. SHOP SCHEMA & MODEL
// ---------------------------------------------------------
export interface IShopDocument extends Document {
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

const ShopSchema = new Schema<IShopDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    shop_code: { type: String, required: true, unique: true, index: true },
    shop_name: { type: String, required: true },
    client_name: { type: String, required: true },
    location: { type: String, required: true },
    contact_number: { type: String, default: '' },
    shop_type: { type: String, default: 'Saree Retail' },
    staff_count: { type: Number, default: 1 },
    years_in_business: { type: Number, default: 1 },
    online_presence: { type: [String], default: [] },
    created_by: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const ShopModel: Model<IShopDocument> =
  mongoose.models.Shop || mongoose.model<IShopDocument>('Shop', ShopSchema);

// ---------------------------------------------------------
// 2. INTERVIEWER SCHEMA & MODEL
// ---------------------------------------------------------
export interface IInterviewerDocument extends Document {
  id: string;
  user_id?: string;
  name: string;
  email?: string;
  mobile?: string;
  active: boolean;
  created_at: string;
}

const InterviewerSchema = new Schema<IInterviewerDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    user_id: { type: String },
    name: { type: String, required: true },
    email: { type: String },
    mobile: { type: String },
    active: { type: Boolean, default: true },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const InterviewerModel: Model<IInterviewerDocument> =
  mongoose.models.Interviewer || mongoose.model<IInterviewerDocument>('Interviewer', InterviewerSchema);

// ---------------------------------------------------------
// 3. EMPLOYEE USER SCHEMA & MODEL
// ---------------------------------------------------------
export interface IEmployeeDocument extends Document {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'ADMIN' | 'INTERVIEWER';
  password?: string;
  active: boolean;
  created_at: string;
}

const EmployeeSchema = new Schema<IEmployeeDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'INTERVIEWER'], required: true },
    password: { type: String },
    active: { type: Boolean, default: true },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const EmployeeModel: Model<IEmployeeDocument> =
  mongoose.models.Employee || mongoose.model<IEmployeeDocument>('Employee', EmployeeSchema);

// ---------------------------------------------------------
// 4. INTERVIEW SCHEMA & MODEL
// ---------------------------------------------------------
export interface IInterviewDocument extends Document {
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
}

const InterviewSchema = new Schema<IInterviewDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    interview_code: { type: String, required: true, unique: true, index: true },
    shop_id: { type: String, required: true, index: true },
    interviewer_id: { type: String },
    survey_version_id: { type: String },
    started_at: { type: String, default: () => new Date().toISOString() },
    completed_at: { type: String },
    duration_minutes: { type: Number },
    main_completed: { type: Boolean, default: false },
    optional_completed: { type: Boolean, default: false },
    optional_declined: { type: Boolean, default: false },
    quick_followup: { type: Boolean, default: false },
    status: { type: String, enum: ['draft', 'main_completed', 'completed'], default: 'draft' },
    overall_score: { type: Number },
    verdict: { type: String },
    is_walkin: { type: Boolean, default: true },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const InterviewModel: Model<IInterviewDocument> =
  mongoose.models.Interview || mongoose.model<IInterviewDocument>('Interview', InterviewSchema);

// ---------------------------------------------------------
// 5. CATEGORY SCHEMA & MODEL
// ---------------------------------------------------------
export interface ICategoryDocument extends Document {
  id: string;
  category_code: string;
  category_name: string;
  description?: string;
  active: boolean;
  display_order: number;
}

const CategorySchema = new Schema<ICategoryDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    category_code: { type: String, required: true, unique: true, index: true },
    category_name: { type: String, required: true },
    description: { type: String },
    active: { type: Boolean, default: true },
    display_order: { type: Number, required: true },
  },
  { timestamps: false }
);

export const CategoryModel: Model<ICategoryDocument> =
  mongoose.models.Category || mongoose.model<ICategoryDocument>('Category', CategorySchema);

// ---------------------------------------------------------
// 6. FEATURE SCHEMA & MODEL
// ---------------------------------------------------------
export interface IFeatureDocument extends Document {
  id: string;
  feature_code: string;
  feature_name: string;
  category_id: string;
  description?: string;
  active: boolean;
  category_code?: string;
}

const FeatureSchema = new Schema<IFeatureDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    feature_code: { type: String, required: true, unique: true, index: true },
    feature_name: { type: String, required: true },
    category_id: { type: String, required: true, index: true },
    description: { type: String },
    active: { type: Boolean, default: true },
    category_code: { type: String },
  },
  { timestamps: false }
);

export const FeatureModel: Model<IFeatureDocument> =
  mongoose.models.Feature || mongoose.model<IFeatureDocument>('Feature', FeatureSchema);

// ---------------------------------------------------------
// 7. QUESTION & OPTION SCHEMA & MODEL
// ---------------------------------------------------------
export interface IQuestionOption {
  id: string;
  question_id: string;
  option_label: string;
  score: number | null;
  display_order: number;
}

export interface IQuestionDocument extends Document {
  id: string;
  question_code: string;
  category_id: string;
  question_type: 'Main' | 'Optional';
  question_text: string;
  display_order: number;
  priority: number;
  active: boolean;
  feature_id?: string;
  trigger_rule?: any;
  options: IQuestionOption[];
  category_code?: string;
  feature_code?: string;
}

const QuestionOptionSchema = new Schema<IQuestionOption>(
  {
    id: { type: String, required: true },
    question_id: { type: String, required: true },
    option_label: { type: String, required: true },
    score: { type: Number, default: null },
    display_order: { type: Number, required: true },
  },
  { _id: false }
);

const QuestionSchema = new Schema<IQuestionDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    question_code: { type: String, required: true, unique: true, index: true },
    category_id: { type: String, required: true, index: true },
    question_type: { type: String, enum: ['Main', 'Optional'], required: true },
    question_text: { type: String, required: true },
    display_order: { type: Number, required: true },
    priority: { type: Number, required: true },
    active: { type: Boolean, default: true },
    feature_id: { type: String },
    trigger_rule: { type: Schema.Types.Mixed },
    options: [QuestionOptionSchema],
    category_code: { type: String },
    feature_code: { type: String },
  },
  { timestamps: false }
);

export const QuestionModel: Model<IQuestionDocument> =
  mongoose.models.Question || mongoose.model<IQuestionDocument>('Question', QuestionSchema);

// ---------------------------------------------------------
// 8. SURVEY RESPONSE SCHEMA & MODEL
// ---------------------------------------------------------
export interface ISurveyResponseDocument extends Document {
  id: string;
  interview_id: string;
  question_id: string;
  selected_option_id?: string | null;
  answer_text?: string | null;
  score?: number | null;
  created_at: string;
}

const SurveyResponseSchema = new Schema<ISurveyResponseDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    interview_id: { type: String, required: true, index: true },
    question_id: { type: String, required: true, index: true },
    selected_option_id: { type: String, default: null },
    answer_text: { type: String, default: null },
    score: { type: Number, default: null },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const SurveyResponseModel: Model<ISurveyResponseDocument> =
  mongoose.models.SurveyResponse || mongoose.model<ISurveyResponseDocument>('SurveyResponse', SurveyResponseSchema);

// ---------------------------------------------------------
// 9. CATEGORY SCORE SCHEMA & MODEL
// ---------------------------------------------------------
export interface ICategoryScoreDocument extends Document {
  id: string;
  interview_id: string;
  category_id: string;
  total_score: number;
  maximum_score: number;
  percentage: number;
  status: 'Strong Current Process' | 'Moderate Opportunity' | 'Significant Opportunity';
  created_at: string;
}

const CategoryScoreSchema = new Schema<ICategoryScoreDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    interview_id: { type: String, required: true, index: true },
    category_id: { type: String, required: true, index: true },
    total_score: { type: Number, required: true },
    maximum_score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Strong Current Process', 'Moderate Opportunity', 'Significant Opportunity'],
      required: true,
    },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const CategoryScoreModel: Model<ICategoryScoreDocument> =
  mongoose.models.CategoryScore || mongoose.model<ICategoryScoreDocument>('CategoryScore', CategoryScoreSchema);

// ---------------------------------------------------------
// 10. PAIN POINT SCHEMA & MODEL
// ---------------------------------------------------------
export interface IPainPointDocument extends Document {
  id: string;
  interview_id: string;
  category_id: string;
  pain_type?: string;
  severity?: number;
  frequency?: string;
  impact?: string;
  created_at: string;
}

const PainPointSchema = new Schema<IPainPointDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    interview_id: { type: String, required: true, index: true },
    category_id: { type: String, required: true, index: true },
    pain_type: { type: String },
    severity: { type: Number },
    frequency: { type: String },
    impact: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const PainPointModel: Model<IPainPointDocument> =
  mongoose.models.PainPoint || mongoose.model<IPainPointDocument>('PainPoint', PainPointSchema);

// ---------------------------------------------------------
// 11. PURCHASE INTENT SCHEMA & MODEL
// ---------------------------------------------------------
export interface IPurchaseIntentDocument extends Document {
  id: string;
  interview_id: string;
  interest_level?: string;
  readiness_level?: string;
  price_range?: string;
  created_at: string;
}

const PurchaseIntentSchema = new Schema<IPurchaseIntentDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    interview_id: { type: String, required: true, index: true },
    interest_level: { type: String },
    readiness_level: { type: String },
    price_range: { type: String },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const PurchaseIntentModel: Model<IPurchaseIntentDocument> =
  mongoose.models.PurchaseIntent || mongoose.model<IPurchaseIntentDocument>('PurchaseIntent', PurchaseIntentSchema);

// ---------------------------------------------------------
// 12. SHOP PHOTO SCHEMA & MODEL
// ---------------------------------------------------------
export interface IShopPhotoDocument extends Document {
  id: string;
  shop_id: string;
  interview_id: string;
  storage_path?: string;
  photo_url: string;
  captured_at: string;
}

const ShopPhotoSchema = new Schema<IShopPhotoDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    shop_id: { type: String, required: true, index: true },
    interview_id: { type: String, required: true, index: true },
    storage_path: { type: String },
    photo_url: { type: String, required: true },
    captured_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const ShopPhotoModel: Model<IShopPhotoDocument> =
  mongoose.models.ShopPhoto || mongoose.model<IShopPhotoDocument>('ShopPhoto', ShopPhotoSchema);

// ---------------------------------------------------------
// 13. SURVEY VERSION SCHEMA & MODEL
// ---------------------------------------------------------
export interface ISurveyVersionDocument extends Document {
  id: string;
  version_name: string;
  version_number: string;
  active: boolean;
  created_at: string;
}

const SurveyVersionSchema = new Schema<ISurveyVersionDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    version_name: { type: String, required: true },
    version_number: { type: String, required: true },
    active: { type: Boolean, default: true },
    created_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const SurveyVersionModel: Model<ISurveyVersionDocument> =
  mongoose.models.SurveyVersion || mongoose.model<ISurveyVersionDocument>('SurveyVersion', SurveyVersionSchema);

// ---------------------------------------------------------
// 14. ADMIN SETTINGS SCHEMA & MODEL
// ---------------------------------------------------------
export interface IAdminSettingDocument extends Document {
  key: string;
  value: any;
  updated_at: string;
}

const AdminSettingSchema = new Schema<IAdminSettingDocument>(
  {
    key: { type: String, required: true, unique: true, index: true },
    value: { type: Schema.Types.Mixed, required: true },
    updated_at: { type: String, default: () => new Date().toISOString() },
  },
  { timestamps: false }
);

export const AdminSettingModel: Model<IAdminSettingDocument> =
  mongoose.models.AdminSetting || mongoose.model<IAdminSettingDocument>('AdminSetting', AdminSettingSchema);
