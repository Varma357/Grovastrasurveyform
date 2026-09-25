import { supabaseAdmin } from './supabase-admin';
import { SEED_CATEGORIES, SEED_FEATURES, SEED_QUESTIONS } from '../seed/data';

export async function seedSupabaseDatabase() {
  try {
    console.log('🌱 Seeding Supabase PostgreSQL database...');

    // 1. Seed Categories
    const categoryDocs = SEED_CATEGORIES.map((c) => ({
      id: `cat-${c.category_code.toLowerCase()}`,
      category_code: c.category_code,
      category_name: c.category_name,
      description: c.description,
      display_order: c.display_order,
      active: true,
    }));

    await supabaseAdmin.from('categories').upsert(categoryDocs, { onConflict: 'id' });

    // 2. Seed Features
    const featureDocs = SEED_FEATURES.map((f) => ({
      id: `feat-${f.feature_code.toLowerCase()}`,
      feature_code: f.feature_code,
      feature_name: f.feature_name,
      category_id: `cat-${f.category_code.toLowerCase()}`,
      category_code: f.category_code,
      description: f.description,
      active: true,
    }));

    await supabaseAdmin.from('features').upsert(featureDocs, { onConflict: 'id' });

    // 3. Seed Questions & Options
    const questionDocs: any[] = [];
    const optionDocs: any[] = [];

    SEED_QUESTIONS.forEach((q) => {
      const qId = `q-${q.question_code.toLowerCase()}`;
      const catId = `cat-${q.category_code.toLowerCase()}`;
      const featId = q.feature_code ? `feat-${q.feature_code.toLowerCase()}` : null;

      questionDocs.push({
        id: qId,
        question_code: q.question_code,
        category_id: catId,
        category_code: q.category_code,
        question_type: q.question_type,
        question_text: q.question_text,
        display_order: q.display_order,
        priority: q.priority,
        active: true,
        feature_id: featId,
        feature_code: q.feature_code || null,
        trigger_rule: q.trigger_rule || null,
      });

      q.options.forEach((opt, oIdx) => {
        optionDocs.push({
          id: `opt-${qId}-${oIdx}`,
          question_id: qId,
          option_label: opt.option_label,
          score: opt.score,
          display_order: opt.display_order,
        });
      });
    });

    await supabaseAdmin.from('questions').upsert(questionDocs, { onConflict: 'id' });
    await supabaseAdmin.from('question_options').upsert(optionDocs, { onConflict: 'id' });

    // 4. Seed Survey Version
    await supabaseAdmin.from('survey_versions').upsert([
      {
        id: 'ver-1.0',
        version_name: 'Grovastra Standard v1.0',
        version_number: 'v1.0',
        active: true,
      },
    ], { onConflict: 'id' });

    // 5. Seed Interviewers
    await supabaseAdmin.from('interviewers').upsert([
      {
        id: 'emp-int-01',
        name: 'Navadeep',
        email: 'navadeep@groviews.com',
        mobile: '9704917189',
        active: true,
      },
      {
        id: 'emp-admin-01',
        name: 'Rajesh',
        email: 'rajesh@groviews.com',
        mobile: '7901003210',
        active: true,
      },
    ], { onConflict: 'id' });

    console.log('✅ Supabase PostgreSQL seed completed successfully!');
    return true;
  } catch (err) {
    console.warn('Supabase seed warning:', err);
    return false;
  }
}
