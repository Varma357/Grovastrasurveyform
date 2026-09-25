'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Store,
  MapPin,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Camera,
  ShieldCheck,
  Zap,
  ArrowRight,
  Upload,
  Printer,
  Share2,
} from 'lucide-react';
import {
  createShop,
  createInterview,
  saveResponses,
  saveCategoryScores,
  savePurchaseIntent,
  saveShopPhoto,
  finalizeInterview,
  localStore,
} from '@/lib/db/db';
import { calculateCategoryScores, getEligibleOptionalQuestions, CategorySummary } from '@/lib/scoring';
import { Question, QuestionOption, Shop } from '@/lib/types';
import { useRole } from '@/components/context/RoleContext';

export default function SurveyPage() {
  const router = useRouter();
  const { currentUser } = useRole();

  // Wizard Step: 'shop' -> 'main' -> 'analysis' -> 'optional' -> 'intent' -> 'photo' -> 'completed'
  const [step, setStep] = useState<'shop' | 'main' | 'analysis' | 'optional' | 'intent' | 'photo' | 'completed'>('shop');

  // Step 1: Shop Data
  const [shopName, setShopName] = useState('');
  const [clientName, setClientName] = useState('');
  const [location, setLocation] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [shopType, setShopType] = useState('Saree Retail');
  const [staffCount, setStaffCount] = useState('4');
  const [yearsInBusiness, setYearsInBusiness] = useState('8');
  const [onlinePresence, setOnlinePresence] = useState<string[]>(['WhatsApp', 'Instagram']);
  const [isWalkin, setIsWalkin] = useState(true);

  // Active Session Entities
  const [activeShop, setActiveShop] = useState<Shop | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Step 2: Main Questions
  const [mainQuestions, setMainQuestions] = useState<Question[]>([]);
  const [mainIndex, setMainIndex] = useState(0);
  const [mainResponses, setMainResponses] = useState<Record<string, { optionId: string; score: number; label: string }>>({});

  // Step 3: Analysis & Permission
  const [categorySummaries, setCategorySummaries] = useState<CategorySummary[]>([]);
  const [permissionChoice, setPermissionChoice] = useState<'YES' | 'NO' | null>(null);
  const [quickFollowup, setQuickFollowup] = useState(false);

  // Step 4: Optional Questions
  const [optionalQuestions, setOptionalQuestions] = useState<Question[]>([]);
  const [optionalIndex, setOptionalIndex] = useState(0);
  const [optionalResponses, setOptionalResponses] = useState<Record<string, { optionId: string; score: number; label: string }>>({});

  // Step 5: Intent, Readiness & Pricing
  const [interestLevel, setInterestLevel] = useState('Yes, definitely interested');
  const [readinessLevel, setReadinessLevel] = useState('Yes, ready to start');
  const [priceRange, setPriceRange] = useState('₹2,000–₹5,000/month');

  // Step 6: Shop Photo
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const mains = localStore.questions.filter((q) => q.question_type === 'Main' && q.active);
    setMainQuestions(mains);
  }, []);

  const handleStartInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName || !clientName || !location) {
      alert('Please fill in Shop Name, Client Name, and Location.');
      return;
    }

    setStartTime(Date.now());
    const createdShop = await createShop({
      shop_name: shopName,
      client_name: clientName,
      location,
      contact_number: contactNumber,
      shop_type: shopType,
      staff_count: Number(staffCount),
      years_in_business: Number(yearsInBusiness),
      online_presence: onlinePresence,
    });

    setActiveShop(createdShop);
    const createdInterview = await createInterview(createdShop.id, currentUser?.id);
    setInterviewId(createdInterview.id);
    setStep('main');
  };

  const handleMainAnswer = (questionId: string, option: QuestionOption) => {
    setMainResponses((prev) => ({
      ...prev,
      [questionId]: {
        optionId: option.id,
        score: option.score ?? 0,
        label: option.option_label,
      },
    }));
  };

  const handleNextMain = () => {
    if (mainIndex < mainQuestions.length - 1) {
      setMainIndex((prev) => prev + 1);
    } else {
      const scoresRecord: Record<string, number> = {};
      Object.entries(mainResponses).forEach(([qId, val]) => {
        scoresRecord[qId] = val.score;
      });

      const summaries = calculateCategoryScores(localStore.categories, mainQuestions, scoresRecord);
      setCategorySummaries(summaries);
      setStep('analysis');
    }
  };

  const handlePermissionDecision = (choice: 'YES' | 'NO', isQuick: boolean = false) => {
    setPermissionChoice(choice);
    setQuickFollowup(isQuick);

    if (choice === 'NO') {
      setStep('intent');
    } else {
      const allOptional = localStore.questions.filter((q) => q.question_type === 'Optional' && q.active);
      const responseLookup: Record<string, { questionCode: string; score: number }> = {};

      Object.entries(mainResponses).forEach(([qId, val]) => {
        const q = mainQuestions.find((mq) => mq.id === qId);
        if (q) {
          responseLookup[qId] = { questionCode: q.question_code, score: val.score };
        }
      });

      const eligible = getEligibleOptionalQuestions(allOptional, categorySummaries, responseLookup, isQuick);
      setOptionalQuestions(eligible);

      if (eligible.length > 0) {
        setStep('optional');
      } else {
        setStep('intent');
      }
    }
  };

  const handleOptionalAnswer = (questionId: string, option: QuestionOption) => {
    setOptionalResponses((prev) => ({
      ...prev,
      [questionId]: {
        optionId: option.id,
        score: option.score ?? 0,
        label: option.option_label,
      },
    }));
  };

  const handleNextOptional = () => {
    if (optionalIndex < optionalQuestions.length - 1) {
      setOptionalIndex((prev) => prev + 1);
    } else {
      setStep('intent');
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitSurvey = async () => {
    if (!interviewId || !activeShop) return;
    setIsSubmitting(true);

    try {
      const durationMinutes = Math.max(1, Math.round((Date.now() - startTime) / 60000));

      // Calculate overall score
      let totalMainScore = 0;
      Object.values(mainResponses).forEach((val) => {
        totalMainScore += val.score;
      });
      const maxScore = mainQuestions.length * 2;
      const overallPct = maxScore > 0 ? Math.round((totalMainScore / maxScore) * 100) : 0;

      let verdict: 'Strong Current Process' | 'Moderate Opportunity' | 'Significant Opportunity' = 'Strong Current Process';
      if (overallPct >= 50) verdict = 'Significant Opportunity';
      else if (overallPct >= 34) verdict = 'Moderate Opportunity';

      const responsesPayload = Object.entries(mainResponses).map(([qId, val]) => ({
        question_id: qId,
        selected_option_id: val.optionId,
        score: val.score,
        answer_text: val.label,
      }));

      Object.entries(optionalResponses).forEach(([qId, val]) => {
        responsesPayload.push({
          question_id: qId,
          selected_option_id: val.optionId,
          score: val.score,
          answer_text: val.label,
        });
      });

      const scoreRows = categorySummaries.map((cs) => ({
        id: crypto.randomUUID(),
        interview_id: interviewId,
        category_id: cs.categoryId,
        total_score: cs.totalScore,
        maximum_score: cs.maximumScore,
        percentage: cs.percentage,
        status: cs.status,
        created_at: new Date().toISOString(),
      }));

      const photoUrl = photoDataUrl || `https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80`;

      // Save to MongoDB via API Endpoint
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shop: {
            ...activeShop,
            shop_name: shopName,
            client_name: clientName,
            location,
            contact_number: contactNumber,
            shop_type: shopType,
            staff_count: Number(staffCount),
            years_in_business: Number(yearsInBusiness),
            online_presence: onlinePresence,
          },
          interview: {
            id: interviewId,
            interviewer_id: currentUser?.id || 'emp-int-01',
            started_at: new Date(startTime).toISOString(),
            duration_minutes: durationMinutes,
            main_completed: true,
            optional_completed: permissionChoice === 'YES',
            optional_declined: permissionChoice === 'NO',
            further_questions_allowed: permissionChoice === 'YES',
            quick_followup: quickFollowup,
            overall_score: overallPct,
            verdict: verdict,
            is_walkin: isWalkin,
          },
          responses: responsesPayload,
          categoryScores: scoreRows,
          purchaseIntent: {
            interest_level: interestLevel,
            readiness_level: readinessLevel,
            price_range: priceRange,
          },
          photoUrl: photoUrl,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        console.error('❌ MongoDB API submission failed:', errJson);
      } else {
        console.log('✅ MongoDB API submission successful');
      }

      // Also save to local store as backup
      await saveResponses(interviewId, responsesPayload);
      await saveCategoryScores(interviewId, scoreRows);
      await savePurchaseIntent(interviewId, {
        interest_level: interestLevel,
        readiness_level: readinessLevel,
        price_range: priceRange,
      });
      await saveShopPhoto(activeShop.id, interviewId, photoUrl);
      await finalizeInterview(interviewId, {
        optionalCompleted: permissionChoice === 'YES',
        optionalDeclined: permissionChoice === 'NO',
        quickFollowup,
      });

      const inv = localStore.interviews.find((i) => i.id === interviewId);
      if (inv) {
        inv.duration_minutes = durationMinutes;
        inv.overall_score = overallPct;
        inv.verdict = verdict;
        inv.is_walkin = isWalkin;
        inv.photo_url = photoUrl;
      }

      setStep('completed');
    } catch (err) {
      console.error('Error submitting survey:', err);
      setStep('completed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMainQ = mainQuestions[mainIndex];
  const currentOptQ = optionalQuestions[optionalIndex];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border border-indigo-500/30 p-4 rounded-xl shadow-lg">
        <div className="flex items-center space-x-3">
          <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
          <div>
            <h2 className="font-bold text-white text-base">Saree Shop Field Discovery Interview</h2>
            <p className="text-xs text-indigo-200">Structured discovery, category opportunity analysis & instant shop report</p>
          </div>
        </div>
        {activeShop && (
          <div className="text-right">
            <span className="text-xs text-slate-400">Shop Code</span>
            <div className="font-mono text-xs font-bold text-indigo-300">{activeShop.shop_code}</div>
          </div>
        )}
      </div>

      {/* STEP 1: SHOP DETAILS FORM */}
      {step === 'shop' && (
        <div className="glass-panel p-6 space-y-6">
          <div className="border-b border-dark-600 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Store className="w-5 h-5 text-indigo-400" />
              <span>Step 1: Shop & Client Information</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Collect store details prior to beginning core survey</p>
          </div>

          <form onSubmit={handleStartInterview} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Laxmi Kanchi Silks"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Client / Owner Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Varma"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Town / City *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vijayawada, AP"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Number</label>
                <input
                  type="text"
                  placeholder="+91 9876543210"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Shop Type</label>
                <select
                  value={shopType}
                  onChange={(e) => setShopType(e.target.value)}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                >
                  <option value="Saree Retail">Saree Retail</option>
                  <option value="Saree Wholesale">Saree Wholesale</option>
                  <option value="Retail + Wholesale">Retail + Wholesale</option>
                  <option value="Boutique">Boutique</option>
                  <option value="Multi-brand Store">Multi-brand Store</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Interview Type</label>
                <div className="flex space-x-3 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={isWalkin}
                      onChange={() => setIsWalkin(true)}
                      className="text-indigo-600"
                    />
                    <span>Walk-in Shop Visit</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="radio"
                      checked={!isWalkin}
                      onChange={() => setIsWalkin(false)}
                      className="text-indigo-600"
                    />
                    <span>Scheduled Call / Appointment</span>
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all text-base mt-6"
            >
              <span>Begin Core Survey</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}

      {/* STEP 2: MAIN CORE SURVEY */}
      {step === 'main' && currentMainQ && (
        <div className="space-y-4">
          <div className="bg-dark-800 p-4 rounded-xl border border-dark-600 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider px-2.5 py-1 bg-indigo-950/80 rounded-md border border-indigo-500/30">
                {currentMainQ.category_code}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Core Question {mainIndex + 1} of {mainQuestions.length}
              </span>
            </div>
            <div className="w-32 bg-dark-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full transition-all duration-300"
                style={{ width: `${((mainIndex + 1) / mainQuestions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="glass-panel p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-indigo-300">{currentMainQ.question_code}</span>
              <h3 className="text-xl font-bold text-white leading-snug">{currentMainQ.question_text}</h3>
            </div>

            <div className="space-y-3">
              {currentMainQ.options?.map((opt) => {
                const isSelected = mainResponses[currentMainQ.id]?.optionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleMainAnswer(currentMainQ.id, opt)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-lg shadow-indigo-500/10'
                        : 'bg-dark-800/80 border-dark-600 text-slate-200 hover:border-slate-500 hover:bg-dark-700'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-slate-500'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-base font-medium leading-normal">{opt.option_label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-dark-600">
              <button
                disabled={mainIndex === 0}
                onClick={() => setMainIndex((prev) => Math.max(0, prev - 1))}
                className="px-4 py-2 rounded-lg bg-dark-700 hover:bg-dark-600 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed flex items-center space-x-1 text-sm font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <button
                disabled={!mainResponses[currentMainQ.id]}
                onClick={handleNextMain}
                className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-2 text-sm shadow-md"
              >
                <span>{mainIndex === mainQuestions.length - 1 ? 'Complete Core Survey' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: CATEGORY ANALYSIS & PERMISSION POPUP */}
      {step === 'analysis' && (
        <div className="glass-panel p-6 space-y-6 border-2 border-indigo-500/40">
          <div className="text-center space-y-2 border-b border-dark-600 pb-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-extrabold text-white">Core Survey Completed</h3>
            <p className="text-sm text-slate-300">
              Based on your responses, we have analyzed current business process capabilities across all 9 categories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {categorySummaries.map((cs) => (
              <div
                key={cs.categoryCode}
                className={`p-3.5 rounded-xl border ${
                  cs.status === 'Significant Opportunity'
                    ? 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    : cs.status === 'Moderate Opportunity'
                    ? 'bg-amber-950/30 border-amber-500/40 text-amber-200'
                    : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs uppercase tracking-wider">{cs.categoryName}</span>
                  <span className="text-xs font-mono font-bold">{cs.percentage}% Pain</span>
                </div>
                <div className="text-xs font-medium opacity-90">{cs.politeLabel}</div>
              </div>
            ))}
          </div>

          <div className="bg-dark-900 border border-indigo-500/50 p-6 rounded-2xl space-y-4 text-center">
            <h4 className="text-lg font-bold text-indigo-300">Client Further Questions Permission</h4>
            <p className="text-base font-bold text-white max-w-xl mx-auto leading-relaxed">
              "Can I ask you a few more questions to understand your shop's current process better?"
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => handlePermissionDecision('YES', false)}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold py-3.5 px-8 rounded-xl shadow-lg shadow-indigo-600/30 text-sm flex items-center justify-center space-x-2 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                <span>YES, I HAVE TIME</span>
              </button>

              <button
                onClick={() => handlePermissionDecision('NO', false)}
                className="w-full sm:w-auto bg-dark-700 hover:bg-dark-600 text-slate-200 font-extrabold py-3.5 px-8 rounded-xl border border-dark-600 text-sm cursor-pointer"
              >
                <span>NO, THAT'S ALL</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: CONDITIONAL QUESTIONS */}
      {step === 'optional' && currentOptQ && (
        <div className="space-y-4">
          <div className="bg-dark-800 p-4 rounded-xl border border-dark-600 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider px-2.5 py-1 bg-purple-950/80 rounded-md border border-purple-500/30">
                {currentOptQ.category_code} CONDITIONAL
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Deep Discovery Question {optionalIndex + 1} of {optionalQuestions.length}
              </span>
            </div>
          </div>

          <div className="glass-panel p-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono text-purple-300">{currentOptQ.question_code}</span>
              <h3 className="text-xl font-bold text-white leading-snug">{currentOptQ.question_text}</h3>
            </div>

            <div className="space-y-3">
              {currentOptQ.options?.map((opt) => {
                const isSelected = optionalResponses[currentOptQ.id]?.optionId === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleOptionalAnswer(currentOptQ.id, opt)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-purple-950/70 border-purple-500 text-white'
                        : 'bg-dark-800/80 border-dark-600 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'border-purple-400 bg-purple-500 text-white' : 'border-slate-500'
                      }`}
                    >
                      {isSelected && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <span className="text-base font-medium">{opt.option_label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end pt-4 border-t border-dark-600">
              <button
                disabled={!optionalResponses[currentOptQ.id]}
                onClick={handleNextOptional}
                className="px-6 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold disabled:opacity-40 flex items-center space-x-2 text-sm shadow-md"
              >
                <span>{optionalIndex === optionalQuestions.length - 1 ? 'Proceed to Adoption Readiness' : 'Next Question'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: ADOPTION READINESS & PRICING */}
      {step === 'intent' && (
        <div className="glass-panel p-6 space-y-6">
          <div className="border-b border-dark-600 pb-4">
            <h3 className="text-lg font-bold text-white">Market Adoption Readiness & Price Sensitivity</h3>
            <p className="text-xs text-slate-400 mt-1">Capture shop solution interest, readiness level, and acceptable monthly price band</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-200">
              Q1: "Based on what we discussed, would you be interested in using a solution that provides these capabilities for your shop?"
            </label>
            <select
              value={interestLevel}
              onChange={(e) => setInterestLevel(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Yes, definitely interested">1. Yes, definitely interested</option>
              <option value="Yes, but I would like to know more">2. Yes, but I would like to know more</option>
              <option value="Maybe / Need to think about it">3. Maybe / Need to think about it</option>
              <option value="Not interested right now">4. Not interested right now</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-200">
              Q2: "If this solution is available today at a price suitable for your shop, would you be ready to start using it?"
            </label>
            <select
              value={readinessLevel}
              onChange={(e) => setReadinessLevel(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Yes, ready to start">1. Yes, ready to start</option>
              <option value="Interested, but need to discuss">2. Interested, but need to discuss</option>
              <option value="Interested, but not now">3. Interested, but not now</option>
              <option value="Just exploring">4. Just exploring</option>
              <option value="No">5. No</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-slate-200">
              Q3: "What monthly price would you consider reasonable for this solution?"
            </label>
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="w-full bg-dark-900 border border-dark-600 rounded-xl p-3 text-sm text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="₹500–₹2,000/month">1. ₹500–₹2,000/month</option>
              <option value="₹2,000–₹5,000/month">2. ₹2,000–₹5,000/month</option>
              <option value="₹5,000–₹10,000/month">3. ₹5,000–₹10,000/month</option>
              <option value="Above ₹10,000/month">4. Above ₹10,000/month</option>
              <option value="₹0 — only if free">5. ₹0 — only if free</option>
              <option value="Cannot decide yet">6. Cannot decide yet</option>
            </select>
          </div>

          <button
            onClick={() => setStep('photo')}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center space-x-2 text-base shadow-lg"
          >
            <span>Proceed to Shop Reference Photo</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 6: SHOP PHOTO CAPTURE */}
      {step === 'photo' && (
        <div className="glass-panel p-6 space-y-6">
          <div className="border-b border-dark-600 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <Camera className="w-5 h-5 text-indigo-400" />
              <span>Shop Reference Photo</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">Please capture or upload a clear photograph of the shop storefront.</p>
          </div>

          <div className="border-2 border-dashed border-dark-600 hover:border-indigo-500/50 rounded-2xl p-6 text-center space-y-4 transition-all">
            {photoDataUrl ? (
              <div className="space-y-4">
                <img
                  src={photoDataUrl}
                  alt="Shop Preview"
                  className="max-h-64 mx-auto rounded-xl border border-dark-600 object-cover"
                />
                <div className="flex justify-center space-x-3">
                  <label className="cursor-pointer px-4 py-2 bg-dark-700 hover:bg-dark-600 text-slate-200 text-xs font-semibold rounded-lg">
                    Retake / Change Photo
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-indigo-950/60 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/30">
                  <Camera className="w-8 h-8" />
                </div>
                <div className="text-sm font-semibold text-slate-200">Capture Camera Photo or Upload File</div>
                <label className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-5 rounded-xl cursor-pointer text-sm shadow">
                  <Upload className="w-4 h-4" />
                  <span>Choose / Take Photo</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                </label>
              </div>
            )}
          </div>

          <button
            disabled={isSubmitting}
            onClick={handleSubmitSurvey}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 text-lg shadow-lg shadow-emerald-600/30 transition-all"
          >
            {isSubmitting ? (
              <span>Saving to Database...</span>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6" />
                <span>Submit & Complete Interview</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* STEP 7: COMPLETED & SHOP REPORT GENERATION */}
      {step === 'completed' && (
        <div className="glass-panel p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white">Interview Complete!</h3>
            <p className="text-sm text-slate-300">
              Survey data has been saved. You can now generate, print, or share the Shop Report with the customer via WhatsApp.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
            <button
              onClick={() => router.push(`/reports/shop?id=${interviewId}`)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-6 rounded-xl text-sm flex items-center justify-center space-x-2 shadow-lg"
            >
              <Store className="w-4 h-4" />
              <span>Generate Shop Report</span>
            </button>
            <button
              onClick={() => router.push('/interviews')}
              className="bg-dark-700 hover:bg-dark-600 text-slate-200 font-bold py-3 px-6 rounded-xl text-sm"
            >
              My Completed Surveys
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
