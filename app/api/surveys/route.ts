import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db/mongodb';
import {
  ShopModel,
  InterviewModel,
  SurveyResponseModel,
  CategoryScoreModel,
  PurchaseIntentModel,
  ShopPhotoModel,
  EmployeeModel,
  InterviewerModel,
} from '@/lib/db/models';

export async function GET(request: Request) {
  try {
    await connectToDatabase();

    // Query completed interviews
    const interviews = await InterviewModel.find({}).sort({ created_at: -1 }).lean();
    const shops = await ShopModel.find({}).lean();
    const photos = await ShopPhotoModel.find({}).lean();
    const scores = await CategoryScoreModel.find({}).lean();
    const intents = await PurchaseIntentModel.find({}).lean();
    const interviewers = await InterviewerModel.find({}).lean();
    const employees = await EmployeeModel.find({}).lean();

    const shopMap = new Map();
    shops.forEach((s: any) => {
      if (s.id) shopMap.set(s.id, s);
      if (s.shop_id) shopMap.set(s.shop_id, s);
    });
    const photoMap = new Map(photos.map((p: any) => [p.interview_id, p]));
    const intentMap = new Map(intents.map((pi: any) => [pi.interview_id, pi]));

    const result = interviews.map((inv: any) => {
      const invScores = scores.filter((sc: any) => sc.interview_id === inv.id);
      const photoObj = photoMap.get(inv.id);
      const shopObj = shopMap.get(inv.shop_id);
      const intentObj = intentMap.get(inv.id);

      // Resolve interviewer details
      let interviewerObj: any = interviewers.find((i: any) => i.id === inv.interviewer_id);
      if (!interviewerObj) {
        const emp = employees.find((e: any) => e.id === inv.interviewer_id);
        if (emp) {
          interviewerObj = { id: emp.id, name: emp.name, email: emp.email, active: emp.active, created_at: emp.created_at };
        }
      }

      return {
        ...inv,
        shop: shopObj,
        interviewer: interviewerObj || { id: 'default', name: 'Field Lead Interviewer' },
        categoryScores: invScores,
        purchaseIntent: intentObj,
        photo_url: inv.photo_url || photoObj?.photo_url || null,
        photo: photoObj,
      };
    });

    return NextResponse.json({ success: true, interviews: result });
  } catch (error: any) {
    console.error('Error fetching surveys from MongoDB:', error);
    return NextResponse.json({ error: 'Failed to fetch survey data from MongoDB' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
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

    // 1. Create or update Shop in MongoDB
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

    await ShopModel.updateOne(
      { id: shopData.id },
      { $set: shopData },
      { upsert: true }
    );

    // 2. Create/Update Interview document in MongoDB
    const interviewCode = interview.interview_code || `INT-${Math.floor(100000 + Math.random() * 900000)}`;
    const interviewData = {
      id: interview.id || crypto.randomUUID(),
      interview_code: interviewCode,
      shop_id: shopData.id,
      interviewer_id: interview.interviewer_id || 'emp-int-01',
      started_at: interview.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
      duration_minutes: Number(interview.duration_minutes) || 15,
      main_completed: true,
      optional_completed: !!interview.optional_completed,
      optional_declined: !!interview.optional_declined,
      further_questions_allowed: interview.further_questions_allowed !== undefined ? !!interview.further_questions_allowed : !!interview.optional_completed,
      quick_followup: !!interview.quick_followup,
      status: 'completed',
      overall_score: Number(interview.overall_score) || 50,
      verdict: interview.verdict || 'Moderate Opportunity',
      is_walkin: interview.is_walkin !== false,
      photo_url: photoUrl || null,
      created_at: new Date().toISOString(),
    };

    await InterviewModel.updateOne(
      { id: interviewData.id },
      { $set: interviewData },
      { upsert: true }
    );

    // 3. Save Survey Responses in MongoDB
    if (Array.isArray(responses) && responses.length > 0) {
      // Clean up previous responses for this interview if re-submitting
      await SurveyResponseModel.deleteMany({ interview_id: interviewData.id });

      const responseDocs = responses.map((r: any) => ({
        id: crypto.randomUUID(),
        interview_id: interviewData.id,
        question_id: r.question_id,
        selected_option_id: r.selected_option_id || null,
        answer_text: r.answer_text || null,
        score: r.score ?? null,
        created_at: new Date().toISOString(),
      }));

      await SurveyResponseModel.insertMany(responseDocs);
    }

    // 4. Save Category Scores in MongoDB
    if (Array.isArray(categoryScores) && categoryScores.length > 0) {
      await CategoryScoreModel.deleteMany({ interview_id: interviewData.id });

      const scoreDocs = categoryScores.map((cs: any) => ({
        id: cs.id || crypto.randomUUID(),
        interview_id: interviewData.id,
        category_id: cs.category_id || cs.categoryId,
        total_score: Number(cs.total_score ?? cs.totalScore ?? 0),
        maximum_score: Number(cs.maximum_score ?? cs.maximumScore ?? 6),
        percentage: Number(cs.percentage ?? 0),
        status: cs.status || 'Moderate Opportunity',
        created_at: new Date().toISOString(),
      }));

      await CategoryScoreModel.insertMany(scoreDocs);
    }

    // 5. Save Purchase Intent in MongoDB
    if (purchaseIntent) {
      await PurchaseIntentModel.deleteMany({ interview_id: interviewData.id });

      const intentDoc = {
        id: crypto.randomUUID(),
        interview_id: interviewData.id,
        interest_level: purchaseIntent.interest_level || 'Yes, definitely interested',
        readiness_level: purchaseIntent.readiness_level || 'Yes, ready to start',
        price_range: purchaseIntent.price_range || '₹2,000–₹5,000/month',
        created_at: new Date().toISOString(),
      };

      await PurchaseIntentModel.create(intentDoc);
    }

    // 6. Save Shop Photo in MongoDB
    if (photoUrl) {
      await ShopPhotoModel.deleteMany({ interview_id: interviewData.id });

      const photoDoc = {
        id: crypto.randomUUID(),
        shop_id: shopData.id,
        interview_id: interviewData.id,
        storage_path: `photos/${shopData.id}_${interviewData.id}.jpg`,
        photo_url: photoUrl,
        captured_at: new Date().toISOString(),
      };

      await ShopPhotoModel.create(photoDoc);
    }

    console.log(`✅ Complete Survey Saved to MongoDB: Interview ID ${interviewData.id}`);

    return NextResponse.json({
      success: true,
      interview_id: interviewData.id,
      interview_code: interviewData.interview_code,
      message: 'Survey successfully saved to MongoDB',
    });
  } catch (error: any) {
    console.error('❌ Failed to save survey to MongoDB:', error);
    return NextResponse.json(
      { error: 'Failed to save survey to MongoDB: ' + error.message },
      { status: 500 }
    );
  }
}
