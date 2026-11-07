// (SCHOLARSHIPS not needed here; demo uses relative dates only)

/** @returns {import('./models').StudentProfile} */
export function demoProfile() {
  return {
    id: 'demo-profile',
    fullName: 'Aanya Sharma',
    email: 'aanya@example.com',
    dob: '2005-04-12',
    gender: 'female',
    country: 'India',
    state: 'Karnataka',
    educationLevel: 'undergraduate',
    fieldOfStudy: 'Engineering',
    institution: 'National Institute of Technology',
    yearOfStudy: 2,
    gpaPercent: 82,
    familyIncomeINR: 420000,
    category: 'General',
    firstGen: false,
    hasDisability: false,
    interests: ['stem', 'coding', 'research', 'sustainability'],
    goals: 'I want to become a software engineer working on climate-tech solutions. This scholarship would help me focus on studies instead of worrying about tuition.',
    onboardingComplete: true,
    createdAt: new Date().toISOString(),
  }
}

/** @returns {import('./models').Application[]} */
export function demoApplications() {
  const now = new Date().toISOString()
  const mk = (id, status, checklistItems, extras = {}) => ({
    id,
    scholarshipId: id,
    status,
    notes: '',
    checklist: checklistItems,
    documentIds: [],
    essayIds: [],
    reminders: [7, 3, 1],
    updatedAt: now,
    activity: [{ at: now, text: 'Application created' }],
    ...extras,
  })
  return [
    mk('s01', 'preparing', [
      { id: 'c1', label: 'Upload academic transcript', done: true, docType: 'transcript' },
      { id: 'c2', label: 'Submit income certificate', done: false, docType: 'income_certificate' },
      { id: 'c3', label: 'Provide a recommendation', done: false, docType: 'recommendation' },
      { id: 'c4', label: 'Upload passport photo', done: true, docType: 'photo' },
      { id: 'c5', label: 'Review and submit', done: false },
    ]),
    mk('s02', 'saved', [
      { id: 'c1', label: 'Write essay', done: false },
      { id: 'c2', label: 'Upload transcript', done: false, docType: 'transcript' },
      { id: 'c3', label: 'Get recommendation', done: false, docType: 'recommendation' },
    ]),
    mk('s03', 'submitted', [
      { id: 'c1', label: 'Upload transcript', done: true, docType: 'transcript' },
      { id: 'c2', label: 'Submit income certificate', done: true, docType: 'income_certificate' },
      { id: 'c3', label: 'Write personal essay', done: true },
      { id: 'c4', label: 'Upload academic records', done: true },
      { id: 'c5', label: 'Submit application', done: true },
    ], { submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(), confirmationNo: 'GR-2024-00482' }),
    mk('s05', 'under_review', [
      { id: 'c1', label: 'Register with ID', done: true, docType: 'id_proof' },
      { id: 'c2', label: 'Appear for talent test', done: true },
      { id: 'c3', label: 'Upload mark sheet', done: true, docType: 'transcript' },
      { id: 'c4', label: 'Counselling round', done: true },
    ]),
    mk('s07', 'awarded', [
      { id: 'c1', label: 'Apply online', done: true },
      { id: 'c2', label: 'Submit portfolio link', done: true },
      { id: 'c3', label: 'Write essay', done: true },
      { id: 'c4', label: 'Interview round', done: true },
    ], { amountAwarded: 60000, submittedAt: new Date(Date.now() - 20 * 86400000).toISOString(), confirmationNo: 'GR-2024-00112' }),
    mk('s17', 'rejected', [
      { id: 'c1', label: 'Register on government portal', done: true },
      { id: 'c2', label: 'Fill application', done: true },
      { id: 'c3', label: 'Upload documents', done: true },
    ]),
  ]
}

/** @returns {import('./models').VaultDocument[]} */
export function demoDocuments() {
  const now = new Date().toISOString()
  return [
    { id: 'doc1', name: 'Transcript_2024.pdf', type: 'transcript', size: 248000, mime: 'application/pdf', uploadedAt: now, tags: ['academic'], blobKey: 'grantly:vault:doc1' },
    { id: 'doc2', name: 'Income_Certificate.pdf', type: 'income_certificate', size: 186000, mime: 'application/pdf', uploadedAt: now, tags: ['financial'], blobKey: 'grantly:vault:doc2', expiresAt: new Date(Date.now() + 300 * 86400000).toISOString() },
    { id: 'doc3', name: 'Passport_Photo.jpg', type: 'photo', size: 96000, mime: 'image/jpeg', uploadedAt: now, tags: ['id'], blobKey: 'grantly:vault:doc3' },
  ]
}

/** @returns {import('./models').Essay[]} */
export function demoEssays() {
  const now = new Date().toISOString()
  return [
    {
      id: 'essay1',
      title: 'Lumina Women in STEM Essay',
      scholarshipId: 's02',
      promptId: 'ep1',
      html: '<p>During the monsoon of 2023, my city faced devastating floods that displaced thousands. I built a <strong>rainfall prediction app</strong> using Python and a simple neural network, giving families a 6-hour warning window. That experience taught me that technology is not just code — it is a lifeline.</p><p>I want to study machine learning to build climate-resilient systems for communities that need them most.</p>',
      wordLimit: 500,
      versions: [{ at: now, html: '<p>Draft in progress.</p>' }],
      updatedAt: now,
    },
  ]
}

/** Load all demo data into the stores. */
export function loadDemoData() {
  const profile = demoProfile()
  const applications = demoApplications()
  const documents = demoDocuments()
  const essays = demoEssays()
  return { profile, applications, documents, essays }
}
