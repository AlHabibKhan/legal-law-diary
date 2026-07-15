export interface FAQItem {
  q: string
  a: string
}

export const FAQ_DATA: FAQItem[] = [
  {
    q: 'What is Legal Law Diary?',
    a: 'Legal Law Diary is a practice management tool built for lawyers in Pakistan. It replaces your paper diary, spreadsheets, and filing cabinet with one digital system — case management, hearing diary, client directory, court directory, legal calculators, and an AI-powered legal drafter. It works online and offline, on web and desktop.',
  },
  {
    q: 'What devices can I use it on?',
    a: 'You can use Legal Law Diary on any modern browser (Chrome, Safari, Firefox, Edge). A native Windows and Mac desktop app is also available. Your data syncs live across all devices.',
  },
  {
    q: 'Does it work without internet?',
    a: 'Yes — your data is stored locally by default and syncs to the cloud when online. You can view matters, add diary entries, and use calculators offline. Everything auto-syncs when you reconnect.',
  },
  {
    q: 'How is my data kept secure?',
    a: 'Your data is encrypted in transit (TLS 1.3) and at rest (AES-256). It is stored on Supabase infrastructure with per-firm data isolation. Daily encrypted backups are retained for 30 days.',
  },
  {
    q: 'How long is the free trial?',
    a: '7 days — full feature access, no credit card required. You will be reminded 24 hours before it ends. If you do not subscribe, your data stays safe and you can upgrade anytime.',
  },
  {
    q: 'How does the AI Legal Drafter work?',
    a: 'Select a case type (Civil Suit, Criminal Complaint, Family Case, etc.), enter party details and facts, then pay Rs 500 via JazzCash. The AI generates a court-ready petition in proper Pakistani legal format — numbered facts, legal grounds citing Pakistani statutes, and a formal prayer clause.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'We accept JazzCash, EasyPaisa, NayaPay, SadaPay, and bank transfers (Dubai Islamic Bank, NBP, Mashreq Bank). All payments in Pakistani Rupees (PKR).',
  },
  {
    q: 'Can I use it with a team or firm?',
    a: 'Yes. Team and Firm plans support multiple lawyers with role-based permissions (partner, associate, paralegal). Share client files and matters, track per-lawyer billable hours, and manage team permissions.',
  },
  {
    q: 'How do I back up my data?',
    a: 'Go to Settings → Data Backup. Export your entire database as a JSON file with one click. We recommend backing up at least once a week. You can also import a backup to restore data anytime.',
  },
  {
    q: 'Can I import data from another system?',
    a: 'Yes — import from JSON backup files via Settings → Data Backup. Direct imports from other platforms are available on request during onboarding.',
  },
  {
    q: 'What legal calculators are included?',
    a: 'Five calculators: Limitation Period (Limitation Act 1908), Court Fee (province-wise slabs), Interest on Decree, Date Math, and Case Age. All tailored to Pakistani law.',
  },
  {
    q: 'What if I need help or support?',
    a: 'Email the administrator or use the contact information in the app. Paid plans include WhatsApp support. Enterprise plans include a dedicated account manager.',
  },
  {
    q: 'Is this a substitute for legal advice?',
    a: 'No. Legal Law Diary is a practice management tool — it helps organize your work, but it is not a substitute for professional legal judgment. Always verify court filings, deadlines, and legal documents independently.',
  },
]
