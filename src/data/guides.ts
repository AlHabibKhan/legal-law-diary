export interface Guide {
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  date: string
  readTime: string
  author?: string
}

export const GUIDES: Guide[] = [
  {
    slug: 'managing-case-diary-digitally',
    title: 'How Lawyers in Pakistan Can Manage Their Case Diary Digitally',
    excerpt: 'The paper diary has served Pakistani advocates for a century. Here is why it is time to move your cause list, hearings and deadlines into one secure digital system.',
    category: 'Practice Management',
    date: '18 June 2026',
    readTime: '7 min read',
    content: `For over a century, the paper diary has been the backbone of every advocate's practice in Pakistan. But as court caseloads grow and clients expect faster responses, the limitations of paper are becoming impossible to ignore.

## Why Go Digital?

**Never lose an entry.** Paper diaries get lost, damaged, or simply misplaced during court recess. A digital diary is backed up automatically and accessible from any device.

**Instant search.** Finding a specific hearing date, case number, or client name takes seconds with digital search — no flipping through hundreds of pages.

**Share with your team.** If you work with juniors or partners, a digital diary means everyone sees the same schedule in real time.

## Key Features to Look For

1. **Calendar view** — See your month at a glance with hearing dates highlighted
2. **Case linking** — Each diary entry should link back to the full case file
3. **Reminders** — Automatic notifications before each hearing
4. **Export** — Generate PDF reports for your records or to share with clients

## Making the Switch

Start by entering your upcoming hearings for the next month. Once comfortable, migrate your entire cause list. Most lawyers find they save 2-3 hours per week once fully transitioned.`,
  },
  {
    slug: 'court-fees-pakistan-complete-guide',
    title: 'Court Fees in Pakistan: A Complete Guide for Lawyers (2026)',
    excerpt: 'Ad valorem or fixed? Filer or non-filer? Court-fee miscalculations delay filings and frustrate clients. A clear 2026 reference for advocates across Pakistan.',
    category: 'Pakistani Law',
    date: '12 June 2026',
    readTime: '8 min read',
    content: `Court fee calculation remains one of the most common sources of filing delays in Pakistani courts. This guide covers the basics every advocate must know.

## Types of Court Fees

**Ad Valorem Fees** — Calculated as a percentage of the suit value. Used in money suits, property disputes, and recovery cases. The percentage varies by province and by the amount claimed.

**Fixed Fees** — A flat amount regardless of case value. Common in family cases, constitutional petitions, and certain criminal matters.

## Province-Wise Differences

Each province in Pakistan has its own Court Fees Act with different slab rates:

- **Punjab** — Uses the Punjab Court Fees Act with slabs from 1% to 7.5%
- **Sindh** — Similar structure but different threshold amounts
- **Khyber Pakhtunkhwa** — Follows the KP Court Fees Act
- **Balochistan** — Separate schedule with lower rates for rural districts
- **Islamabad (ICT)** — Federal rates apply

## Common Mistakes

1. **Under-stamping** — The most expensive mistake. An insufficiently stamped plaint is rejected at the outset.
2. **Wrong valuation** — Incorrectly valuing the suit leads to wrong fee calculation.
3. **Ignoring exemptions** — Certain classes of suits (indigent persons, government suits) may be exempt.

## Using the Calculator

Our Court Fee Calculator (available in the Tools section) handles province-wise slab calculations automatically. Simply select your province and enter the suit value to get the correct fee.`,
  },
  {
    slug: 'limitation-act-1908-deadlines',
    title: 'The Limitation Act 1908: Deadlines That Can Make or Break Your Case',
    excerpt: 'Limitation is the silent killer of good cases. A refresher on the periods every advocate in Pakistan must track — and why a calculator beats memory.',
    category: 'Pakistani Law',
    date: '5 June 2026',
    readTime: '7 min read',
    content: `The Limitation Act 1908 is one of the most critical statutes in Pakistani civil procedure. Missing a limitation period does not just lose an opportunity — it extinguishes the remedy forever.

## Key Limitation Periods

| Period | Type of Suit |
|--------|-------------|
| 90 days | Appeal from Magistrate's order |
| 180 days | Civil Appeal to District Court |
| 1 year | Criminal Appeal to High Court |
| 2 years | Tort / Damages |
| 3 years | Civil Suit (Specific Performance) |
| 5 years | Execution of Decree |
| 6 years | Written Contract |
| 10 years | Recovery of Land |
| 30 years | Right to Property |

## When Does Time Start?

Time begins to run from the date the cause of action accrues — the date on which the plaintiff's right to sue first arises. Special provisions exist for:

- **Fraud** — Time runs from discovery of fraud
- **Disability** — Minors and persons of unsound mind get extensions
- **Continuing breaches** — Fresh period starts with each breach

## Limitation Is Procedural, Not Substantive

The Limitation Act bars the remedy, not the right. However, once the period expires, the court will not entertain the suit. There is no discretion to condone delay except under Section 5 of the Act (for appeals and certain applications).

## Practical Tips

1. **Calculate immediately** — As soon as you receive a brief, calculate the limitation period
2. **Diary it** — Enter the expiry date in your case diary with a reminder well before the deadline
3. **Use the calculator** — Our Limitation Calculator handles the date math automatically
4. **File early** — Never file on the last day if you can help it`,
  },
  {
    slug: 'vakalatnama-power-of-attorney-pakistan',
    title: 'Vakalatnama Explained: Drafting Power of Attorney for Pakistani Courts',
    excerpt: 'The vakalatnama is the first document in every matter — and the one most often done carelessly. A guide to general, special and overseas authority.',
    category: 'Pakistani Law',
    date: '29 May 2026',
    readTime: '6 min read',
    content: `The vakalatnama (power of attorney) is the foundational document that authorises an advocate to appear and act on behalf of a client in court. Despite its importance, it is often treated as a formality.

## Types of Vakalatnama

**General Vakalatnama** — Authorises the advocate to represent the client in all matters related to a specific case, including filing pleadings, arguing before the court, and receiving documents.

**Special Vakalatnama** — Limits the advocate's authority to specific acts — for example, only to file a written statement or only to argue a particular application.

**Overseas Vakalatnama** — Used when the client is abroad. Must be attested by the Pakistani embassy or consulate in the client's country of residence.

## Essential Clauses

Every vakalatnama should clearly state:
1. The court in which the advocate is authorised to appear
2. The case number and title (if known)
3. The specific powers granted to the advocate
4. The client's full name, CNIC, and address
5. The date and place of execution

## Common Errors

- **Blank vakalatnama** — Never sign a blank vakalatnama. It can be filled in later with unauthorised terms.
- **Wrong court** — A vakalatnama filed in the wrong court is invalid.
- **Expired authority** — The vakalatnama remains valid until the final disposal of the case or until revoked in writing.

Our Vakalatnama Generator (coming soon) will auto-draft General, Special, and Overseas vakalatnama forms based on your case details.`,
  },
  {
    slug: 'trust-accounts-client-money-pakistan',
    title: 'Trust Accounts and Client Money: Compliance Tips for Pakistani Law Firms',
    excerpt: 'Holding client money is a position of trust — and a source of professional risk. How firms in Pakistan can keep a clean, defensible client ledger.',
    category: 'Compliance',
    date: '22 May 2026',
    readTime: '6 min read',
    content: `Handling client money is one of the highest-risk activities in legal practice. Bar Councils in Pakistan treat trust account violations seriously, and the consequences of mismanagement can include suspension or disbarment.

## What Is a Trust Account?

A trust account (or client account) is a separate bank account used exclusively to hold money belonging to clients. This includes:
- Advance payments for legal fees
- Settlement proceeds held pending distribution
- Court deposits and security amounts
- Money held on behalf of third parties

## Bar Council Requirements

The Pakistan Bar Council and provincial Bar Councils require:
1. **Separate ledger** — Client money must never be mixed with office funds
2. **Detailed records** — Every deposit and withdrawal must be recorded with the client's name, date, and purpose
3. **Monthly reconciliation** — The ledger must be reconciled with bank statements monthly
4. **Audit trail** — All transactions must be traceable and auditable

## Best Practices

1. **Open a dedicated account** — Use a separate bank account exclusively for client funds
2. **Use accounting software** — Manual ledgers are error-prone; use digital trust accounting
3. **Never borrow from client accounts** — Even temporarily — this is the most common cause of Bar Council action
4. **Release funds promptly** — When a matter concludes, return any unspent balance immediately

## How Legal Law Diary Helps

Our Trust Account module provides a separate ledger with withdrawal-approval workflow, automated reconciliation reports, and exportable audit logs.`,
  },
  {
    slug: 'time-tracking-billing-lawyers-pakistan',
    title: 'Time Tracking and Billing for Lawyers in Pakistan: Stop Losing Billable Hours',
    excerpt: 'Most lawyers undercharge — not by choice, but because unrecorded work simply vanishes. How to capture every hour without turning into an accountant.',
    category: 'Billing & Finance',
    date: '15 May 2026',
    readTime: '6 min read',
    content: `The most valuable asset a lawyer has is time. Yet most lawyers in Pakistan bill far fewer hours than they actually work — not because they are not working, but because they are not tracking.

## The Problem

A typical day includes: 15 minutes here reviewing a file, 20 minutes there on a client call, 10 minutes drafting a note. Individually, these are easy to forget. Collectively, they represent hours of unbilled work every day.

## Why Track Time?

1. **Increase revenue** — Lawyers who track time bill 20-40% more than those who do not
2. **Client transparency** — Itemised bills build trust and reduce disputes
3. **Practice insights** — See which types of work take the most time and adjust your practice accordingly

## How to Track

**Real-time tracking** — Start a timer when you begin work on a matter and stop it when done. This is the most accurate method.

**Manual entry** — If you forget to start the timer, log the time at the end of the day. Less accurate but better than nothing.

**Per-matter tracking** — Always associate time entries with a specific case or client for meaningful reports.

## Our Time Tracking Feature

Legal Law Diary includes a built-in timer with:
- One-click start/stop
- Manual entry option
- Case and matter association
- Billable/non-billable toggle
- Daily, weekly, and monthly summaries

Start using it today — you will be surprised how much time you were leaving on the table.`,
  },
  {
    slug: 'build-online-profile-lawyer-pakistan',
    title: 'How to Build a Standout Online Profile as a Lawyer in Pakistan',
    excerpt: 'Clients now search before they call. A clear, verified online profile is becoming the modern equivalent of a good reputation in the bar room.',
    category: 'Career & Growth',
    date: '8 May 2026',
    readTime: '6 min read',
    content: `In 2026, the first impression most potential clients have of you is not in the courtroom or chamber — it is online. A well-crafted online profile can be the difference between a full practice and a quiet one.

## Why Online Profiles Matter

- Clients search Google before calling a lawyer
- A verified profile signals professionalism and trustworthiness
- Your online presence works for you 24/7, even while you are in court

## What to Include

1. **Professional photo** — A clear, professional headshot
2. **Practice areas** — List your specialisations (civil, criminal, family, property, etc.)
3. **Qualifications** — Bar Council membership, degrees, certifications
4. **Contact information** — Chamber address, phone, email
5. **Languages** — English, Urdu, and any regional languages you speak
6. **Experience** — Years of practice, notable cases (with client permission)

## Verification Matters

A verified profile (with a blue tick) carries more weight than an unverified one. Verification confirms that you are a licensed advocate in good standing with your Bar Council.

## Where to Profile

Legal Law Diary's Marketplace (coming in a future update) will feature verified lawyer profiles searchable by the public — giving you visibility while keeping your practice management consolidated in one platform.`,
  },
  {
    slug: 'stamp-paper-pakistan-province-guide',
    title: 'Stamp Paper in Pakistan: A Province-by-Province Guide for 2026',
    excerpt: 'Stamp duty varies by province and by instrument, and an under-stamped document is a problem waiting to surface. A practical reference for advocates.',
    category: 'Pakistani Law',
    date: '2 May 2026',
    readTime: '7 min read',
    content: `Stamp paper is the foundation of every legal instrument in Pakistan, yet advocates regularly encounter problems with incorrect stamp duty. This guide provides a province-by-province overview.

## What Is Stamp Duty?

Stamp duty is a tax levied on legal documents (instruments) under the Stamp Act 1899. The duty varies based on:
- The type of instrument (sale deed, agreement, affidavit, etc.)
- The value of the transaction
- The province where the document is executed

## Province-Wise Stamp Duty Rates (2026)

**Punjab** — Highest rates. Sale deeds: 5% of property value. Agreements: Rs 500-5,000 depending on type.

**Sindh** — Sale deeds: 4% of property value. Lower rates for certain categories.

**Khyber Pakhtunkhwa** — Sale deeds: 3% of property value. Reduced rates for rural areas.

**Balochistan** — Sale deeds: 2% of property value. Lowest rates in the country.

**Islamabad (ICT)** — Federal rates apply. Sale deeds: 4% of property value.

## Common Instruments and Their Stamp Duty

| Instrument | Typical Duty |
|------------|-------------|
| Sale Deed | 2-5% of value (varies by province) |
| Agreement | Rs 500-5,000 |
| Affidavit | Rs 100-500 |
| Power of Attorney | Rs 500-2,000 |
| Lease Deed | 1-2% of annual rent |

## Practical Tips

1. **Always check the current rate** — Provincial budgets can change stamp duty rates annually
2. **Buy the right denomination** — An under-stamped document can be impounded; over-stamping wastes money
3. **E-stamping** — Some provinces now offer electronic stamp paper, which is more secure and convenient`,
  },
  {
    slug: 'filing-deadlines-cpc-crpc-pakistan',
    title: 'Filing Deadlines Under CPC and CrPC: What Every Advocate Must Know',
    excerpt: 'Procedural deadlines decide more cases than people admit. A refresher on the time limits hiding inside the Civil and Criminal Procedure Codes.',
    category: 'Pakistani Law',
    date: '18 April 2026',
    readTime: '7 min read',
    content: `The Civil Procedure Code (CPC) 1908 and Criminal Procedure Code (CrPC) 1898 are filled with deadlines that can determine the fate of a case. Missing them can mean losing the right to file, defend, or appeal.

## CPC Deadlines

**Written Statement (Order 8 Rule 1)** — 30 days from service of summons, extendable up to 90 days by court order. After that, the defence is struck off.

**Discovery and Inspection** — 14 days from the order for discovery. Non-compliance can result in the pleadings being struck out.

**Issues Framing** — The court shall frame issues at the first hearing after the written statement is filed.

**Limitation for Appeals (Section 96)** — 90 days for appeals from original decrees; 30 days for appeals from appellate decrees.

## CrPC Deadlines

**Challan (Report under Section 173)** — Police must complete investigation and submit challan within 14 days for cognizable offences where the accused is in custody (extendable up to 60-90 days).

**Bail Applications** — Courts typically hear urgent bail applications within 24-48 hours.

**Appeals** — Criminal appeals to the High Court: 30 days from the date of the order/judgment.

## Common Pitfalls

1. **Counting days incorrectly** — Always exclude the first day and include the last day in limitation
2. **Court holidays** — If the last day falls on a holiday, the next working day counts
3. **Section 5 of Limitation Act** — Delay in appeals can be condoned if sufficient cause is shown, but the standard is strict`,
  },
  {
    slug: 'going-paperless-document-management-pakistan',
    title: 'Going Paperless: Document Management for Pakistani Legal Practices',
    excerpt: 'Files in cupboards, photocopies in folders, the one document nobody can find. How Pakistani chambers can go paperless without losing the paper trail.',
    category: 'Legal Tech',
    date: '10 April 2026',
    readTime: '6 min read',
    content: `The image of a lawyer's chamber buried in paper files is familiar across Pakistan. But the shift to digital is not just about saving trees — it is about finding the right document in seconds instead of hours.

## Why Go Paperless?

1. **Instant retrieval** — Search for any document by case number, client name, or keyword
2. **Space savings** — No more filing cabinets taking up valuable chamber space
3. **Security** — Digital documents can be encrypted, backed up, and access-controlled
4. **Collaboration** — Share documents with clients and colleagues instantly

## How to Start

**Step 1: Scan existing files** — Start with your active cases. Scan each document and name it consistently (e.g., CaseNumber_DocumentType_Date).

**Step 2: Go digital for new matters** — From today forward, create all new documents digitally by default.

**Step 3: Organise by case** — Every document should be linked to its case file for easy retrieval.

**Step 4: Back up regularly** — Digital is useless without backups. Follow the 3-2-1 rule: three copies, on two different media, with one offsite.

## Document Types to Digitise

- Court orders and judgments
- Pleadings (plaints, written statements, applications)
- Client correspondence
- Evidence and exhibits
- Fee notes and receipts

## Legal Law Diary's Document Features

Our Document Management module supports uploading, organising, and retrieving documents by case. Each document stores its type, notes, and upload date for easy reference.`,
  },
  {
    slug: 'future-legal-tech-pakistan-2026',
    title: 'The Future of Legal Tech in Pakistan: Why 2026 Is the Tipping Point',
    excerpt: 'Cheap smartphones, fast internet, a young bar and rising client expectations. The conditions for legal technology in Pakistan have finally aligned.',
    category: 'Legal Tech',
    date: '3 April 2026',
    readTime: '7 min read',
    content: `For years, legal technology in Pakistan lagged behind other sectors. But 2026 marks a turning point. Several factors have converged to make now the right time for Pakistani lawyers to embrace technology.

## The Perfect Storm

**Affordable smartphones** — A decent smartphone now costs under Rs 15,000. Internet penetration in urban areas exceeds 80%.

**Improved connectivity** — 4G coverage now reaches most district courts. 5G is rolling out in major cities.

**A young bar** — Over 60% of Pakistan's active advocates are under 40 and comfortable with digital tools.

**Client expectations** — Clients increasingly expect digital communication, online scheduling, and instant updates on their cases.

## What Is Changing

1. **Case management** — Moving from paper diaries to digital case management
2. **Client communication** — WhatsApp and email replacing in-person updates
3. **Legal research** — Online databases supplementing (but not replacing) traditional law reports
4. **Court digitisation** — Higher courts are increasingly accepting electronic filings

## What This Means for You

The lawyers who adopt technology now will have a significant advantage over those who wait. Efficiency gains of 20-30% are common for early adopters. The cost of not adopting — lost time, lost clients, and lost revenue — will only grow.

## Getting Started

Start small. Pick one area — case diary, time tracking, or document management — and digitise it first. Once comfortable, expand to other areas. Legal Law Diary is designed to grow with you.`,
  },
]
