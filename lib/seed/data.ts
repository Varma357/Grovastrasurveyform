export interface SeedCategory {
  category_code: string;
  category_name: string;
  description: string;
  display_order: number;
}

export interface SeedFeature {
  feature_code: string;
  feature_name: string;
  category_code: string;
  description: string;
}

export interface SeedQuestionOption {
  option_label: string;
  score: number | null;
  display_order: number;
}

export interface SeedQuestion {
  question_code: string;
  category_code: string;
  question_type: 'Main' | 'Optional';
  question_text: string;
  display_order: number;
  priority: number;
  feature_code?: string;
  trigger_rule?: Record<string, any>;
  options: SeedQuestionOption[];
}

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    category_code: 'VERIFY',
    category_name: 'VERIFY',
    description: 'Shop identity verification, online authenticity, and brand protection.',
    display_order: 1,
  },
  {
    category_code: 'SHOP',
    category_name: 'SHOP',
    description: 'Digital cataloguing, product search, and catalogue sharing capability.',
    display_order: 2,
  },
  {
    category_code: 'RECEPTIONIST',
    category_name: 'RECEPTIONIST',
    description: 'Customer tracking, staff follow-up coordination, and interaction history.',
    display_order: 3,
  },
  {
    category_code: 'GROW',
    category_name: 'GROW',
    description: 'Marketing analytics, customer demand insights, and promotion targeting.',
    display_order: 4,
  },
  {
    category_code: 'NETWORK',
    category_name: 'NETWORK',
    description: 'Reseller management, wholesale catalogue, and partner access controls.',
    display_order: 5,
  },
  {
    category_code: 'MONEY',
    category_name: 'MONEY',
    description: 'Payment matching, order reconciliation, and flexible payment options.',
    display_order: 6,
  },
  {
    category_code: 'MARKET',
    category_name: 'MARKET',
    description: 'Customer acquisition tracking, trust signals, and alternative recommendations.',
    display_order: 7,
  },
  {
    category_code: 'PROVENANCE',
    category_name: 'PROVENANCE',
    description: 'Weaving origin, maker certification, and saree authenticity records.',
    display_order: 8,
  },
  {
    category_code: 'OPERATIONS',
    category_name: 'OPERATIONS',
    description: 'Bulk product onboarding, business continuity, and dispute resolution.',
    display_order: 9,
  },
];

export const SEED_FEATURES: SeedFeature[] = [
  // VERIFY
  { feature_code: 'FEAT_VERIFY_TRUST', feature_name: 'Shop Verification / Trust', category_code: 'VERIFY', description: 'Clear identity verification to build first-time buyer confidence.' },
  { feature_code: 'FEAT_VERIFY_PROTECTION', feature_name: 'Brand/Content Protection', category_code: 'VERIFY', description: 'Protection against copied photos and online identity impersonation.' },
  { feature_code: 'FEAT_DIGITAL_TRUST', feature_name: 'Digital Trust Page', category_code: 'VERIFY', description: 'Instant shop trust badge and verified payment link.' },

  // SHOP
  { feature_code: 'FEAT_DIGITAL_CATALOGUE', feature_name: 'Digital Catalogue', category_code: 'SHOP', description: 'Centralized live catalogue for available sarees.' },
  { feature_code: 'FEAT_SMART_SEARCH', feature_name: 'Smart Saree Search', category_code: 'SHOP', description: 'Instant search by colour, pattern, price range, and weave.' },
  { feature_code: 'FEAT_CATALOGUE_SHARING', feature_name: 'Smart Catalogue Sharing', category_code: 'SHOP', description: 'Fast, organized product collection links for WhatsApp customers.' },
  { feature_code: 'FEAT_SIMILAR_DISCOVERY', feature_name: 'Similar Saree Discovery', category_code: 'SHOP', description: 'Quickly find alternative sarees when a requested saree is sold.' },

  // RECEPTIONIST
  { feature_code: 'FEAT_CUSTOMER_FOLLOWUP', feature_name: 'Customer Follow-up', category_code: 'RECEPTIONIST', description: 'Automated follow-up reminders and pending order tracking.' },
  { feature_code: 'FEAT_SHARED_MGMT', feature_name: 'Shared Customer Management', category_code: 'RECEPTIONIST', description: 'Multi-staff conversation ownership and team inbox.' },
  { feature_code: 'FEAT_CUSTOMER_HISTORY', feature_name: 'Customer History', category_code: 'RECEPTIONIST', description: 'Instant access to previous purchases and customer preferences.' },

  // GROW
  { feature_code: 'FEAT_MARKETING_ANALYTICS', feature_name: 'Marketing Analytics', category_code: 'GROW', description: 'Track sales brought in by Instagram reels and promotions.' },
  { feature_code: 'FEAT_DEMAND_ANALYTICS', feature_name: 'Demand Analytics', category_code: 'GROW', description: 'Identify trending saree designs, colours, and price ranges.' },
  { feature_code: 'FEAT_CUSTOMER_SEGMENT', feature_name: 'Customer Segmentation', category_code: 'GROW', description: 'Targeted promotions for repeat and VIP buyers.' },

  // NETWORK
  { feature_code: 'FEAT_RESELLER_NETWORK', feature_name: 'Reseller Network', category_code: 'NETWORK', description: 'Dedicated reseller portal and commission tracking.' },
  { feature_code: 'FEAT_WHOLESALE_CATALOGUE', feature_name: 'Wholesale/Reseller Catalogue', category_code: 'NETWORK', description: 'Dynamic pricing tiers for resellers and boutiques.' },
  { feature_code: 'FEAT_PARTNER_ACCESS', feature_name: 'Partner Access Control', category_code: 'NETWORK', description: 'Strict visibility controls over supplier and wholesale details.' },

  // MONEY
  { feature_code: 'FEAT_PAYMENT_TRACKING', feature_name: 'Payment & Order Tracking', category_code: 'MONEY', description: 'Automatic matching of advance UPI payments to orders.' },
  { feature_code: 'FEAT_PAYMENT_VERIFY', feature_name: 'Payment Verification', category_code: 'MONEY', description: 'Instant payment reconciliation for unlinked transfers.' },
  { feature_code: 'FEAT_FLEXIBLE_PAYMENTS', feature_name: 'Flexible Payments', category_code: 'MONEY', description: 'Bridal layaway and instalment options.' },

  // MARKET
  { feature_code: 'FEAT_SOURCE_TRACKING', feature_name: 'Customer Source Tracking', category_code: 'MARKET', description: 'Track whether buyers come from Instagram, WhatsApp, or search.' },
  { feature_code: 'FEAT_ALT_RECOMMEND', feature_name: 'Alternative Saree Recommendation', category_code: 'MARKET', description: 'Smart suggestions when exact saree stock is exhausted.' },

  // PROVENANCE
  { feature_code: 'FEAT_SAREE_PROVENANCE', feature_name: 'Saree Provenance', category_code: 'PROVENANCE', description: 'Digital certificate of maker, loom cluster, and authenticity.' },
  { feature_code: 'FEAT_PROVENANCE_RECORDS', feature_name: 'Product Provenance Records', category_code: 'PROVENANCE', description: 'Central record of authentic weaving techniques and origin.' },

  // OPERATIONS
  { feature_code: 'FEAT_BULK_ONBOARDING', feature_name: 'Bulk Product Onboarding', category_code: 'OPERATIONS', description: 'Rapid photo tagging and catalogue listing for new inventory.' },
  { feature_code: 'FEAT_BUSINESS_CONTINUITY', feature_name: 'Business Continuity / Shared Access', category_code: 'OPERATIONS', description: 'Shared store data independent of single owner phone.' },
  { feature_code: 'FEAT_DISPUTE_MGMT', feature_name: 'Issue/Dispute Management', category_code: 'OPERATIONS', description: 'Tracking desk for damaged parcels, returns, and complaints.' },
];

export const SEED_QUESTIONS: SeedQuestion[] = [
  // ---------------- VERIFY MAIN ----------------
  {
    question_code: 'VERIFY-M01',
    category_code: 'VERIFY',
    question_type: 'Main',
    question_text: 'If a new customer is buying from your shop for the first time, how do you help them verify that they are dealing with your genuine shop before making a payment?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_VERIFY_TRUST',
    options: [
      { option_label: 'We have a clear and easy way to establish that.', score: 0, display_order: 1 },
      { option_label: 'We can establish it, but it depends on manual communication.', score: 1, display_order: 2 },
      { option_label: 'We do not have a consistent way to establish it.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'VERIFY-M02',
    category_code: 'VERIFY',
    question_type: 'Main',
    question_text: 'If your saree photos, shop name or identity are copied or misused online, how do you currently handle it?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_VERIFY_PROTECTION',
    options: [
      { option_label: 'We have a clear process.', score: 0, display_order: 1 },
      { option_label: 'We handle it manually when it happens.', score: 1, display_order: 2 },
      { option_label: 'We do not have a defined process.', score: 2, display_order: 3 },
    ],
  },
  // VERIFY OPTIONAL
  {
    question_code: 'VERIFY-O01',
    category_code: 'VERIFY',
    question_type: 'Optional',
    question_text: 'Show me how you would ask a first-time customer to verify your shop before making a UPI payment.',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_DIGITAL_TRUST',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Clear verified link / page ready immediately.', score: 0, display_order: 1 },
      { option_label: 'Manual explanation or phone video call.', score: 1, display_order: 2 },
      { option_label: 'No reliable verification method available.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'VERIFY-O02',
    category_code: 'VERIFY',
    question_type: 'Optional',
    question_text: 'When someone copies your saree photos or impersonates your shop online, what would you normally do?',
    display_order: 4,
    priority: 2,
    feature_code: 'FEAT_VERIFY_PROTECTION',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Report through standard process with digital proof.', score: 0, display_order: 1 },
      { option_label: 'Post warnings manually on status/story.', score: 1, display_order: 2 },
      { option_label: 'Unable to take action.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'VERIFY-O03',
    category_code: 'VERIFY',
    question_type: 'Optional',
    question_text: 'If a customer is hesitant to make a remote payment because they do not know your shop, what would you send them to build trust?',
    display_order: 5,
    priority: 3,
    feature_code: 'FEAT_VERIFY_TRUST',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Send verified business profile and customer reviews.', score: 0, display_order: 1 },
      { option_label: 'Send shop location pin and photos manually.', score: 1, display_order: 2 },
      { option_label: 'Struggle to reassure customer.', score: 2, display_order: 3 },
    ],
  },

  // ---------------- SHOP MAIN ----------------
  {
    question_code: 'SHOP-M01',
    category_code: 'SHOP',
    question_type: 'Main',
    question_text: 'If I ask you right now to show me all the sarees you currently have available for sale online, where would you show me?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_DIGITAL_CATALOGUE',
    options: [
      { option_label: 'One current catalogue/page where available sarees are easy to see.', score: 0, display_order: 1 },
      { option_label: 'Photos/catalogues are spread across WhatsApp, Instagram, phone galleries or other places.', score: 1, display_order: 2 },
      { option_label: 'We do not have a reliable current online catalogue.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'SHOP-M02',
    category_code: 'SHOP',
    question_type: 'Main',
    question_text: 'When a customer asks for sarees of a particular colour, design, price range or style, how do you find suitable sarees?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_SMART_SEARCH',
    options: [
      { option_label: 'I can quickly find suitable sarees.', score: 0, display_order: 1 },
      { option_label: 'I can find them, but it requires manual searching.', score: 1, display_order: 2 },
      { option_label: 'It is difficult because the products are not organized for quick searching.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'SHOP-M03',
    category_code: 'SHOP',
    question_type: 'Main',
    question_text: 'When a customer wants to see multiple sarees remotely, how do you normally send them the products?',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_CATALOGUE_SHARING',
    options: [
      { option_label: 'We can quickly send organized product options.', score: 0, display_order: 1 },
      { option_label: 'We manually select and send photos.', score: 1, display_order: 2 },
      { option_label: 'It takes significant effort or the photos are difficult to organize.', score: 2, display_order: 3 },
    ],
  },
  // SHOP OPTIONAL
  {
    question_code: 'SHOP-O01',
    category_code: 'SHOP',
    question_type: 'Optional',
    question_text: 'A customer sends you a screenshot of a saree from Instagram or WhatsApp. How would you identify the exact piece and continue the enquiry?',
    display_order: 4,
    priority: 1,
    feature_code: 'FEAT_SMART_SEARCH',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Instant photo search in inventory system.', score: 0, display_order: 1 },
      { option_label: 'Ask staff or check gallery manually.', score: 1, display_order: 2 },
      { option_label: 'Takes long time or often fails.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'SHOP-O02',
    category_code: 'SHOP',
    question_type: 'Optional',
    question_text: 'A customer asks you to show five sarees similar to a particular design but in different colours. How would you help them?',
    display_order: 5,
    priority: 2,
    feature_code: 'FEAT_SIMILAR_DISCOVERY',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Filter inventory by design variant in seconds.', score: 0, display_order: 1 },
      { option_label: 'Browse photos manually to collect variants.', score: 1, display_order: 2 },
      { option_label: 'Hard to locate exact color alternatives.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'SHOP-O03',
    category_code: 'SHOP',
    question_type: 'Optional',
    question_text: 'A customer wants a saree that has already been sold. How would you help them find another similar saree?',
    display_order: 6,
    priority: 3,
    feature_code: 'FEAT_SIMILAR_DISCOVERY',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'System presents similar active options.', score: 0, display_order: 1 },
      { option_label: 'Manually suggest from memory.', score: 1, display_order: 2 },
      { option_label: 'Usually miss the sale.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'SHOP-O04',
    category_code: 'SHOP',
    question_type: 'Optional',
    question_text: 'If a customer asks you to show all available sarees below a particular price, how would you find them?',
    display_order: 7,
    priority: 4,
    feature_code: 'FEAT_SMART_SEARCH',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Instant price filter link.', score: 0, display_order: 1 },
      { option_label: 'Sort through price list manually.', score: 1, display_order: 2 },
      { option_label: 'No price filtered catalogue.', score: 2, display_order: 3 },
    ],
  },

  // ---------------- RECEPTIONIST MAIN ----------------
  {
    question_code: 'RECEPTIONIST-M01',
    category_code: 'RECEPTIONIST',
    question_type: 'Main',
    question_text: 'During a busy sales day, how do you manage customers who are waiting for saree photos, prices, payment details or a callback?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_CUSTOMER_FOLLOWUP',
    options: [
      { option_label: 'We have a clear process and customers are tracked.', score: 0, display_order: 1 },
      { option_label: 'We manage it manually.', score: 1, display_order: 2 },
      { option_label: 'Follow-ups can easily be missed.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'RECEPTIONIST-M02',
    category_code: 'RECEPTIONIST',
    question_type: 'Main',
    question_text: 'If multiple staff members are responding to customers from different phones, how do you know which customer each person is handling?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_SHARED_MGMT',
    options: [
      { option_label: 'We have a clear shared process.', score: 0, display_order: 1 },
      { option_label: 'We coordinate manually.', score: 1, display_order: 2 },
      { option_label: 'There is no reliable way to track ownership.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'RECEPTIONIST-M03',
    category_code: 'RECEPTIONIST',
    question_type: 'Main',
    question_text: 'When a previous customer contacts you again, how do you find their previous purchase or interaction details?',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_CUSTOMER_HISTORY',
    options: [
      { option_label: 'Customer history is easy to find.', score: 0, display_order: 1 },
      { option_label: 'We can find it with some manual effort.', score: 1, display_order: 2 },
      { option_label: 'We generally cannot find the history easily.', score: 2, display_order: 3 },
    ],
  },
  // RECEPTIONIST OPTIONAL
  {
    question_code: 'RECEPTIONIST-O01',
    category_code: 'RECEPTIONIST',
    question_type: 'Optional',
    question_text: 'A customer asked about a saree yesterday and said they would confirm their purchase today. How would you make sure you remember to contact them?',
    display_order: 4,
    priority: 1,
    feature_code: 'FEAT_CUSTOMER_FOLLOWUP',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Automatic reminder / follow-up queue.', score: 0, display_order: 1 },
      { option_label: 'Manual notes or phone reminder.', score: 1, display_order: 2 },
      { option_label: 'Rely on memory, frequently missed.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'RECEPTIONIST-O02',
    category_code: 'RECEPTIONIST',
    question_type: 'Optional',
    question_text: 'If three staff members are replying to customers on different phones, how do you know which customer each person is handling?',
    display_order: 5,
    priority: 2,
    feature_code: 'FEAT_SHARED_MGMT',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Centralized team chat dashboard.', score: 0, display_order: 1 },
      { option_label: 'Ask across shop verbally.', score: 1, display_order: 2 },
      { option_label: 'Double-handling and customer confusion.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'RECEPTIONIST-O03',
    category_code: 'RECEPTIONIST',
    question_type: 'Optional',
    question_text: 'A customer who purchased a saree from your shop six months ago messages you again. How would you find their previous purchase details?',
    display_order: 6,
    priority: 3,
    feature_code: 'FEAT_CUSTOMER_HISTORY',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Search by phone number in CRM.', score: 0, display_order: 1 },
      { option_label: 'Scroll WhatsApp chat history.', score: 1, display_order: 2 },
      { option_label: 'Cannot locate past record.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'RECEPTIONIST-O04',
    category_code: 'RECEPTIONIST',
    question_type: 'Optional',
    question_text: 'If the owner is not in the shop and a customer asks about a previous order, how can another staff member help them?',
    display_order: 7,
    priority: 4,
    feature_code: 'FEAT_SHARED_MGMT',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Shared database accessible to staff.', score: 0, display_order: 1 },
      { option_label: 'Staff calls owner on phone.', score: 1, display_order: 2 },
      { option_label: 'Customer must wait for owner to return.', score: 2, display_order: 3 },
    ],
  },

  // ---------------- GROW MAIN ----------------
  {
    question_code: 'GROW-M01',
    category_code: 'GROW',
    question_type: 'Main',
    question_text: 'When you post a saree reel, advertisement or promotion, how do you know whether it actually brings customers or sales to your shop?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_MARKETING_ANALYTICS',
    options: [
      { option_label: 'We track the results.', score: 0, display_order: 1 },
      { option_label: 'We get some indication manually.', score: 1, display_order: 2 },
      { option_label: 'We generally do not know.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'GROW-M02',
    category_code: 'GROW',
    question_type: 'Main',
    question_text: 'How do you identify which saree designs, colours or price ranges are getting the most customer interest?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_DEMAND_ANALYTICS',
    options: [
      { option_label: 'We track this systematically.', score: 0, display_order: 1 },
      { option_label: 'We understand it mainly through manual observation.', score: 1, display_order: 2 },
      { option_label: 'We do not have a reliable way to know.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'GROW-M03',
    category_code: 'GROW',
    question_type: 'Main',
    question_text: 'How do you decide which previous customers should receive information about a new collection or promotion?',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_CUSTOMER_SEGMENT',
    options: [
      { option_label: 'We use customer information or segments.', score: 0, display_order: 1 },
      { option_label: 'We select customers manually.', score: 1, display_order: 2 },
      { option_label: 'We normally send broadly or do not have a structured approach.', score: 2, display_order: 3 },
    ],
  },
  // GROW OPTIONAL
  {
    question_code: 'GROW-O01',
    category_code: 'GROW',
    question_type: 'Optional',
    question_text: 'You are planning tomorrow\'s Instagram posts. How would you decide which sarees to promote?',
    display_order: 4,
    priority: 1,
    feature_code: 'FEAT_DEMAND_ANALYTICS',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Based on top searched / trending inventory analytics.', score: 0, display_order: 1 },
      { option_label: 'Intuition or manual stock count.', score: 1, display_order: 2 },
      { option_label: 'Random selection.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'GROW-O02',
    category_code: 'GROW',
    question_type: 'Optional',
    question_text: 'Many customers have recently asked for a particular saree style that you do not currently have. How would you use that information?',
    display_order: 5,
    priority: 2,
    feature_code: 'FEAT_DEMAND_ANALYTICS',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Record demand logs to inform wholesale purchasing.', score: 0, display_order: 1 },
      { option_label: 'Remember mentally for next stock trip.', score: 1, display_order: 2 },
      { option_label: 'No systematic tracking.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'GROW-O03',
    category_code: 'GROW',
    question_type: 'Optional',
    question_text: 'For a festival sale, how would you decide which previous customers should receive information about the new collection?',
    display_order: 6,
    priority: 3,
    feature_code: 'FEAT_CUSTOMER_SEGMENT',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Segmented VIP / Silk buyer broadcasts.', score: 0, display_order: 1 },
      { option_label: 'Broadcast to entire phone contacts.', score: 1, display_order: 2 },
      { option_label: 'No targeted outreach.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'GROW-O04',
    category_code: 'GROW',
    question_type: 'Optional',
    question_text: 'After running a promotion, how would you decide whether it was successful?',
    display_order: 7,
    priority: 4,
    feature_code: 'FEAT_MARKETING_ANALYTICS',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Compare promo link views vs conversions.', score: 0, display_order: 1 },
      { option_label: 'General feel of WhatsApp message volume.', score: 1, display_order: 2 },
      { option_label: 'Unable to measure return.', score: 2, display_order: 3 },
    ],
  },

  // ---------------- NETWORK MAIN ----------------
  {
    question_code: 'NETWORK-M01',
    category_code: 'NETWORK',
    question_type: 'Main',
    question_text: 'How important are resellers, boutiques or other business partners to your sales?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_RESELLER_NETWORK',
    options: [
      { option_label: 'Very important / regular channel.', score: 0, display_order: 1 },
      { option_label: 'Some importance / occasional.', score: 1, display_order: 2 },
      { option_label: 'Not an important channel.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'NETWORK-M02',
    category_code: 'NETWORK',
    question_type: 'Main',
    question_text: 'How do you share product information and pricing with resellers or business partners?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_WHOLESALE_CATALOGUE',
    options: [
      { option_label: 'We have an organized catalogue/pricing process.', score: 0, display_order: 1 },
      { option_label: 'We handle it manually.', score: 1, display_order: 2 },
      { option_label: 'There is no consistent process.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'NETWORK-M03',
    category_code: 'NETWORK',
    question_type: 'Main',
    question_text: 'How do you control what product, pricing or supplier information each reseller or partner can see?',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_PARTNER_ACCESS',
    options: [
      { option_label: 'We have clear control.', score: 0, display_order: 1 },
      { option_label: 'We manage it manually.', score: 1, display_order: 2 },
      { option_label: 'We do not have a consistent control process.', score: 2, display_order: 3 },
    ],
  },
  // NETWORK OPTIONAL
  {
    question_code: 'NETWORK-O01',
    category_code: 'NETWORK',
    question_type: 'Optional',
    question_text: 'How would you give a reseller access to your latest saree catalogue and pricing?',
    display_order: 4,
    priority: 1,
    feature_code: 'FEAT_WHOLESALE_CATALOGUE',
    trigger_rule: { min_category_percentage: 34, skip_if_no_resellers: true },
    options: [
      { option_label: 'Reseller portal link with dynamic pricing.', score: 0, display_order: 1 },
      { option_label: 'Forward PDF or photos via WhatsApp.', score: 1, display_order: 2 },
      { option_label: 'No organized sharing mechanism.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'NETWORK-O02',
    category_code: 'NETWORK',
    question_type: 'Optional',
    question_text: 'If different resellers receive different prices, how do you make sure the correct price is shared with each one?',
    display_order: 5,
    priority: 2,
    feature_code: 'FEAT_PARTNER_ACCESS',
    trigger_rule: { min_category_percentage: 34, skip_if_no_resellers: true },
    options: [
      { option_label: 'Role-based reseller tier pricing.', score: 0, display_order: 1 },
      { option_label: 'Check manual reseller price chart.', score: 1, display_order: 2 },
      { option_label: 'Frequent pricing errors.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'NETWORK-O03',
    category_code: 'NETWORK',
    question_type: 'Optional',
    question_text: 'Has a reseller ever seen information or supplier details that you did not want their customer to see? How did you handle it?',
    display_order: 6,
    priority: 3,
    feature_code: 'FEAT_PARTNER_ACCESS',
    trigger_rule: { min_category_percentage: 34, skip_if_no_resellers: true },
    options: [
      { option_label: 'Automatic price & logo masking.', score: 0, display_order: 1 },
      { option_label: 'Manual watermarking before sharing.', score: 1, display_order: 2 },
      { option_label: 'Supplier details leaked in past.', score: 2, display_order: 3 },
    ],
  },

  // ---------------- MONEY MAIN ----------------
  {
    question_code: 'MONEY-M01',
    category_code: 'MONEY',
    question_type: 'Main',
    question_text: 'When customers place remote orders and pay an advance, how do you track the payment against the correct order?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_PAYMENT_TRACKING',
    options: [
      { option_label: 'Payment and order are clearly linked.', score: 0, display_order: 1 },
      { option_label: 'We track it manually.', score: 1, display_order: 2 },
      { option_label: 'It can be difficult to match payments to orders.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MONEY-M02',
    category_code: 'MONEY',
    question_type: 'Main',
    question_text: 'If a customer says they have paid an advance but your records do not immediately show the order, how do you resolve it?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_PAYMENT_VERIFY',
    options: [
      { option_label: 'We have a clear process.', score: 0, display_order: 1 },
      { option_label: 'We manually verify it.', score: 1, display_order: 2 },
      { option_label: 'It is difficult to resolve quickly.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MONEY-M03',
    category_code: 'MONEY',
    question_type: 'Main',
    question_text: 'When a customer asks for instalments, financing or delayed payment, how do you handle it?',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_FLEXIBLE_PAYMENTS',
    options: [
      { option_label: 'We have a clear process.', score: 0, display_order: 1 },
      { option_label: 'We handle it case by case.', score: 1, display_order: 2 },
      { option_label: 'We generally cannot support it easily.', score: 2, display_order: 3 },
    ],
  },
  // MONEY OPTIONAL
  {
    question_code: 'MONEY-O01',
    category_code: 'MONEY',
    question_type: 'Optional',
    question_text: 'If a customer says they paid an advance but your records do not immediately show the order, how would you resolve it?',
    display_order: 4,
    priority: 1,
    feature_code: 'FEAT_PAYMENT_VERIFY',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Quickly match payment to order/customer.', score: 0, display_order: 1 },
      { option_label: 'Search bank/UPI records and WhatsApp manually.', score: 1, display_order: 2 },
      { option_label: 'Difficult to reconstruct transaction.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MONEY-O02',
    category_code: 'MONEY',
    question_type: 'Optional',
    question_text: 'If you receive several UPI payments around the same time, how do you match each payment to the correct customer/order?',
    display_order: 5,
    priority: 2,
    feature_code: 'FEAT_PAYMENT_TRACKING',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Unique order payment links with reference ID.', score: 0, display_order: 1 },
      { option_label: 'Ask customers for screenshot receipts.', score: 1, display_order: 2 },
      { option_label: 'Frequent confusion during peak sales.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MONEY-O03',
    category_code: 'MONEY',
    question_type: 'Optional',
    question_text: 'If a customer delays the remaining payment after reserving a saree, how do you track and follow up?',
    display_order: 6,
    priority: 3,
    feature_code: 'FEAT_PAYMENT_TRACKING',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Automated pending balance alert.', score: 0, display_order: 1 },
      { option_label: 'Check physical notepad record.', score: 1, display_order: 2 },
      { option_label: 'Stock locked without follow-up.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MONEY-O04',
    category_code: 'MONEY',
    question_type: 'Optional',
    question_text: 'What was the most recent expensive purchase where the customer asked for instalments or financing?',
    display_order: 7,
    priority: 4,
    feature_code: 'FEAT_FLEXIBLE_PAYMENTS',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Rare and easily handled through existing methods.', score: 0, display_order: 1 },
      { option_label: 'Occasional request.', score: 1, display_order: 2 },
      { option_label: 'Regularly affects high-value sales.', score: 2, display_order: 3 },
    ],
  },

  // ---------------- MARKET MAIN ----------------
  {
    question_code: 'MARKET-M01',
    category_code: 'MARKET',
    question_type: 'Main',
    question_text: 'How do you know where a new customer discovered your shop?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_SOURCE_TRACKING',
    options: [
      { option_label: 'We track the source.', score: 0, display_order: 1 },
      { option_label: 'We ask or identify it manually.', score: 1, display_order: 2 },
      { option_label: 'We generally do not know.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MARKET-M02',
    category_code: 'MARKET',
    question_type: 'Main',
    question_text: 'If a new customer asks, "How do I know this is your real shop?", what do you normally send or show them?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_DIGITAL_TRUST',
    options: [
      { option_label: 'We have a clear trust-building method.', score: 0, display_order: 1 },
      { option_label: 'We explain manually.', score: 1, display_order: 2 },
      { option_label: 'We do not have a consistent method.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MARKET-M03',
    category_code: 'MARKET',
    question_type: 'Main',
    question_text: 'If the exact saree requested by a customer has already been sold, how do you find alternatives?',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_ALT_RECOMMEND',
    options: [
      { option_label: 'We can quickly find alternatives.', score: 0, display_order: 1 },
      { option_label: 'We manually search.', score: 1, display_order: 2 },
      { option_label: 'We struggle to find suitable alternatives.', score: 2, display_order: 3 },
    ],
  },
  // MARKET OPTIONAL
  {
    question_code: 'MARKET-O01',
    category_code: 'MARKET',
    question_type: 'Optional',
    question_text: 'If a new customer says, "How do I know this is your real shop?", what would you send them?',
    display_order: 4,
    priority: 1,
    feature_code: 'FEAT_DIGITAL_TRUST',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Verified shop profile page.', score: 0, display_order: 1 },
      { option_label: 'Shop photos or GST certificate copy.', score: 1, display_order: 2 },
      { option_label: 'No standardized proof available.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MARKET-O02',
    category_code: 'MARKET',
    question_type: 'Optional',
    question_text: 'Show me how you would find three similar sarees if the requested saree is sold.',
    display_order: 5,
    priority: 2,
    feature_code: 'FEAT_ALT_RECOMMEND',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Under 1 minute via visual tag matching.', score: 0, display_order: 1 },
      { option_label: '1–5 minutes browsing gallery.', score: 1, display_order: 2 },
      { option_label: 'More than 5 minutes / cannot easily find.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MARKET-O03',
    category_code: 'MARKET',
    question_type: 'Optional',
    question_text: 'If you receive a new customer through Instagram or WhatsApp, how do you know what made them contact your shop?',
    display_order: 6,
    priority: 3,
    feature_code: 'FEAT_SOURCE_TRACKING',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Link attribution tracking.', score: 0, display_order: 1 },
      { option_label: 'Ask customer verbally during conversation.', score: 1, display_order: 2 },
      { option_label: 'No tracking.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'MARKET-O04',
    category_code: 'MARKET',
    question_type: 'Optional',
    question_text: 'If a customer is comparing your shop with another seller online, how do you communicate why they should trust your shop?',
    display_order: 7,
    priority: 4,
    feature_code: 'FEAT_DIGITAL_TRUST',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Provide official rating badge and authenticity guarantee.', score: 0, display_order: 1 },
      { option_label: 'Argue price/quality verbally.', score: 1, display_order: 2 },
      { option_label: 'Lose deals to online competitors.', score: 2, display_order: 3 },
    ],
  },

  // ---------------- PROVENANCE MAIN ----------------
  {
    question_code: 'PROVENANCE-M01',
    category_code: 'PROVENANCE',
    question_type: 'Main',
    question_text: 'When a customer asks about the maker, origin, weaving technique, authenticity or certification of a saree, how easily can you provide the information?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_SAREE_PROVENANCE',
    options: [
      { option_label: 'We can provide the information easily.', score: 0, display_order: 1 },
      { option_label: 'We can provide some information with manual checking.', score: 1, display_order: 2 },
      { option_label: 'We often do not have the information readily available.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'PROVENANCE-M02',
    category_code: 'PROVENANCE',
    question_type: 'Main',
    question_text: 'How do you keep information about the origin, maker, technique or authenticity of your sarees?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_PROVENANCE_RECORDS',
    options: [
      { option_label: 'Information is systematically maintained.', score: 0, display_order: 1 },
      { option_label: 'Information is maintained manually.', score: 1, display_order: 2 },
      { option_label: 'We do not systematically maintain it.', score: 2, display_order: 3 },
    ],
  },
  // PROVENANCE OPTIONAL
  {
    question_code: 'PROVENANCE-O01',
    category_code: 'PROVENANCE',
    question_type: 'Optional',
    question_text: 'Pick one saree in the shop and explain what information you can provide about its maker, origin, technique or certification.',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_SAREE_PROVENANCE',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Evidence immediately available digitally.', score: 0, display_order: 1 },
      { option_label: 'Verbal details available from owner.', score: 1, display_order: 2 },
      { option_label: 'No documented weaver/origin proof.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'PROVENANCE-O02',
    category_code: 'PROVENANCE',
    question_type: 'Optional',
    question_text: 'If a customer asks whether a saree is authentic, how would you verify and explain it?',
    display_order: 4,
    priority: 2,
    feature_code: 'FEAT_SAREE_PROVENANCE',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Digital GI Tag / Silk Mark verification link.', score: 0, display_order: 1 },
      { option_label: 'Show physical tag or woven label.', score: 1, display_order: 2 },
      { option_label: 'Rely on customer trust alone.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'PROVENANCE-O03',
    category_code: 'PROVENANCE',
    question_type: 'Optional',
    question_text: 'If the same saree is sold again six months later, how would you retrieve its origin or authenticity information?',
    display_order: 5,
    priority: 3,
    feature_code: 'FEAT_PROVENANCE_RECORDS',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Search SKU provenance database.', score: 0, display_order: 1 },
      { option_label: 'Ask supplier or master weaver again.', score: 1, display_order: 2 },
      { option_label: 'Information lost once sold.', score: 2, display_order: 3 },
    ],
  },

  // ---------------- OPERATIONS MAIN ----------------
  {
    question_code: 'OPERATIONS-M01',
    category_code: 'OPERATIONS',
    question_type: 'Main',
    question_text: 'If you receive 20 new sarees tomorrow, how long and how much manual work would it take to prepare them for online selling?',
    display_order: 1,
    priority: 1,
    feature_code: 'FEAT_BULK_ONBOARDING',
    options: [
      { option_label: 'We have a quick organized process.', score: 0, display_order: 1 },
      { option_label: 'It requires significant manual work.', score: 1, display_order: 2 },
      { option_label: 'It is difficult and takes substantial time.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'OPERATIONS-M02',
    category_code: 'OPERATIONS',
    question_type: 'Main',
    question_text: 'How dependent is your business on one owner\'s or one staff member\'s phone for customer communication and important information?',
    display_order: 2,
    priority: 1,
    feature_code: 'FEAT_BUSINESS_CONTINUITY',
    options: [
      { option_label: 'Information is shared and accessible to the team.', score: 0, display_order: 1 },
      { option_label: 'Some important information depends on one person.', score: 1, display_order: 2 },
      { option_label: 'The business heavily depends on one person\'s phone.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'OPERATIONS-M03',
    category_code: 'OPERATIONS',
    question_type: 'Main',
    question_text: 'When there is a damaged parcel, angry customer, payment dispute or online impersonation issue, how do you track and resolve it?',
    display_order: 3,
    priority: 1,
    feature_code: 'FEAT_DISPUTE_MGMT',
    options: [
      { option_label: 'We have a clear process.', score: 0, display_order: 1 },
      { option_label: 'We handle it manually.', score: 1, display_order: 2 },
      { option_label: 'There is no consistent tracking process.', score: 2, display_order: 3 },
    ],
  },
  // OPERATIONS OPTIONAL
  {
    question_code: 'OPERATIONS-O01',
    category_code: 'OPERATIONS',
    question_type: 'Optional',
    question_text: 'If you receive 20 new sarees tomorrow, how would your team get all of them ready for online selling?',
    display_order: 4,
    priority: 1,
    feature_code: 'FEAT_BULK_ONBOARDING',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Repeatable photo batch & auto-tagging workflow.', score: 0, display_order: 1 },
      { option_label: 'Several manual photo edits and manual descriptions.', score: 1, display_order: 2 },
      { option_label: 'Process bottleneck delays launching new stock.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'OPERATIONS-O02',
    category_code: 'OPERATIONS',
    question_type: 'Optional',
    question_text: 'If your main WhatsApp number stopped working tomorrow, what would your customers use to contact you?',
    display_order: 5,
    priority: 2,
    feature_code: 'FEAT_BUSINESS_CONTINUITY',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Central web business account and backup routing.', score: 0, display_order: 1 },
      { option_label: 'Personal phone numbers shared manually.', score: 1, display_order: 2 },
      { option_label: 'High risk of lost customers and communication outage.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'OPERATIONS-O03',
    category_code: 'OPERATIONS',
    question_type: 'Optional',
    question_text: 'If the owner is unavailable for a full day, which customer/order information would become difficult for your team to access?',
    display_order: 6,
    priority: 3,
    feature_code: 'FEAT_BUSINESS_CONTINUITY',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'No info locked; everything in shared store portal.', score: 0, display_order: 1 },
      { option_label: 'Payment confirmations and wholesale quotes locked.', score: 1, display_order: 2 },
      { option_label: 'Most operations pause without owner\'s phone.', score: 2, display_order: 3 },
    ],
  },
  {
    question_code: 'OPERATIONS-O04',
    category_code: 'OPERATIONS',
    question_type: 'Optional',
    question_text: 'When a customer complaint or parcel issue happens, how do you make sure it is not forgotten until it is resolved?',
    display_order: 7,
    priority: 4,
    feature_code: 'FEAT_DISPUTE_MGMT',
    trigger_rule: { min_category_percentage: 34 },
    options: [
      { option_label: 'Logged in issue tracking desk with resolution status.', score: 0, display_order: 1 },
      { option_label: 'WhatsApp chat flagged or noted on paper.', score: 1, display_order: 2 },
      { option_label: 'Frequently forgotten causing customer anger.', score: 2, display_order: 3 },
    ],
  },
];
