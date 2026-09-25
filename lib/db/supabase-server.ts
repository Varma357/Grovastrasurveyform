import { supabaseAdmin } from './supabase-admin';
import { seedSupabaseDatabase } from './supabase-seed';
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

export async function ensureSupabaseReady() {
  if (!isSeeded) {
    isSeeded = true;
    seedSupabaseDatabase().catch((err) => console.warn('Background seed warning:', err));
  }
}

// ---------------------------------------------------------
// 1. SHOP OPERATIONS
// ---------------------------------------------------------
export async function createShopSupabase(newShop: Shop): Promise<Shop> {
  await ensureSupabaseReady();
  const shopDoc = {
    id: newShop.id,
    shop_code: newShop.shop_code,
    shop_name: newShop.shop_name,
    client_name: newShop.client_name,
    location: newShop.location,
    contact_number: newShop.contact_number || '',
    shop_type: newShop.shop_type || 'Saree Retail',
    staff_count: Number(newShop.staff_count) || 1,
    years_in_business: Number(newShop.years_in_business) || 1,
    online_presence: newShop.online_presence || ['WhatsApp'],
    created_at: newShop.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('shops')
    .upsert(shopDoc, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.warn('Supabase insert shop fallback:', error.message);
    return newShop;
  }

  return (data as Shop) || newShop;
}

// ---------------------------------------------------------
// 2. INTERVIEW OPERATIONS
// ---------------------------------------------------------
export async function createInterviewSupabase(newInterview: Interview): Promise<Interview> {
  await ensureSupabaseReady();
  const interviewDoc = {
    id: newInterview.id,
    interview_code: newInterview.interview_code,
    shop_id: newInterview.shop_id,
    interviewer_id: newInterview.interviewer_id || 'emp-int-01',
    started_at: newInterview.started_at || new Date().toISOString(),
    completed_at: newInterview.completed_at || null,
    duration_minutes: newInterview.duration_minutes || 15,
    main_completed: !!newInterview.main_completed,
    optional_completed: !!newInterview.optional_completed,
    optional_declined: !!newInterview.optional_declined,
    further_questions_allowed: !!newInterview.further_questions_allowed,
    quick_followup: !!newInterview.quick_followup,
    status: newInterview.status || 'draft',
    overall_score: newInterview.overall_score || 0,
    verdict: newInterview.verdict || 'Moderate Opportunity',
    is_walkin: newInterview.is_walkin !== false,
    photo_url: newInterview.photo_url || null,
    created_at: newInterview.created_at || new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('interviews')
    .upsert(interviewDoc, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.warn('Supabase insert interview fallback:', error.message);
    return newInterview;
  }

  return (data as Interview) || newInterview;
}

// ---------------------------------------------------------
// 3. RESPONSES OPERATIONS
// ---------------------------------------------------------
export async function saveResponsesSupabase(rows: SurveyResponse[]): Promise<boolean> {
  await ensureSupabaseReady();
  if (!rows || rows.length === 0) return true;

  const responseDocs = rows.map((r) => ({
    id: r.id || crypto.randomUUID(),
    interview_id: r.interview_id,
    question_id: r.question_id,
    selected_option_id: r.selected_option_id || null,
    answer_text: r.answer_text || null,
    score: r.score ?? null,
    created_at: r.created_at || new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin.from('responses').upsert(responseDocs, { onConflict: 'id' });
  if (error) console.warn('Supabase save responses warning:', error.message);
  return !error;
}

// ---------------------------------------------------------
// 4. CATEGORY SCORES OPERATIONS
// ---------------------------------------------------------
export async function saveCategoryScoresSupabase(rows: CategoryScore[]): Promise<boolean> {
  await ensureSupabaseReady();
  if (!rows || rows.length === 0) return true;

  const scoreDocs = rows.map((s) => ({
    id: s.id || crypto.randomUUID(),
    interview_id: s.interview_id,
    category_id: s.category_id,
    total_score: Number(s.total_score || 0),
    maximum_score: Number(s.maximum_score || 6),
    percentage: Number(s.percentage || 0),
    status: s.status || 'Moderate Opportunity',
    created_at: s.created_at || new Date().toISOString(),
  }));

  const { error } = await supabaseAdmin.from('category_scores').upsert(scoreDocs, { onConflict: 'id' });
  if (error) console.warn('Supabase save category scores warning:', error.message);
  return !error;
}

// ---------------------------------------------------------
// 5. PURCHASE INTENT OPERATIONS
// ---------------------------------------------------------
export async function savePurchaseIntentSupabase(intent: PurchaseIntent): Promise<PurchaseIntent> {
  await ensureSupabaseReady();
  const intentDoc = {
    id: intent.id || crypto.randomUUID(),
    interview_id: intent.interview_id,
    interest_level: intent.interest_level || 'Yes, definitely interested',
    readiness_level: intent.readiness_level || 'Yes, ready to start',
    price_range: intent.price_range || '₹2,000–₹5,000/month',
    created_at: intent.created_at || new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('purchase_intent')
    .upsert(intentDoc, { onConflict: 'id' })
    .select()
    .single();

  if (error) console.warn('Supabase save purchase intent warning:', error.message);
  return (data as PurchaseIntent) || intent;
}

// ---------------------------------------------------------
// 6. SHOP PHOTO OPERATIONS (INCLUDING STORAGE UPLOAD)
// ---------------------------------------------------------
export async function saveShopPhotoSupabase(photo: ShopPhoto): Promise<ShopPhoto> {
  await ensureSupabaseReady();

  let publicUrl = photo.photo_url;
  let storagePath = photo.storage_path || `photos/${photo.shop_id}_${photo.interview_id}.jpg`;

  // Upload Base64 image to Supabase Storage if data URL is provided
  if (photo.photo_url && photo.photo_url.startsWith('data:image/')) {
    try {
      const base64Data = photo.photo_url.split(',')[1];
      if (base64Data) {
        const buffer = Buffer.from(base64Data, 'base64');
        const fileExt = photo.photo_url.includes('image/png') ? 'png' : 'jpg';
        storagePath = `storefronts/${photo.shop_id}_${photo.interview_id}.${fileExt}`;

        const { error: uploadErr } = await supabaseAdmin.storage
          .from('shop-photos')
          .upload(storagePath, buffer, {
            contentType: `image/${fileExt}`,
            upsert: true,
          });

        if (!uploadErr) {
          const { data: urlData } = supabaseAdmin.storage.from('shop-photos').getPublicUrl(storagePath);
          if (urlData?.publicUrl) publicUrl = urlData.publicUrl;
        } else {
          console.warn('Supabase storage photo upload warning:', uploadErr.message);
        }
      }
    } catch (e) {
      console.warn('Base64 photo upload conversion error:', e);
    }
  }

  const photoDoc = {
    id: photo.id || crypto.randomUUID(),
    shop_id: photo.shop_id,
    interview_id: photo.interview_id,
    storage_path: storagePath,
    photo_url: publicUrl,
    captured_at: photo.captured_at || new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('shop_photos')
    .upsert(photoDoc, { onConflict: 'id' })
    .select()
    .single();

  if (error) console.warn('Supabase save photo record warning:', error.message);
  return (data as ShopPhoto) || photoDoc;
}

// ---------------------------------------------------------
// 7. FINALIZE INTERVIEW
// ---------------------------------------------------------
export async function finalizeInterviewSupabase(interviewId: string, updateData: any): Promise<boolean> {
  await ensureSupabaseReady();
  const { error } = await supabaseAdmin
    .from('interviews')
    .update({
      completed_at: new Date().toISOString(),
      status: 'completed',
      ...updateData,
    })
    .eq('id', interviewId);

  if (error) console.warn('Supabase finalize interview warning:', error.message);
  return !error;
}

// ---------------------------------------------------------
// 8. QUERY HELPERS
// ---------------------------------------------------------
export async function getCategoriesSupabase(): Promise<Category[]> {
  await ensureSupabaseReady();
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error || !data) return [];
  return data as Category[];
}

export async function getQuestionsSupabase(): Promise<Question[]> {
  await ensureSupabaseReady();
  const { data: qData, error: qErr } = await supabaseAdmin
    .from('questions')
    .select('*')
    .order('display_order', { ascending: true });

  const { data: optData } = await supabaseAdmin.from('question_options').select('*');

  if (qErr || !qData) return [];

  const optMap = new Map<string, any[]>();
  (optData || []).forEach((opt: any) => {
    if (!optMap.has(opt.question_id)) optMap.set(opt.question_id, []);
    optMap.get(opt.question_id)!.push(opt);
  });

  return qData.map((q: any) => ({
    ...q,
    options: optMap.get(q.id) || [],
  })) as Question[];
}

export async function getFeaturesSupabase(): Promise<Feature[]> {
  await ensureSupabaseReady();
  const { data, error } = await supabaseAdmin.from('features').select('*');
  if (error || !data) return [];
  return data as Feature[];
}

export async function getAllShopsSupabase(): Promise<Shop[]> {
  await ensureSupabaseReady();
  const { data, error } = await supabaseAdmin.from('shops').select('*').order('created_at', { ascending: false });
  if (error || !data) return [];
  return data as Shop[];
}

export async function getAllInterviewsSupabase(): Promise<Interview[]> {
  await ensureSupabaseReady();
  const { data: invs, error: invErr } = await supabaseAdmin
    .from('interviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (invErr || !invs || invs.length === 0) return [];

  const [shopsRes, intRes, photosRes, scoresRes, intentsRes] = await Promise.all([
    supabaseAdmin.from('shops').select('*'),
    supabaseAdmin.from('interviewers').select('*'),
    supabaseAdmin.from('shop_photos').select('*'),
    supabaseAdmin.from('category_scores').select('*'),
    supabaseAdmin.from('purchase_intent').select('*'),
  ]);

  const shopMap = new Map((shopsRes.data || []).map((s: any) => [s.id, s]));
  const intMap = new Map((intRes.data || []).map((i: any) => [i.id, i]));
  const photoMap = new Map((photosRes.data || []).map((p: any) => [p.interview_id, p]));
  const intentMap = new Map((intentsRes.data || []).map((pi: any) => [pi.interview_id, pi]));

  return invs.map((inv: any) => {
    const invScores = (scoresRes.data || []).filter((sc: any) => sc.interview_id === inv.id);
    const photoObj = photoMap.get(inv.id);

    return {
      ...inv,
      shop: shopMap.get(inv.shop_id),
      interviewer: intMap.get(inv.interviewer_id) || { id: 'default', name: 'Navadeep' },
      categoryScores: invScores,
      purchaseIntent: intentMap.get(inv.id),
      photo_url: inv.photo_url || photoObj?.photo_url || null,
      photo: photoObj,
    };
  }) as Interview[];
}

export async function getInterviewByIdSupabase(interviewId: string) {
  await ensureSupabaseReady();

  // 1. Fetch single matching interview directly from PostgreSQL
  const { data: invDocs } = await supabaseAdmin
    .from('interviews')
    .select('*')
    .or(`id.eq.${interviewId},interview_code.eq.${interviewId},shop_id.eq.${interviewId}`)
    .limit(1);

  let inv = invDocs && invDocs.length > 0 ? invDocs[0] : null;

  if (!inv) {
    // Fallback: check if matching by shop_code or shop ID
    const { data: shopMatch } = await supabaseAdmin
      .from('shops')
      .select('id')
      .or(`id.eq.${interviewId},shop_code.eq.${interviewId}`)
      .limit(1);

    if (shopMatch && shopMatch.length > 0) {
      const { data: invByShop } = await supabaseAdmin
        .from('interviews')
        .select('*')
        .eq('shop_id', shopMatch[0].id)
        .order('created_at', { ascending: false })
        .limit(1);
      if (invByShop && invByShop.length > 0) inv = invByShop[0];
    }
  }

  if (!inv) return null;

  // 2. Fetch associated relations in parallel
  const [shopRes, intRes, respRes, scoreRes, intentRes, photoRes] = await Promise.all([
    supabaseAdmin.from('shops').select('*').eq('id', inv.shop_id).maybeSingle(),
    supabaseAdmin.from('interviewers').select('*').eq('id', inv.interviewer_id || 'emp-int-01').maybeSingle(),
    supabaseAdmin.from('responses').select('*').eq('interview_id', inv.id),
    supabaseAdmin.from('category_scores').select('*').eq('interview_id', inv.id),
    supabaseAdmin.from('purchase_intent').select('*').eq('interview_id', inv.id),
    supabaseAdmin.from('shop_photos').select('*').eq('interview_id', inv.id),
  ]);

  const shop = shopRes.data || { id: inv.shop_id, shop_name: 'Saree Shop', location: 'AP' };
  const interviewer = intRes.data || { id: inv.interviewer_id || 'emp-int-01', name: 'Navadeep' };
  const responses = respRes.data || [];
  const categoryScores = scoreRes.data || [];
  const purchaseIntent = intentRes.data && intentRes.data.length > 0 ? intentRes.data[0] : null;
  const photo = photoRes.data && photoRes.data.length > 0 ? photoRes.data[0] : (inv.photo_url ? { photo_url: inv.photo_url } : null);

  const fullInterview = {
    ...inv,
    shop,
    interviewer,
    categoryScores,
    purchaseIntent,
    photo_url: inv.photo_url || photo?.photo_url || null,
    photo,
  };

  return {
    interview: fullInterview,
    shop,
    interviewer,
    responses,
    categoryScores,
    purchaseIntent,
    photo,
  };
}

export async function deleteInterviewSupabase(interviewId: string): Promise<boolean> {
  await ensureSupabaseReady();
  const { error } = await supabaseAdmin.from('interviews').delete().eq('id', interviewId);
  return !error;
}
