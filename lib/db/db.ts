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

// Helper for dynamic server-side Mongoose & MongoDB model loading
async function getMongoServerModule() {
  if (typeof window !== 'undefined') return null;
  try {
    const mod = await import(/* webpackIgnore: true */ './mongo-server');
    return mod;
  } catch (err) {
    try {
      // Fallback require for Node runtime
      const req = eval('require');
      return req('./mongo-server');
    } catch (e) {
      return null;
    }
  }
}

// In-Memory Local Sync State for browser client resilience
class LocalStore {
  shops: Shop[] = [];
  interviewers: Interviewer[] = [
    { id: 'int-001', name: 'Field Lead Interviewer', email: 'interviewer@grovastra.com', mobile: '9123456789', active: true, created_at: new Date().toISOString() },
    { id: 'int-002', name: 'Product Researcher', email: 'researcher@grovastra.com', mobile: '9898989898', active: true, created_at: new Date().toISOString() },
  ];
  employees: EmployeeUser[] = [
    {
      id: 'emp-001',
      name: 'Sai Varma',
      email: 'admin@grovastra.com',
      mobile: '9876543210',
      role: 'ADMIN',
      password: 'admin',
      active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'emp-002',
      name: 'Ramesh Kumar',
      email: 'interviewer@grovastra.com',
      mobile: '9123456789',
      role: 'INTERVIEWER',
      password: '123',
      active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'emp-003',
      name: 'Priya Sharma',
      email: 'priya@grovastra.com',
      mobile: '9898989898',
      role: 'INTERVIEWER',
      password: '123',
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
// DATA ACCESS LAYER (MONGODB PRODUCTION WITH LOCAL FALLBACK)
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
    const srv = await getMongoServerModule();
    if (srv && srv.createShopMongo) {
      const shopObj = await srv.createShopMongo(newShop);
      localStore.shops.push(shopObj);
      return shopObj;
    }
  } catch (err) {
    console.warn('MongoDB insert shop fallback to local:', err);
  }

  localStore.shops.push(newShop);
  return newShop;
}

export async function createInterview(shopId: string, interviewerId?: string): Promise<Interview> {
  const interviewCode = `INT-${Math.floor(100000 + Math.random() * 900000)}`;
  const defaultIntId = localStore.interviewers[0]?.id || 'int-001';
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
    const srv = await getMongoServerModule();
    if (srv && srv.createInterviewMongo) {
      const intObj = await srv.createInterviewMongo(newInterview);
      localStore.interviews.push(intObj);
      return intObj;
    }
  } catch (err) {
    console.warn('MongoDB insert interview fallback:', err);
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
    const srv = await getMongoServerModule();
    if (srv && srv.saveResponsesMongo) {
      await srv.saveResponsesMongo(rows);
      localStore.responses.push(...rows);
      return true;
    }
  } catch (err) {
    console.warn('MongoDB save responses fallback:', err);
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
    const srv = await getMongoServerModule();
    if (srv && srv.saveCategoryScoresMongo) {
      await srv.saveCategoryScoresMongo(rows);
      localStore.categoryScores.push(...rows);
      return true;
    }
  } catch (err) {
    console.warn('MongoDB save category scores fallback:', err);
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
    const srv = await getMongoServerModule();
    if (srv && srv.savePurchaseIntentMongo) {
      await srv.savePurchaseIntentMongo(newIntent);
      localStore.purchaseIntent.push(newIntent);
      return newIntent;
    }
  } catch (err) {
    console.warn('MongoDB purchase intent fallback:', err);
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
    const srv = await getMongoServerModule();
    if (srv && srv.saveShopPhotoMongo) {
      await srv.saveShopPhotoMongo(photoRecord);
      localStore.shopPhotos.push(photoRecord);
      return photoRecord;
    }
  } catch (err) {
    console.warn('MongoDB photo record fallback:', err);
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
    const srv = await getMongoServerModule();
    if (srv && srv.finalizeInterviewMongo) {
      await srv.finalizeInterviewMongo(interviewId, updateData);
      const inv = localStore.interviews.find((i) => i.id === interviewId);
      if (inv) Object.assign(inv, updateData);
      return true;
    }
  } catch (err) {
    console.warn('MongoDB finalize interview fallback:', err);
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
    const srv = await getMongoServerModule();
    if (srv && srv.getCategoriesMongo) {
      const data = await srv.getCategoriesMongo();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.categories;
}

export async function getQuestions(): Promise<Question[]> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getQuestionsMongo) {
      const data = await srv.getQuestionsMongo();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.questions;
}

export async function getFeatures(): Promise<Feature[]> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getFeaturesMongo) {
      const data = await srv.getFeaturesMongo();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.features;
}

export async function getAllShops(): Promise<Shop[]> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getAllShopsMongo) {
      const data = await srv.getAllShopsMongo();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.shops;
}

export async function getAllInterviews(): Promise<Interview[]> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getAllInterviewsMongo) {
      const data = await srv.getAllInterviewsMongo();
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
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getInterviewByIdMongo) {
      const details = await srv.getInterviewByIdMongo(interviewId);
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

  try {
    const srv = await getMongoServerModule();
    if (srv && srv.saveQuestionMongo) {
      await srv.saveQuestionMongo(question);
    }
  } catch (e) {}

  return question;
}

export async function getAllEmployeesAsync(): Promise<EmployeeUser[]> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getAllEmployeesMongo) {
      const data = await srv.getAllEmployeesMongo();
      if (data && data.length > 0) {
        localStore.employees = data;
        if (typeof window !== 'undefined') {
          localStorage.setItem('grovastra_employees', JSON.stringify(data));
        }
        return data;
      }
    }
  } catch (e) {}
  return getAllEmployees();
}

export async function getAdminSetting(key: string): Promise<any> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getAdminSettingMongo) {
      const val = await srv.getAdminSettingMongo(key);
      if (val !== null && val !== undefined) return val;
    }
  } catch (e) {}

  if (key === 'category_thresholds') return { moderate: 34, significant: 67 };
  return null;
}

export async function saveAdminSetting(key: string, value: any): Promise<boolean> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.saveAdminSettingMongo) {
      await srv.saveAdminSettingMongo(key, value);
      return true;
    }
  } catch (e) {}
  return true;
}

export async function getSurveyVersions(): Promise<SurveyVersion[]> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getSurveyVersionsMongo) {
      const data = await srv.getSurveyVersionsMongo();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.surveyVersions;
}

export async function getAllResponses(): Promise<SurveyResponse[]> {
  try {
    const srv = await getMongoServerModule();
    if (srv && srv.getAllResponsesMongo) {
      const data = await srv.getAllResponsesMongo();
      if (data && data.length > 0) return data;
    }
  } catch (e) {}
  return localStore.responses;
}

// Employee Management & Authentication Helper Functions
export function getAllEmployees(): EmployeeUser[] {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('grovastra_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
  }
  return localStore.employees;
}

export function saveEmployees(employees: EmployeeUser[]) {
  localStore.employees = employees;
  if (typeof window !== 'undefined') {
    localStorage.setItem('grovastra_employees', JSON.stringify(employees));
  }
}

export function addEmployee(employee: Omit<EmployeeUser, 'id' | 'created_at' | 'active'>): EmployeeUser {
  const employees = getAllEmployees();
  const newEmp: EmployeeUser = {
    ...employee,
    id: `emp-${Date.now()}`,
    active: true,
    created_at: new Date().toISOString(),
  };
  employees.push(newEmp);
  saveEmployees(employees);

  getMongoServerModule().then((srv) => {
    if (srv && srv.addEmployeeMongo) {
      srv.addEmployeeMongo(newEmp).catch((e: any) => console.warn('Sync employee to MongoDB failed:', e));
    }
  });

  return newEmp;
}

export function deleteEmployee(id: string) {
  const employees = getAllEmployees().filter((e) => e.id !== id);
  saveEmployees(employees);

  getMongoServerModule().then((srv) => {
    if (srv && srv.deleteEmployeeMongo) {
      srv.deleteEmployeeMongo(id).catch((e: any) => console.warn('Delete employee from MongoDB failed:', e));
    }
  });
}

export function authenticateUser(identifier: string, pass: string): EmployeeUser | null {
  const employees = getAllEmployees();
  const cleanId = identifier.trim().toLowerCase();
  const user = employees.find(
    (e) => (e.email.toLowerCase() === cleanId || e.mobile.trim() === cleanId) && e.password === pass
  );
  return user || null;
}
