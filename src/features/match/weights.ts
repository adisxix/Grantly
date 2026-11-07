// Weights for the soft-score portion of the match engine. Sums to 100.
export const MATCH_WEIGHTS = {
  level: 20,        // education level alignment
  field: 20,        // field of study alignment
  academics: 20,    // GPA vs minimum
  financialNeed: 15, // family income vs ceiling
  geography: 10,    // country / state
  demographics: 10,  // category, gender, first-gen, disability
  interests: 5,     // interest and tag overlap
}

export const VERDICT_THRESHOLDS = {
  eligible: 85,
  partial: 65,
}
