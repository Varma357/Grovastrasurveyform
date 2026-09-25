import { NextResponse } from 'next/server';
import {
  getAllInterviewsSupabase,
  createShopSupabase,
  createInterviewSupabase,
  saveResponsesSupabase,
  saveCategoryScoresSupabase,
  savePurchaseIntentSupabase,
  saveShopPhotoSupabase,
} from '@/lib/db/supabase-server';

export async function GET(request: Request) {
  try {
    const interviews = await getAllInterviewsSupabase();
    return NextResponse.json({ success: true, interviews });
  } catch (error: any) {
    console.error('Error fetching surveys from Supabase:', error);
    return NextResponse.json({ error: 'Failed to fetch survey data from Supabase' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      shop,
      interview,
      responses,
      categoryScores,
      purchaseIntent,
      photoUrl,
    } = body;

    if (!shop || !interview) {
      return NextResponse.json({ error: 'Missing shop or interview payload' }, { status: 400 });
    }

    // 1. Create or update Shop in Supabase PostgreSQL
    const shopCode = shop.shop_code || `SHOP-${Math.floor(100000 + Math.random() * 900000)}`;
    const shopData = {
      id: shop.id || crypto.randomUUID(),
      shop_code: shopCode,
      shop_name: shop.shop_name || 'Unnamed Saree Shop',
      client_name: shop.client_name || 'Valued Client',
      location: shop.location || 'Andhra Pradesh',
      contact_number: shop.contact_number || '',
      shop_type: shop.shop_type || 'Saree Retail',
      staff_count: Number(shop.staff_count) || 3,
      years_in_business: Number(shop.years_in_business) || 5,
      online_presence: shop.online_presence || ['WhatsApp'],
      created_at: shop.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const savedShop = await createShopSupabase(shopData);

    // 2. Create/Update Interview document in Supabase PostgreSQL
    const interviewCode = interview.interview_code || `INT-${Math.floor(100000 + Math.random() * 900000)}`;
    const interviewData = {
      id: interview.id || crypto.randomUUID(),
      interview_code: interviewCode,
      shop_id: savedShop.id,
      interviewer_id: interview.interviewer_id || 'emp-int-01',
      started_at: interview.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_minutes: Number(interview.duration_minutes) || 15,
      main_completed: true,
      optional_completed: !!interview.optional_completed,
      optional_declined: !!interview.optional_declined,
      further_questions_allowed: interview.further_questions_allowed !== undefined ? !!interview.further_questions_allowed : !!interview.optional_completed,
      quick_followup: !!interview.quick_followup,
      status: 'completed' as const,
      overall_score: Number(interview.overall_score) || 50,
      verdict: interview.verdict || 'Moderate Opportunity',
      is_walkin: interview.is_walkin !== false,
      photo_url: photoUrl || null,
      created_at: new Date().toISOString(),
    };

    const savedInterview = await createInterviewSupabase(interviewData);

    // 3. Save Survey Responses in Supabase PostgreSQL
    if (Array.isArray(responses) && responses.length > 0) {
      await saveResponsesSupabase(responses.map((r: any) => ({
        id: r.id || crypto.randomUUID(),
        interview_id: savedInterview.id,
        question_id: r.question_id,
        selected_option_id: r.selected_option_id || null,
        answer_text: r.answer_text || null,
        score: r.score ?? null,
        created_at: new Date().toISOString(),
      })));
    }

    // 4. Save Category Scores in Supabase PostgreSQL
    if (Array.isArray(categoryScores) && categoryScores.length > 0) {
      await saveCategoryScoresSupabase(categoryScores.map((cs: any) => ({
        id: cs.id || crypto.randomUUID(),
        interview_id: savedInterview.id,
        category_id: cs.category_id || cs.categoryId || '',
        category_code: (cs.category_code || cs.categoryCode || cs.category_id || '').replace(/^cat-/, '').toUpperCase(),
        total_score: Number(cs.total_score ?? cs.totalScore ?? 0),
        maximum_score: Number(cs.maximum_score ?? cs.maximumScore ?? 6),
        percentage: Number(cs.percentage ?? 0),
        status: cs.status || 'Moderate Opportunity',
        created_at: new Date().toISOString(),
      })));
    }

    // 5. Save Purchase Intent in Supabase PostgreSQL
    if (purchaseIntent) {
      await savePurchaseIntentSupabase({
        id: crypto.randomUUID(),
        interview_id: savedInterview.id,
        interest_level: purchaseIntent.interest_level || 'Yes, definitely interested',
        readiness_level: purchaseIntent.readiness_level || 'Yes, ready to start',
        price_range: purchaseIntent.price_range || '₹2,000–₹5,000/month',
        created_at: new Date().toISOString(),
      });
    }

    // 6. Save Shop Photo in Supabase Storage & Database
    let savedPhotoUrl = photoUrl;
    if (photoUrl) {
      const savedPhotoRecord = await saveShopPhotoSupabase({
        id: crypto.randomUUID(),
        shop_id: savedShop.id,
        interview_id: savedInterview.id,
        storage_path: `storefronts/${savedShop.id}_${savedInterview.id}.jpg`,
        photo_url: photoUrl,
        captured_at: new Date().toISOString(),
      });
      if (savedPhotoRecord?.photo_url) savedPhotoUrl = savedPhotoRecord.photo_url;
    }

    console.log(`✅ Complete Survey Saved to Supabase: Interview ID ${savedInterview.id}`);

    return NextResponse.json({
      success: true,
      interview_id: savedInterview.id,
      interview_code: savedInterview.interview_code,
      photo_url: savedPhotoUrl,
      message: 'Survey successfully saved to Supabase PostgreSQL',
    });
  } catch (error: any) {
    console.error('❌ Failed to save survey to Supabase:', error);
    return NextResponse.json(
      { error: 'Failed to save survey to Supabase: ' + error.message },
      { status: 500 }
    );
  }
}
