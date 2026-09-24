import { connectToDatabase } from './mongodb';
import { seedMongoDatabase } from './mongo-init';
import {
  ShopModel,
  InterviewModel,
  SurveyResponseModel,
  CategoryScoreModel,
  PurchaseIntentModel,
  ShopPhotoModel,
  CategoryModel,
  FeatureModel,
  QuestionModel,
  EmployeeModel,
  InterviewerModel,
  AdminSettingModel,
  SurveyVersionModel,
} from './models';
import {
  Shop,
  Interview,
  Category,
  Feature,
  Question,
  SurveyResponse,
  CategoryScore,
  PurchaseIntent,
  ShopPhoto,
  Interviewer,
} from '../types';

let isSeeded = false;

export async function ensureMongoReady() {
  await connectToDatabase();
  if (!isSeeded) {
    isSeeded = true;
    seedMongoDatabase().catch((err) => console.warn('Background seed warning:', err));
  }
}

export async function createShopMongo(newShop: Shop): Promise<Shop> {
  await ensureMongoReady();
  const createdDoc = await ShopModel.create(newShop);
  const docObj = createdDoc.toObject();
  return {
    id: docObj.id,
    shop_code: docObj.shop_code,
    shop_name: docObj.shop_name,
    client_name: docObj.client_name,
    location: docObj.location,
    contact_number: docObj.contact_number,
    shop_type: docObj.shop_type,
    staff_count: docObj.staff_count,
    years_in_business: docObj.years_in_business,
    online_presence: docObj.online_presence,
    created_at: docObj.created_at,
    updated_at: docObj.updated_at,
  };
}

export async function createInterviewMongo(newInterview: Interview): Promise<Interview> {
  await ensureMongoReady();
  const createdDoc = await InterviewModel.create(newInterview);
  const docObj = createdDoc.toObject();
  return {
    id: docObj.id,
    interview_code: docObj.interview_code,
    shop_id: docObj.shop_id,
    interviewer_id: docObj.interviewer_id,
    started_at: docObj.started_at,
    main_completed: docObj.main_completed,
    optional_completed: docObj.optional_completed,
    optional_declined: docObj.optional_declined,
    quick_followup: docObj.quick_followup,
    status: docObj.status,
    created_at: docObj.created_at,
  };
}

export async function saveResponsesMongo(rows: SurveyResponse[]): Promise<boolean> {
  await ensureMongoReady();
  await SurveyResponseModel.insertMany(rows);
  return true;
}

export async function saveCategoryScoresMongo(rows: CategoryScore[]): Promise<boolean> {
  await ensureMongoReady();
  await CategoryScoreModel.insertMany(rows);
  return true;
}

export async function savePurchaseIntentMongo(intent: PurchaseIntent): Promise<PurchaseIntent> {
  await ensureMongoReady();
  await PurchaseIntentModel.create(intent);
  return intent;
}

export async function saveShopPhotoMongo(photo: ShopPhoto): Promise<ShopPhoto> {
  await ensureMongoReady();
  await ShopPhotoModel.create(photo);
  return photo;
}

export async function finalizeInterviewMongo(interviewId: string, updateData: any): Promise<boolean> {
  await ensureMongoReady();
  await InterviewModel.updateOne({ id: interviewId }, { $set: updateData });
  return true;
}

export async function getCategoriesMongo(): Promise<Category[]> {
  await ensureMongoReady();
  const docs = await CategoryModel.find({}).sort({ display_order: 1 }).lean();
  return docs.map((d: any) => ({
    id: d.id,
    category_code: d.category_code,
    category_name: d.category_name,
    description: d.description,
    active: d.active,
    display_order: d.display_order,
  }));
}

export async function getQuestionsMongo(): Promise<Question[]> {
  await ensureMongoReady();
  const docs = await QuestionModel.find({}).sort({ display_order: 1 }).lean();
  return docs.map((q: any) => ({
    id: q.id,
    question_code: q.question_code,
    category_id: q.category_id,
    question_type: q.question_type,
    question_text: q.question_text,
    display_order: q.display_order,
    priority: q.priority,
    active: q.active,
    feature_id: q.feature_id,
    trigger_rule: q.trigger_rule,
    options: q.options,
    category_code: q.category_code,
    feature_code: q.feature_code,
  }));
}

export async function getFeaturesMongo(): Promise<Feature[]> {
  await ensureMongoReady();
  const docs = await FeatureModel.find({}).lean();
  return docs.map((f: any) => ({
    id: f.id,
    feature_code: f.feature_code,
    feature_name: f.feature_name,
    category_id: f.category_id,
    description: f.description,
    active: f.active,
    category_code: f.category_code,
  }));
}

export async function getAllShopsMongo(): Promise<Shop[]> {
  await ensureMongoReady();
  const docs = await ShopModel.find({}).sort({ created_at: -1 }).lean();
  return docs.map((s: any) => ({
    id: s.id,
    shop_code: s.shop_code,
    shop_name: s.shop_name,
    client_name: s.client_name,
    location: s.location,
    contact_number: s.contact_number,
    shop_type: s.shop_type,
    staff_count: s.staff_count,
    years_in_business: s.years_in_business,
    online_presence: s.online_presence,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));
}

export async function getAllInterviewsMongo(): Promise<Interview[]> {
  await ensureMongoReady();
  const docs = await InterviewModel.find({}).sort({ created_at: -1 }).lean();
  const shops = await getAllShopsMongo();
  const interviewers = await InterviewerModel.find({}).lean();

  const shopMap = new Map(shops.map((s) => [s.id, s]));
  const intMap = new Map((interviewers || []).map((i: any) => [i.id, i]));

  return docs.map((inv: any) => ({
    id: inv.id,
    interview_code: inv.interview_code,
    shop_id: inv.shop_id,
    interviewer_id: inv.interviewer_id,
    survey_version_id: inv.survey_version_id,
    started_at: inv.started_at,
    completed_at: inv.completed_at,
    duration_minutes: inv.duration_minutes,
    main_completed: inv.main_completed,
    optional_completed: inv.optional_completed,
    optional_declined: inv.optional_declined,
    quick_followup: inv.quick_followup,
    status: inv.status,
    overall_score: inv.overall_score,
    verdict: inv.verdict,
    is_walkin: inv.is_walkin,
    created_at: inv.created_at,
    shop: shopMap.get(inv.shop_id),
    interviewer: intMap.get(inv.interviewer_id) as Interviewer | undefined,
  }));
}

export async function getInterviewByIdMongo(interviewId: string) {
  const interviews = await getAllInterviewsMongo();
  const inv = interviews.find((i) => i.id === interviewId || i.interview_code === interviewId);
  if (!inv) return null;

  const responsesDocs = await SurveyResponseModel.find({ interview_id: inv.id }).lean();
  const responses: SurveyResponse[] = (responsesDocs || []).map((d: any) => ({
    id: d.id,
    interview_id: d.interview_id,
    question_id: d.question_id,
    selected_option_id: d.selected_option_id,
    answer_text: d.answer_text,
    score: d.score,
    created_at: d.created_at,
  }));

  const categoryScoresDocs = await CategoryScoreModel.find({ interview_id: inv.id }).lean();
  const categoryScores: CategoryScore[] = (categoryScoresDocs || []).map((d: any) => ({
    id: d.id,
    interview_id: d.interview_id,
    category_id: d.category_id,
    total_score: d.total_score,
    maximum_score: d.maximum_score,
    percentage: d.percentage,
    status: d.status,
    created_at: d.created_at,
  }));

  const intentDoc = await PurchaseIntentModel.findOne({ interview_id: inv.id }).lean();
  const purchaseIntent: PurchaseIntent | undefined = intentDoc
    ? {
        id: intentDoc.id,
        interview_id: intentDoc.interview_id,
        interest_level: intentDoc.interest_level,
        readiness_level: intentDoc.readiness_level,
        price_range: intentDoc.price_range,
        created_at: intentDoc.created_at,
      }
    : undefined;

  const photoDoc = await ShopPhotoModel.findOne({ interview_id: inv.id }).lean();
  const photo: ShopPhoto | undefined = photoDoc
    ? {
        id: photoDoc.id,
        shop_id: photoDoc.shop_id,
        interview_id: photoDoc.interview_id,
        storage_path: photoDoc.storage_path,
        photo_url: photoDoc.photo_url,
        captured_at: photoDoc.captured_at,
      }
    : undefined;

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

export async function saveQuestionMongo(question: Question): Promise<Question> {
  await ensureMongoReady();
  await QuestionModel.updateOne(
    { id: question.id },
    { $set: question },
    { upsert: true }
  );
  return question;
}

export async function getAllEmployeesMongo(): Promise<any[]> {
  await ensureMongoReady();
  const docs = await EmployeeModel.find({}).lean();
  return docs.map((e: any) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    mobile: e.mobile,
    role: e.role,
    password: e.password,
    active: e.active,
    created_at: e.created_at,
  }));
}

export async function addEmployeeMongo(emp: any): Promise<any> {
  await ensureMongoReady();
  const doc = await EmployeeModel.create(emp);
  const docObj = doc.toObject();
  return {
    id: docObj.id,
    name: docObj.name,
    email: docObj.email,
    mobile: docObj.mobile,
    role: docObj.role,
    password: docObj.password,
    active: docObj.active,
    created_at: docObj.created_at,
  };
}

export async function deleteEmployeeMongo(id: string): Promise<boolean> {
  await ensureMongoReady();
  await EmployeeModel.deleteOne({ id });
  return true;
}

export async function getAdminSettingMongo(key: string): Promise<any> {
  await ensureMongoReady();
  const doc = await AdminSettingModel.findOne({ key }).lean();
  return doc ? doc.value : null;
}

export async function saveAdminSettingMongo(key: string, value: any): Promise<boolean> {
  await ensureMongoReady();
  await AdminSettingModel.updateOne(
    { key },
    { $set: { key, value, updated_at: new Date().toISOString() } },
    { upsert: true }
  );
  return true;
}

export async function getSurveyVersionsMongo(): Promise<any[]> {
  await ensureMongoReady();
  const docs = await SurveyVersionModel.find({}).lean();
  return docs.map((v: any) => ({
    id: v.id,
    version_name: v.version_name,
    version_number: v.version_number,
    active: v.active,
    created_at: v.created_at,
  }));
}

export async function getAllResponsesMongo(): Promise<SurveyResponse[]> {
  await ensureMongoReady();
  const docs = await SurveyResponseModel.find({}).lean();
  return docs.map((d: any) => ({
    id: d.id,
    interview_id: d.interview_id,
    question_id: d.question_id,
    selected_option_id: d.selected_option_id,
    answer_text: d.answer_text,
    score: d.score,
    created_at: d.created_at,
  }));
}
