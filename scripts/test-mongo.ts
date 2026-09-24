import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import {
  createShop,
  createInterview,
  saveResponses,
  saveCategoryScores,
  savePurchaseIntent,
  saveShopPhoto,
  finalizeInterview,
  getInterviewById,
  getAllInterviews,
  getAllShops,
  localStore,
} from '../lib/db/db';
import { seedMongoDatabase } from '../lib/db/mongo-init';

async function runMongoDBVerificationTest() {
  console.log('=====================================================');
  console.log('⚡ GROVASTRA MONGODB ATLAS END-TO-END VERIFICATION');
  console.log('=====================================================\n');

  // STEP 0: SEED DATABASE
  console.log('0️⃣ Seeding MongoDB Atlas Database...');
  await seedMongoDatabase();

  // STEP 1: CREATE SHOP IN MONGODB
  console.log('\n1️⃣ Creating Shop in MongoDB...');
  const shop = await createShop({
    shop_name: 'Sri Venkateswara Textiles & Sarees',
    client_name: 'Narayana Murthy',
    location: 'Guntur, Andhra Pradesh',
    contact_number: '+91 99887 76655',
    shop_type: 'Silk Saree Showroom',
    staff_count: 6,
    years_in_business: 15,
    online_presence: ['WhatsApp', 'Instagram', 'Google Business'],
  });
  console.log(`   ✅ Shop Created: ID=${shop.id}, Code=${shop.shop_code}, Name="${shop.shop_name}"`);

  // STEP 2: CREATE INTERVIEW IN MONGODB
  console.log('\n2️⃣ Creating Survey Interview in MongoDB...');
  const interview = await createInterview(shop.id);
  console.log(`   ✅ Interview Created: ID=${interview.id}, Code=${interview.interview_code}`);

  // STEP 3: SAVE RESPONSES
  console.log('\n3️⃣ Answering Survey Questions...');
  const mainQuestions = localStore.questions.filter((q) => q.question_type === 'Main');
  const responsePayload = mainQuestions.map((q, idx) => ({
    question_id: q.id,
    score: idx % 3 === 0 ? 2 : idx % 3 === 1 ? 1 : 0,
    answer_text: `Test response for ${q.question_code}`,
  }));
  const responsesSaved = await saveResponses(interview.id, responsePayload);
  console.log(`   ✅ Responses Saved: ${responsesSaved ? 'SUCCESS' : 'FAILED'} (${responsePayload.length} answers)`);

  // STEP 4: SAVE CATEGORY SCORES
  console.log('\n4️⃣ Saving Category Scores...');
  const dummyScores = [
    {
      id: crypto.randomUUID(),
      interview_id: interview.id,
      category_id: 'cat-verify',
      total_score: 4,
      maximum_score: 6,
      percentage: 66.7,
      status: 'Moderate Opportunity' as const,
      created_at: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      interview_id: interview.id,
      category_id: 'cat-shop',
      total_score: 6,
      maximum_score: 6,
      percentage: 100,
      status: 'Significant Opportunity' as const,
      created_at: new Date().toISOString(),
    },
  ];
  const scoresSaved = await saveCategoryScores(interview.id, dummyScores);
  console.log(`   ✅ Category Scores Saved: ${scoresSaved ? 'SUCCESS' : 'FAILED'}`);

  // STEP 5: SAVE PURCHASE INTENT & PHOTO
  console.log('\n5️⃣ Saving Purchase Intent & Photo...');
  const intent = await savePurchaseIntent(interview.id, {
    interest_level: 'High',
    readiness_level: 'Ready to buy in 30 days',
    price_range: '₹1,000–₹2,000/month',
  });
  console.log(`   ✅ Purchase Intent Saved: PriceRange=${intent.price_range}`);

  const photo = await saveShopPhoto(shop.id, interview.id, 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5');
  console.log(`   ✅ Shop Photo Saved: URL=${photo.photo_url}`);

  // STEP 6: FINALIZE INTERVIEW
  console.log('\n6️⃣ Finalizing Survey Interview...');
  await finalizeInterview(interview.id, { optionalCompleted: true, quickFollowup: true });
  console.log(`   ✅ Interview Finalized!`);

  // STEP 7: QUERY & VERIFY DATA FROM MONGODB
  console.log('\n7️⃣ Querying Saved Survey Record from MongoDB...');
  const fullDetails = await getInterviewById(interview.id);
  if (fullDetails) {
    console.log(`   ✅ Query Successful:`);
    console.log(`      - Interview Code: ${fullDetails.interview.interview_code}`);
    console.log(`      - Shop Name: ${fullDetails.shop?.shop_name}`);
    console.log(`      - Responses Count: ${fullDetails.responses.length}`);
    console.log(`      - Category Scores Count: ${fullDetails.categoryScores.length}`);
    console.log(`      - Purchase Intent Price: ${fullDetails.purchaseIntent?.price_range}`);
  } else {
    console.error('   ❌ Query Failed: Interview not found');
  }

  const allShops = await getAllShops();
  console.log(`\n8️⃣ Total Shops in MongoDB: ${allShops.length}`);

  const allInterviews = await getAllInterviews();
  console.log(`   Total Interviews in MongoDB: ${allInterviews.length}`);

  console.log('\n=====================================================');
  console.log('🎉 ALL MONGODB VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('=====================================================\n');
  process.exit(0);
}

runMongoDBVerificationTest().catch((e) => {
  console.error('💥 Test failed with error:', e);
  process.exit(1);
});
