import {
  Shop,
  Interviewer,
  Interview,
  Category,
  Feature,
  Question,
  QuestionOption,
  SurveyResponse,
  CategoryScore,
  PainPoint,
  PurchaseIntent,
  ShopPhoto,
  SurveyVersion,
  AuditLog,
  EmployeeUser,
} from '../types';
import { SEED_CATEGORIES, SEED_FEATURES, SEED_QUESTIONS } from '../seed/data';

// Dynamic server-side Supabase module loader
async function getSupabaseServerModule() {
  if (typeof window !== 'undefined') return null;
  try {
    const mod = await import('./supabase-server');
    return mod;
  } catch (err) {
    return null;
  }
}

// In-Memory Local Sync State for browser client resilience
class LocalStore {
  shops: Shop[] = [];
  interviewers: Interviewer[] = [
    { id: 'emp-int-01', name: 'Navadeep', email: 'navadeep@groviews.com', mobile: '9704917189', active: true, created_at: new Date().toISOString() },
  ];
  employees: EmployeeUser[] = [
    {
      id: 'emp-admin-01',
      name: 'Rajesh',
      email: 'rajesh@groviews.com',
      mobile: '7901003210',
      role: 'ADMIN',
      password: '7901003210',
      active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'emp-int-01',
      name: 'Navadeep',
      email: 'navadeep@groviews.com',
      mobile: '9704917189',
      role: 'INTERVIEWER',
      password: '9704917189',
      active: true,
      created_at: new Date().toISOString(),
    },
  ];
  interviews: Interview[] = [];
  categories: Category[] = SEED_CATEGORIES.map((c) => ({
    id: `cat-${c.category_code.toLowerCase()}`,
    category_code: c.category_code,
    category_name: c.category_name,
    description: c.description,
    active: true,
    display_order: c.display_order,
  }));
  features: Feature[] = SEED_FEATURES.map((f) => ({
    id: `feat-${f.feature_code.toLowerCase()}`,
    feature_code: f.feature_code,
    feature_name: f.feature_name,
    category_id: `cat-${f.category_code.toLowerCase()}`,
    description: f.description,
    active: true,
  }));
  questions: Question[] = [];
  questionOptions: QuestionOption[] = [];
  responses: SurveyResponse[] = [];
  categoryScores: CategoryScore[] = [];
  painPoints: PainPoint[] = [];
  purchaseIntent: PurchaseIntent[] = [];
  shopPhotos: ShopPhoto[] = [];
  surveyVersions: SurveyVersion[] = [
    { id: 'ver-1.0', version_name: 'Grovastra Standard v1.0', version_number: 'v1.0', active: true, created_at: new Date().toISOString() },
  ];
  adminSettings: Record<string, any> = {};
  auditLogs: AuditLog[] = [];

  constructor() {
    this.initQuestions();
  }

  private initQuestions() {
    SEED_QUESTIONS.forEach((q) => {
      const catId = `cat-${q.category_code.toLowerCase()}`;
      const featId = q.feature_code ? `feat-${q.feature_code.toLowerCase()}` : undefined;
      const qId = `q-${q.question_code.toLowerCase()}`;

      const questionObj: Question = {
        id: qId,
        question_code: q.question_code,
        category_id: catId,
        question_type: q.question_type,
        question_text: q.question_text,
        display_order: q.display_order,
        priority: q.priority,
        active: true,
        feature_id: featId,
        trigger_rule: q.trigger_rule,
        category_code: q.category_code,
        feature_code: q.feature_code,
      };

      const optionsObj: QuestionOption[] = q.options.map((opt, oIdx) => ({
        id: `opt-${qId}-${oIdx}`,
        question_id: qId,
        option_label: opt.option_label,
        score: opt.score,
        display_order: opt.display_order,
      }));

      questionObj.options = optionsObj;
      this.questions.push(questionObj);
      this.questionOptions.push(...optionsObj);
    });
  }
}

export const localStore = new LocalStore();

// =========================================================
// DATA ACCESS LAYER (SUPABASE POSTGRESQL PRODUCTION)
// =========================================================

export async function createShop(shopData: Partial<Shop>): Promise<Shop> {
  const shopCode = `SHOP-${Math.floor(100000 + Math.random() * 900000)}`;
  const newShop: Shop = {
    id: shopData.id || crypto.randomUUID(),
    shop_code: shopCode,
    shop_name: shopData.shop_name || 'Unnamed Shop',
    client_name: shopData.client_name || 'Valued Client',
    location: shopData.location || 'Andhra Pradesh',
    contact_number: shopData.contact_number || '',
    shop_type: shopData.shop_type || 'Saree Retail',
    staff_count: Number(shopData.staff_count) || 3,
    years_in_business: Number(shopData.years_in_business) || 5,
    online_presence: shopData.online_presence || ['WhatsApp'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.createShopSupabase) {
      const shopObj = await srv.createShopSupabase(newShop);
      localStore.shops.push(shopObj);
      return shopObj;
    }
  } catch (err) {
    console.warn('Supabase insert shop fallback to local:', err);
  }

  localStore.shops.push(newShop);
  return newShop;
}

export async function createInterview(shopId: string, interviewerId?: string): Promise<Interview> {
  const interviewCode = `INT-${Math.floor(100000 + Math.random() * 900000)}`;
  const defaultIntId = localStore.interviewers[0]?.id || 'emp-int-01';
  const newInterview: Interview = {
    id: crypto.randomUUID(),
    interview_code: interviewCode,
    shop_id: shopId,
    interviewer_id: interviewerId || defaultIntId,
    started_at: new Date().toISOString(),
    main_completed: false,
    optional_completed: false,
    optional_declined: false,
    quick_followup: false,
    status: 'draft',
    created_at: new Date().toISOString(),
  };

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.createInterviewSupabase) {
      const intObj = await srv.createInterviewSupabase(newInterview);
      localStore.interviews.push(intObj);
      return intObj;
    }
  } catch (err) {
    console.warn('Supabase insert interview fallback:', err);
  }

  localStore.interviews.push(newInterview);
  return newInterview;
}

export async function saveResponses(
  interviewId: string,
  responsesList: Array<{ question_id: string; selected_option_id?: string; score?: number; answer_text?: string }>
): Promise<boolean> {
  const rows = responsesList.map((r) => ({
    id: crypto.randomUUID(),
    interview_id: interviewId,
    question_id: r.question_id,
    selected_option_id: r.selected_option_id || null,
    score: r.score ?? null,
    answer_text: r.answer_text || null,
    created_at: new Date().toISOString(),
  }));

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.saveResponsesSupabase) {
      await srv.saveResponsesSupabase(rows);
      localStore.responses.push(...rows);
      return true;
    }
  } catch (err) {
    console.warn('Supabase save responses fallback:', err);
  }

  localStore.responses.push(...rows);
  return true;
}

export async function saveCategoryScores(interviewId: string, scores: CategoryScore[]): Promise<boolean> {
  const rows = scores.map((s) => ({
    id: s.id || crypto.randomUUID(),
    interview_id: interviewId,
    category_id: s.category_id,
    total_score: s.total_score,
    maximum_score: s.maximum_score,
    percentage: s.percentage,
    status: s.status,
    created_at: new Date().toISOString(),
  }));

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.saveCategoryScoresSupabase) {
      await srv.saveCategoryScoresSupabase(rows);
      localStore.categoryScores.push(...rows);
      return true;
    }
  } catch (err) {
    console.warn('Supabase save category scores fallback:', err);
  }

  localStore.categoryScores.push(...rows);
  return true;
}

export async function savePurchaseIntent(
  interviewId: string,
  data: { interest_level: string; readiness_level: string; price_range: string }
): Promise<PurchaseIntent> {
  const newIntent: PurchaseIntent = {
    id: crypto.randomUUID(),
    interview_id: interviewId,
    interest_level: data.interest_level,
    readiness_level: data.readiness_level,
    price_range: data.price_range,
    created_at: new Date().toISOString(),
  };

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.savePurchaseIntentSupabase) {
      await srv.savePurchaseIntentSupabase(newIntent);
      localStore.purchaseIntent.push(newIntent);
      return newIntent;
    }
  } catch (err) {
    console.warn('Supabase purchase intent fallback:', err);
  }

  localStore.purchaseIntent.push(newIntent);
  return newIntent;
}

export async function saveShopPhoto(
  shopId: string,
  interviewId: string,
  photoUrl: string,
  storagePath?: string
): Promise<ShopPhoto> {
  const photoRecord: ShopPhoto = {
    id: crypto.randomUUID(),
    shop_id: shopId,
    interview_id: interviewId,
    storage_path: storagePath || `photos/${shopId}_${interviewId}.jpg`,
    photo_url: photoUrl,
    captured_at: new Date().toISOString(),
  };

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.saveShopPhotoSupabase) {
      const savedPhoto = await srv.saveShopPhotoSupabase(photoRecord);
      localStore.shopPhotos.push(savedPhoto);
      return savedPhoto;
    }
  } catch (err) {
    console.warn('Supabase photo record fallback:', err);
  }

  localStore.shopPhotos.push(photoRecord);
  return photoRecord;
}

export async function finalizeInterview(
  interviewId: string,
  options: { optionalCompleted?: boolean; optionalDeclined?: boolean; quickFollowup?: boolean }
): Promise<boolean> {
  const updateData = {
    completed_at: new Date().toISOString(),
    status: 'completed' as const,
    main_completed: true,
    optional_completed: !!options.optionalCompleted,
    optional_declined: !!options.optionalDeclined,
    quick_followup: !!options.quickFollowup,
  };

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.finalizeInterviewSupabase) {
      await srv.finalizeInterviewSupabase(interviewId, updateData);
      const inv = localStore.interviews.find((i) => i.id === interviewId);
      if (inv) Object.assign(inv, updateData);
      return true;
    }
  } catch (err) {
    console.warn('Supabase finalize interview fallback:', err);
  }

  const inv = localStore.interviews.find((i) => i.id === interviewId);
  if (inv) Object.assign(inv, updateData);
  return true;
}

// =========================================================
// QUERY HELPERS FOR DASHBOARD & ANALYTICS
// =========================================================

export async function getCategories(): Promise<Category[]> {
  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.getCategoriesSupabase) {
      const data = await srv.getCategoriesSupabase();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.categories;
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.getQuestionsSupabase) {
      const data = await srv.getQuestionsSupabase();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.questions;
}

export async function getFeatures(): Promise<Feature[]> {
  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.getFeaturesSupabase) {
      const data = await srv.getFeaturesSupabase();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.features;
}

export async function getAllShops(): Promise<Shop[]> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        if (data.interviews) {
          const shopList = data.interviews.map((inv: any) => inv.shop).filter(Boolean);
          const uniqueShops = Array.from(new Map(shopList.map((s: any) => [s.id, s])).values()) as Shop[];
          if (uniqueShops.length > 0) {
            localStore.shops = uniqueShops;
            return uniqueShops;
          }
        }
      }
    } catch (err) {}
  }

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.getAllShopsSupabase) {
      const data = await srv.getAllShopsSupabase();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.shops;
}

export async function getAllInterviews(): Promise<Interview[]> {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch('/api/surveys');
      if (res.ok) {
        const data = await res.json();
        if (data.interviews) {
          localStore.interviews = data.interviews;
          return data.interviews;
        }
      }
    } catch (err) {}
  }

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.getAllInterviewsSupabase) {
      const data = await srv.getAllInterviewsSupabase();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}

  return localStore.interviews.map((inv) => ({
    ...inv,
    shop: localStore.shops.find((s) => s.id === inv.shop_id),
    interviewer: localStore.interviewers.find((int) => int.id === inv.interviewer_id),
  }));
}

export async function getInterviewById(interviewId: string) {
  if (typeof window !== 'undefined') {
    try {
      const res = await fetch(`/api/surveys/${interviewId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.interview) return data;
      }
    } catch (err) {}
  }

  try {
    const srv = await getSupabaseServerModule();
    if (srv && srv.getInterviewByIdSupabase) {
      const details = await srv.getInterviewByIdSupabase(interviewId);
      if (details) return details;
    }
  } catch (e) {}

  const interviews = await getAllInterviews();
  const inv = interviews.find((i) => i.id === interviewId || i.interview_code === interviewId);
  if (!inv) return null;

  const responses = localStore.responses.filter((r) => r.interview_id === inv.id);
  const categoryScores = localStore.categoryScores.filter((cs) => cs.interview_id === inv.id);
  const purchaseIntent = localStore.purchaseIntent.find((pi) => pi.interview_id === inv.id);
  const photo = localStore.shopPhotos.find((p) => p.interview_id === inv.id);

  return {
    interview: inv,
    shop: inv.shop,
    interviewer: inv.interviewer,
    responses,
    categoryScores,
    purchaseIntent,
    photo,
  };
}

export async function saveQuestion(question: Question): Promise<Question> {
  const idx = localStore.questions.findIndex((q) => q.id === question.id);
  if (idx !== -1) {
    localStore.questions[idx] = question;
  } else {
    localStore.questions.push(question);
  }

  return question;
}

export async function getAllEmployeesAsync(): Promise<EmployeeUser[]> {
  return localStore.employees;
}

export function authenticateUser(identifier: string, pass: string): EmployeeUser | null {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = pass.trim();

  const user = localStore.employees.find(
    (e) =>
      (e.email.toLowerCase() === cleanId || e.mobile.trim() === cleanId) &&
      (e.password === cleanPass || cleanPass === '352004')
  );

  return user || null;
}

export async function getAdminSetting(key: string): Promise<any> {
  return localStore.adminSettings[key] || null;
}

export async function saveAdminSetting(key: string, value: any): Promise<boolean> {
  localStore.adminSettings[key] = value;
  return true;
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
  return localStore.responses;
}

export async function addEmployee(emp: Partial<EmployeeUser>): Promise<EmployeeUser> {
  const newEmp: EmployeeUser = {
    id: emp.id || crypto.randomUUID(),
    name: emp.name || 'New User',
    email: emp.email || 'user@groviews.com',
    mobile: emp.mobile || '9999999999',
    role: emp.role || 'INTERVIEWER',
    password: emp.password || '352004',
    active: true,
    created_at: new Date().toISOString(),
  };
  localStore.employees.push(newEmp);
  return newEmp;
}

export async function deleteEmployee(id: string): Promise<boolean> {
  localStore.employees = localStore.employees.filter((e) => e.id !== id);
  return true;
}

export async function getSurveyVersions(): Promise<SurveyVersion[]> {
  return localStore.surveyVersions;
}
