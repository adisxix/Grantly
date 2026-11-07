// Enum arrays used across the app. Keep these as the single source of truth.

export const EDUCATION_LEVELS = [
  'high_school',
  'diploma',
  'undergraduate',
  'postgraduate',
  'doctorate',
]

export const EDUCATION_LABELS = {
  high_school: 'High School / Class 12',
  diploma: 'Diploma',
  undergraduate: 'Undergraduate',
  postgraduate: 'Postgraduate',
  doctorate: 'Doctorate',
}

export const SCHOLARSHIP_TYPES = [
  'merit',
  'need',
  'minority',
  'women',
  'sports',
  'arts',
  'disability',
  'research',
  'first_gen',
  'government',
  'corporate',
]

export const SCHOLARSHIP_TYPE_LABELS = {
  merit: 'Merit-based',
  need: 'Need-based',
  minority: 'Minority',
  women: 'Women',
  sports: 'Sports',
  arts: 'Arts',
  disability: 'Disability',
  research: 'Research',
  first_gen: 'First-generation',
  government: 'Government',
  corporate: 'Corporate',
}

export const DOC_TYPES = [
  'transcript',
  'id_proof',
  'income_certificate',
  'recommendation',
  'resume',
  'essay',
  'photo',
  'category_certificate',
  'other',
]

export const DOC_TYPE_LABELS = {
  transcript: 'Academic Transcript',
  id_proof: 'ID Proof',
  income_certificate: 'Income Certificate',
  recommendation: 'Recommendation Letter',
  resume: 'Resume / CV',
  essay: 'Essay',
  photo: 'Passport Photo',
  category_certificate: 'Category Certificate',
  other: 'Other Document',
}

export const APP_STATUSES = [
  'saved',
  'preparing',
  'submitted',
  'under_review',
  'awarded',
  'rejected',
]

export const APP_STATUS_LABELS = {
  saved: 'Saved',
  preparing: 'Preparing',
  submitted: 'Submitted',
  under_review: 'Under Review',
  awarded: 'Awarded',
  rejected: 'Not Selected',
}

export const APP_STATUS_COLORS = {
  saved: 'slate',
  preparing: 'gold',
  submitted: 'info',
  under_review: 'jade',
  awarded: 'success',
  rejected: 'danger',
}

export const PROVIDER_TYPES = [
  'government',
  'corporate',
  'university',
  'ngo',
  'foundation',
]

export const PROVIDER_LABELS = {
  government: 'Government',
  corporate: 'Corporate',
  university: 'University',
  ngo: 'NGO',
  foundation: 'Foundation',
}

export const FIELDS_OF_STUDY = [
  'Engineering',
  'Medicine',
  'Sciences',
  'Commerce',
  'Law',
  'Arts',
  'Design',
  'Agriculture',
  'Any',
]

export const COUNTRIES = ['India', 'USA', 'UK', 'Canada', 'Australia', 'Germany', 'Singapore']

export const INDIAN_STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal',
]

export const GENDERS = ['female', 'male', 'non-binary', 'other']

export const CATEGORIES = ['General', 'OBC', 'SC', 'ST', 'EWS']

export const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP']

// Static conversion rates relative to USD (offline, no API)
export const CURRENCY_RATES = {
  USD: 1,
  INR: 83.5,
  EUR: 0.92,
  GBP: 0.79,
}

export const CURRENCY_SYMBOLS = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
}

export const DIFFICULTY_LEVELS = ['easy', 'moderate', 'competitive']

export const DIFFICULTY_LABELS = {
  easy: 'Easy Apply',
  moderate: 'Moderate',
  competitive: 'Competitive',
}
