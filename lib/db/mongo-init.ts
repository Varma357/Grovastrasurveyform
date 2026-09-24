import { connectToDatabase } from './mongodb';
import {
  CategoryModel,
  FeatureModel,
  QuestionModel,
  SurveyVersionModel,
  InterviewerModel,
  EmployeeModel,
  AdminSettingModel,
} from './models';
import { SEED_CATEGORIES, SEED_FEATURES, SEED_QUESTIONS } from '../seed/data';

export async function seedMongoDatabase() {
  console.log('⚡ Initializing MongoDB Atlas Production database seeding...');

  try {
    await connectToDatabase();

    // 1. Seed Survey Version
    const versionCount = await SurveyVersionModel.countDocuments({ version_number: 'v1.0' });
    if (versionCount === 0) {
      await SurveyVersionModel.create({
        id: 'ver-1.0',
        version_name: 'Grovastra Standard v1.0',
        version_number: 'v1.0',
        active: true,
        created_at: new Date().toISOString(),
      });
      console.log('   ✅ Survey Version v1.0 seeded');
    }

    // 2. Seed Interviewers (Drop all non-authorized profiles)
    await InterviewerModel.deleteMany({
      email: { $nin: ['rajesh@groviews.com', 'navadeep@groviews.com'] }
    });

    const defaultInterviewers = [
      { id: 'emp-int-01', name: 'Navadeep', email: 'navadeep@groviews.com', mobile: '9704917189', active: true, created_at: new Date().toISOString() },
    ];
    const intOps: any[] = defaultInterviewers.map((int) => ({
      updateOne: {
        filter: { email: int.email },
        update: { $set: int },
        upsert: true,
      },
    }));
    await InterviewerModel.bulkWrite(intOps);

    // 3. Seed Default Employees
    const defaultEmployees = [
      {
        id: 'emp-admin-01',
        name: 'Rajesh',
        email: 'rajesh@groviews.com',
        mobile: '7901003210',
        role: 'ADMIN' as const,
        password: '7901003210',
        active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 'emp-int-01',
        name: 'Navadeep',
        email: 'navadeep@groviews.com',
        mobile: '9704917189',
        role: 'INTERVIEWER' as const,
        password: '9704917189',
        active: true,
        created_at: new Date().toISOString(),
      },
    ];
    // Remove old demo accounts from DB
    await EmployeeModel.deleteMany({
      email: { $nin: ['rajesh@groviews.com', 'navadeep@groviews.com'] }
    });

    const empOps: any[] = defaultEmployees.map((emp) => ({
      updateOne: {
        filter: { email: emp.email },
        update: { $set: emp },
        upsert: true,
      },
    }));
    await EmployeeModel.bulkWrite(empOps);

    // 4. Seed Admin Settings
    await AdminSettingModel.updateOne(
      { key: 'category_thresholds' },
      { $setOnInsert: { key: 'category_thresholds', value: { moderate: 34, significant: 67 }, updated_at: new Date().toISOString() } },
      { upsert: true }
    );
    await AdminSettingModel.updateOne(
      { key: 'price_ranges' },
      {
        $setOnInsert: {
          key: 'price_ranges',
          value: [
            '₹0 — only if free',
            'Below ₹500/month',
            '₹500–₹1,000/month',
            '₹1,000–₹2,000/month',
            '₹2,000–₹5,000/month',
            'Above ₹5,000/month',
            'Cannot decide yet',
          ],
          updated_at: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    // 5. Seed Categories
    const catOps: any[] = SEED_CATEGORIES.map((cat) => ({
      updateOne: {
        filter: { category_code: cat.category_code },
        update: {
          $set: {
            id: `cat-${cat.category_code.toLowerCase()}`,
            category_code: cat.category_code,
            category_name: cat.category_name,
            description: cat.description,
            active: true,
            display_order: cat.display_order,
          },
        },
        upsert: true,
      },
    }));
    if (catOps.length > 0) await CategoryModel.bulkWrite(catOps);

    // 6. Seed Features
    const featOps: any[] = SEED_FEATURES.map((feat) => ({
      updateOne: {
        filter: { feature_code: feat.feature_code },
        update: {
          $set: {
            id: `feat-${feat.feature_code.toLowerCase()}`,
            feature_code: feat.feature_code,
            feature_name: feat.feature_name,
            category_id: `cat-${feat.category_code.toLowerCase()}`,
            description: feat.description,
            active: true,
            category_code: feat.category_code,
          },
        },
        upsert: true,
      },
    }));
    if (featOps.length > 0) await FeatureModel.bulkWrite(featOps);

    // 7. Seed Questions & Options
    const qOps: any[] = SEED_QUESTIONS.map((q) => {
      const qId = `q-${q.question_code.toLowerCase()}`;
      const catId = `cat-${q.category_code.toLowerCase()}`;
      const featId = q.feature_code ? `feat-${q.feature_code.toLowerCase()}` : undefined;

      const formattedOptions = q.options.map((opt, oIdx) => ({
        id: `opt-${qId}-${oIdx}`,
        question_id: qId,
        option_label: opt.option_label,
        score: opt.score,
        display_order: opt.display_order,
      }));

      return {
        updateOne: {
          filter: { question_code: q.question_code },
          update: {
            $set: {
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
              options: formattedOptions,
              category_code: q.category_code,
              feature_code: q.feature_code,
            },
          },
          upsert: true,
        },
      };
    });
    if (qOps.length > 0) await QuestionModel.bulkWrite(qOps);

    console.log('✅ MongoDB Atlas Seed Completed Successfully!');
    return true;
  } catch (error) {
    console.error('❌ MongoDB Atlas Seeding Error:', error);
    return false;
  }
}
