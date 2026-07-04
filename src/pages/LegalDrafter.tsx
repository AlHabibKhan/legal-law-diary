import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { supabaseDb } from '@/lib/db-supabase'
import type { PaymentMethod, SubscriptionPlan } from '@/types'
import { ArrowLeft, Loader2, CheckCircle, Copy, FileText } from 'lucide-react'

// ── Pakistani legal case types ──────────────────────────────────────────────
const CASE_TYPES = [
  { value: "civil_suit", label: "Civil Suit", law: "CPC 1908", icon: "⚖️" },
  { value: "criminal_complaint", label: "Criminal Complaint / FIR", law: "CrPC / PPC", icon: "🔒" },
  { value: "family_case", label: "Family Case (Divorce / Khula / Custody)", law: "MFLO 1961 / FSC", icon: "👨‍👩‍👧" },
  { value: "property_dispute", label: "Property / Land Dispute", law: "Transfer of Property Act", icon: "🏠" },
  { value: "tenancy", label: "Rent / Tenancy Dispute", law: "Rent Restriction Ordinance", icon: "🏢" },
  { value: "constitutional_petition", label: "Constitutional Petition (Writ)", law: "Constitution Art. 199", icon: "📜" },
  { value: "service_matter", label: "Service / Employment Matter", law: "Service Tribunals Act", icon: "💼" },
  { value: "consumer_complaint", label: "Consumer Court Complaint", law: "Consumer Protection Act", icon: "🛒" },
  { value: "banking", label: "Banking / Loan Recovery", law: "Financial Institutions Ordinance", icon: "🏦" },
  { value: "inheritance", label: "Inheritance / Succession", law: "Succession Act / Muslim Personal Law", icon: "📋" },
  { value: "defamation", label: "Defamation / Libel", law: "PECA / Defamation Ordinance", icon: "📣" },
  { value: "cyber_crime", label: "Cyber Crime / Online Fraud", law: "PECA 2016", icon: "💻" },
]

const COURTS = [
  "Civil Court / District Court",
  "Sessions Court",
  "High Court (LHC / SHC / PHC / BHC)",
  "Supreme Court of Pakistan",
  "Family Court",
  "Consumer Court",
  "Federal Service Tribunal",
  "Provincial Service Tribunal",
  "Banking Court",
  "Anti-Corruption Court",
  "Federal Shariat Court",
]

const PROVINCES = [
  "Punjab", "Sindh", "Khyber Pakhtunkhwa", "Balochistan",
  "Islamabad Capital Territory", "Azad Jammu & Kashmir", "Gilgit-Baltistan",
]

const STEPS = [
  { id: 1, label: "Case Type" },
  { id: 2, label: "Parties" },
  { id: 3, label: "Facts" },
  { id: 4, label: "Relief" },
  { id: 5, label: "Payment" },
  { id: 6, label: "Draft" },
]

// ── System prompt for Gemini API ───────────────────────────────────────────
function buildSystemPrompt(form: Record<string, any>) {
  return `You are a senior Pakistani advocate with 25+ years of experience in ${form.caseType?.label || "civil and criminal"} matters before all courts of Pakistan including the Supreme Court.

You draft formal legal documents in the professional style used in Pakistani courts — following the Code of Civil Procedure 1908, Criminal Procedure Code, and relevant Pakistani statutes.

DRAFTING RULES:
1. Use formal Pakistani legal language (English, with Urdu legal terms where conventional)
2. Begin with the correct court heading and case caption
3. Structure: Heading → Parties → Respectful Introduction → Statement of Facts (numbered paragraphs) → Legal Grounds (citing Pakistani statutes/judgments) → Prayer/Relief
4. Cite relevant sections of Pakistani law (PPC, CPC, CrPC, Constitution 1973, etc.)
5. Reference relevant SCMR, PLD, or MLD precedents where applicable
6. End with a formal Prayer clause listing specific reliefs sought
7. Include place, date placeholder and advocate signature block at end
8. Keep tone authoritative, formal, and court-appropriate
9. Do NOT hallucinate case citations — only cite laws you are certain about
10. Mark uncertain citations with [VERIFY CITATION] for lawyer review

Province/Jurisdiction: ${form.province || "Punjab"}
Court: ${form.court || "District Court"}
Case Type: ${form.caseType?.label || "Civil Matter"}
Applicable Law: ${form.caseType?.law || "CPC 1908"}`
}

function buildUserPrompt(form: Record<string, any>) {
  return `Draft a complete ${form.caseType?.label || "legal petition"} with the following details:

COMPLAINANT / PETITIONER:
Name: ${form.complainantName || "N/A"}
CNIC: ${form.complainantCnic || "N/A"}
Address: ${form.complainantAddress || "N/A"}
Contact: ${form.complainantPhone || "N/A"}

RESPONDENT / DEFENDANT / ACCUSED:
Name: ${form.respondentName || "N/A"}
Address: ${form.respondentAddress || "N/A"}
Relationship to Petitioner: ${form.relationship || "N/A"}

CASE FACTS (as narrated by client):
${form.facts || "No facts provided."}

DATE OF INCIDENT / CAUSE OF ACTION:
${form.incidentDate || "Not specified"}

EVIDENCE / DOCUMENTS AVAILABLE:
${form.evidence || "None mentioned"}

WITNESSES (if any):
${form.witnesses || "None mentioned"}

SPECIFIC RELIEF / PRAYER SOUGHT:
${form.prayer || "As per applicable law"}

ADDITIONAL NOTES:
${form.additionalNotes || "None"}

Please draft a complete, court-ready ${form.caseType?.label} for filing before the ${form.court || "District Court"}, ${form.province || "Punjab"}. Include all formal sections, numbered facts, legal grounds citing Pakistani law, and a specific Prayer clause.`
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function LegalDrafter() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<Record<string, any>>({})
  const [draft, setDraft] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  // Payment state
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [legalDraftPlan, setLegalDraftPlan] = useState<SubscriptionPlan | null>(null)
  const [paymentForm, setPaymentForm] = useState({ transaction_id: '', sender_name: '', sender_account: '' })
  const [paymentSubmitting, setPaymentSubmitting] = useState(false)
  const [paymentDone, setPaymentDone] = useState(false)

  const draftRef = useRef<HTMLDivElement>(null)

  const update = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  // Load payment data when reaching step 5
  useEffect(() => {
    if (step === 5) loadPaymentData()
  }, [step])

  async function loadPaymentData() {
    try {
      const methods = await supabaseDb.getActivePaymentMethods()
      setPaymentMethods(methods.filter(m => m.type === 'jazzcash'))
      const { data } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('slug', 'legal-draft')
        .single()
      setLegalDraftPlan(data as SubscriptionPlan)
    } catch (e) {
      console.error('Failed to load payment data', e)
    }
  }

  const canProceed = () => {
    if (step === 1) return !!form.caseType
    if (step === 2) return form.complainantName && form.respondentName
    if (step === 3) return form.facts && form.facts.length > 30
    if (step === 4) return !!form.prayer
    if (step === 5) return paymentDone
    return true
  }

  async function handlePayment() {
    if (!legalDraftPlan || !paymentMethods.length) return
    setPaymentSubmitting(true)
    setError("")
    try {
      await supabaseDb.createPaymentRequest({
        plan_id: legalDraftPlan.id,
        payment_method_id: paymentMethods[0].id,
        amount: 500,
        transaction_id: paymentForm.transaction_id,
        sender_name: paymentForm.sender_name,
        sender_account: paymentForm.sender_account || undefined,
        notes: `Payment for AI Legal Draft: ${form.caseType?.label || "Legal Document"}`,
      })
      setPaymentDone(true)
    } catch (e: any) {
      setError("Payment submission failed: " + (e.message || "Unknown error"))
    } finally {
      setPaymentSubmitting(false)
    }
  }

  const generateDraft = async () => {
    if (!paymentDone) return
    setLoading(true)
    setError("")
    setDraft("")
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY
      if (!apiKey) throw new Error('Gemini API key not configured. Set VITE_GEMINI_API_KEY in .env')

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: buildSystemPrompt(form) }]
            },
            contents: [
              {
                role: "user",
                parts: [{ text: buildUserPrompt(form) }]
              }
            ],
            generationConfig: {
              maxOutputTokens: 4000,
              temperature: 0.7,
            }
          }),
        }
      )
      const data = await res.json()
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error))
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""
      if (!text) throw new Error("Empty response from AI. The API key may be invalid.")
      setDraft(text)
      setStep(6)
      setTimeout(() => draftRef.current?.scrollIntoView({ behavior: "smooth" }), 300)
    } catch (e: any) {
      setError("Draft generation failed: " + e.message)
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate draft when payment is done
  useEffect(() => {
    if (paymentDone && step === 5) {
      generateDraft()
    }
  }, [paymentDone])

  const copyDraft = () => {
    navigator.clipboard.writeText(draft).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const reset = () => { setForm({}); setDraft(""); setStep(1); setError(""); setPaymentDone(false); setPaymentForm({ transaction_id: '', sender_name: '', sender_account: '' }) }

  return (
    <div style={{
      fontFamily: "'Georgia', 'Times New Roman', serif",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0a1628 0%, #0d2240 50%, #0a1628 100%)",
      padding: "0",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(90deg, #0a1628, #1a3a5c)",
        borderBottom: "3px solid #c9a84c",
        padding: "18px 32px",
        display: "flex",
        alignItems: "center",
        gap: "16px",
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: "transparent",
          border: "1px solid #1e3d5c",
          color: "#8fb3d3",
          padding: "6px 14px",
          borderRadius: "6px",
          cursor: "pointer",
          fontFamily: "sans-serif",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}>
          <ArrowLeft size={14} /> Back
        </button>
        <div style={{
          width: "48px", height: "48px",
          background: "linear-gradient(135deg, #c9a84c, #e8c86e)",
          borderRadius: "8px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "22px", flexShrink: 0,
        }}>⚖️</div>
        <div>
          <div style={{ color: "#c9a84c", fontWeight: "700", fontSize: "20px", letterSpacing: "0.5px" }}>
            Legal Case Drafter
          </div>
          <div style={{ color: "#8fb3d3", fontSize: "13px", marginTop: "2px" }}>
            Pakistani Law · Draft with Prayer
          </div>
        </div>
        <div style={{ marginLeft: "auto", color: "#c9a84c", fontSize: "12px", textAlign: "right" }}>
          <div style={{ fontWeight: "600" }}>legal-diary.com</div>
          <div style={{ color: "#5a8ab5" }}>Always verify with your advocate</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{
        background: "#0a1f35",
        borderBottom: "1px solid #1e3d5c",
        padding: "12px 32px",
        display: "flex",
        gap: "8px",
        overflowX: "auto",
      }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <div style={{
              width: "28px", height: "28px",
              borderRadius: "50%",
              background: step > s.id ? "#c9a84c" : step === s.id ? "#1a5276" : "#0d2d47",
              border: `2px solid ${step >= s.id ? "#c9a84c" : "#1e3d5c"}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: step > s.id ? "#0a1628" : step === s.id ? "#c9a84c" : "#4a7a9b",
              fontSize: "12px", fontWeight: "700",
            }}>
              {step > s.id ? "✓" : s.id}
            </div>
            <span style={{
              fontSize: "12px",
              color: step === s.id ? "#c9a84c" : step > s.id ? "#8fb3d3" : "#4a7a9b",
              fontFamily: "sans-serif",
            }}>{s.label}</span>
            {i < STEPS.length - 1 && (
              <div style={{ width: "24px", height: "1px", background: "#1e3d5c", margin: "0 4px" }} />
            )}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: "780px", margin: "0 auto", padding: "32px 24px" }}>

        {/* ── STEP 1: Case Type ── */}
        {step === 1 && (
          <div>
            <SectionTitle>Select Case Type</SectionTitle>
            <p style={{ color: "#8fb3d3", fontFamily: "sans-serif", fontSize: "14px", marginBottom: "24px" }}>
              Choose the nature of the matter to get the correct Pakistani legal framework and applicable statutes.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "12px" }}>
              {CASE_TYPES.map(ct => (
                <div
                  key={ct.value}
                  onClick={() => update("caseType", ct)}
                  style={{
                    background: form.caseType?.value === ct.value
                      ? "linear-gradient(135deg, #1a3a5c, #0d2d47)"
                      : "#0d1f33",
                    border: `2px solid ${form.caseType?.value === ct.value ? "#c9a84c" : "#1e3d5c"}`,
                    borderRadius: "8px",
                    padding: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                >
                  <div style={{ fontSize: "22px", marginBottom: "6px" }}>{ct.icon}</div>
                  <div style={{
                    color: form.caseType?.value === ct.value ? "#c9a84c" : "#d4e6f3",
                    fontSize: "14px", fontWeight: "600", fontFamily: "sans-serif", marginBottom: "4px",
                  }}>{ct.label}</div>
                  <div style={{ color: "#5a8ab5", fontSize: "11px", fontFamily: "sans-serif" }}>{ct.law}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: Parties ── */}
        {step === 2 && (
          <div>
            <SectionTitle>Parties to the Case</SectionTitle>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <CardBox title="Complainant / Petitioner">
                  <Field label="Full Name *" value={form.complainantName} onChange={v => update("complainantName", v)} placeholder="Muhammad Ali Khan" />
                  <Field label="CNIC No." value={form.complainantCnic} onChange={v => update("complainantCnic", v)} placeholder="35202-1234567-1" />
                  <Field label="Address" value={form.complainantAddress} onChange={v => update("complainantAddress", v)} placeholder="House 12, Street 4, Gulberg, Lahore" rows={2} />
                  <Field label="Phone" value={form.complainantPhone} onChange={v => update("complainantPhone", v)} placeholder="0300-1234567" />
                </CardBox>
              </div>
              <div>
                <CardBox title="Respondent / Defendant / Accused">
                  <Field label="Full Name *" value={form.respondentName} onChange={v => update("respondentName", v)} placeholder="Respondent's name" />
                  <Field label="Address" value={form.respondentAddress} onChange={v => update("respondentAddress", v)} placeholder="Respondent's address" rows={2} />
                  <Field label="Relationship to Petitioner" value={form.relationship} onChange={v => update("relationship", v)} placeholder="e.g. Landlord / Brother / Employer" />
                </CardBox>
              </div>
            </div>
            <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <label style={labelStyle}>Court</label>
                <select value={form.court || ""} onChange={e => update("court", e.target.value)} style={selectStyle}>
                  <option value="">-- Select Court --</option>
                  {COURTS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Province / Territory</label>
                <select value={form.province || ""} onChange={e => update("province", e.target.value)} style={selectStyle}>
                  <option value="">-- Select Province --</option>
                  {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ── STEP 3: Facts ── */}
        {step === 3 && (
          <div>
            <SectionTitle>Statement of Facts</SectionTitle>
            <p style={{ color: "#8fb3d3", fontFamily: "sans-serif", fontSize: "14px", marginBottom: "20px" }}>
              Describe the full situation as narrated by the client. The AI will convert these into formally structured, numbered legal paragraphs.
            </p>
            <Field
              label="Full Facts of the Case *"
              value={form.facts}
              onChange={v => update("facts", v)}
              placeholder="Describe what happened: when, where, who did what, what damage/loss occurred, any agreements made, any prior complaints filed, etc. Write as much detail as possible."
              rows={8}
            />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
              <Field
                label="Date of Incident / Cause of Action"
                value={form.incidentDate}
                onChange={v => update("incidentDate", v)}
                placeholder="e.g. 15 March 2024 or January 2024"
              />
              <Field
                label="Witnesses (Names & Addresses)"
                value={form.witnesses}
                onChange={v => update("witnesses", v)}
                placeholder="1. Name, Address\n2. Name, Address"
                rows={3}
              />
            </div>
            <Field
              label="Evidence / Documents Available"
              value={form.evidence}
              onChange={v => update("evidence", v)}
              placeholder="e.g. Sale deed, rent agreement, CNIC copies, WhatsApp messages, medical reports, police diary entry no., bank statements, etc."
              rows={3}
            />
          </div>
        )}

        {/* ── STEP 4: Relief Sought ── */}
        {step === 4 && (
          <div>
            <SectionTitle>Prayer / Relief Sought</SectionTitle>
            <p style={{ color: "#8fb3d3", fontFamily: "sans-serif", fontSize: "14px", marginBottom: "20px" }}>
              What specific relief does your client want from the court? Be specific — the AI will formulate a proper Prayer clause.
            </p>
            <Field
              label="Specific Relief / Prayer Sought *"
              value={form.prayer}
              onChange={v => update("prayer", v)}
              placeholder="e.g.&#10;1. Declare the respondent's action illegal&#10;2. Direct payment of Rs. 500,000 as damages&#10;3. Restore possession of property&#10;4. Issue injunction restraining respondent from..."
              rows={6}
            />
            <Field
              label="Interim Relief Requested (if any)"
              value={form.interimRelief}
              onChange={v => update("interimRelief", v)}
              placeholder="e.g. Stay order, temporary injunction, interim custody order"
              rows={2}
            />
            <Field
              label="Additional Notes / Instructions for Advocate"
              value={form.additionalNotes}
              onChange={v => update("additionalNotes", v)}
              placeholder="Any special circumstances, urgency, previous litigation, related cases, etc."
              rows={3}
            />

            <div style={{
              marginTop: "20px",
              background: "#0d1f33",
              border: "1px solid #c9a84c33",
              borderRadius: "8px",
              padding: "16px",
            }}>
              <div style={{ color: "#c9a84c", fontFamily: "sans-serif", fontSize: "14px", fontWeight: "600", marginBottom: "10px" }}>
                📋 Summary before drafting
              </div>
              {[
                ["Case Type", form.caseType?.label],
                ["Court", form.court],
                ["Province", form.province],
                ["Petitioner", form.complainantName],
                ["Respondent", form.respondentName],
              ].map(([k, v]) => v ? (
                <div key={k as string} style={{ display: "flex", gap: "12px", marginBottom: "6px", fontFamily: "sans-serif", fontSize: "13px" }}>
                  <span style={{ color: "#5a8ab5", minWidth: "100px" }}>{k}</span>
                  <span style={{ color: "#d4e6f3" }}>{v as string}</span>
                </div>
              ) : null)}
            </div>
          </div>
        )}

        {/* ── STEP 5: Payment (NEW) ── */}
        {step === 5 && (
          <div>
            <SectionTitle>Payment — Rs. 500 per Draft</SectionTitle>
            <p style={{ color: "#8fb3d3", fontFamily: "sans-serif", fontSize: "14px", marginBottom: "20px" }}>
              This is a paid service. Pay <strong style={{ color: "#c9a84c" }}>PKR 500</strong> via JazzCash to generate your legal draft. Your payment will be verified by the admin.
            </p>

            {paymentDone ? (
              <div style={{
                background: "#0d2d1a", border: "1px solid #2d8a4e",
                borderRadius: "8px", padding: "24px", textAlign: "center",
              }}>
                <CheckCircle size={40} style={{ color: "#4ade80", margin: "0 auto 12px" }} />
                <div style={{ color: "#4ade80", fontFamily: "sans-serif", fontSize: "16px", fontWeight: "600" }}>
                  Payment Submitted Successfully!
                </div>
                <div style={{ color: "#8fb3d3", fontFamily: "sans-serif", fontSize: "13px", marginTop: "8px" }}>
                  Your payment proof has been recorded. Your draft will be ready shortly.
                </div>
                {loading && (
                  <div style={{ marginTop: "16px" }}>
                    <Loader2 size={20} style={{ color: "#c9a84c", margin: "0 auto", animation: "spin 1s linear infinite" }} />
                  </div>
                )}
              </div>
            ) : (
              <>
                {paymentMethods.length === 0 || !legalDraftPlan ? (
                  <div style={{
                    background: "#2d1a0a", border: "1px solid #8b5a1a",
                    borderRadius: "8px", padding: "20px",
                    color: "#ffb366", fontFamily: "sans-serif", fontSize: "14px",
                  }}>
                    <FileText size={20} style={{ marginBottom: "8px" }} />
                    <div style={{ fontWeight: "600", marginBottom: "4px" }}>Payment method not configured</div>
                    <div style={{ color: "#8fb3d3", fontSize: "13px" }}>
                      Please contact the admin to set up JazzCash payment details before using this feature.
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Payment Account Details */}
                    {paymentMethods.map(m => (
                      <div key={m.id} style={{
                        background: "#0d1f33", border: "1px solid #c9a84c44",
                        borderRadius: "8px", padding: "20px", marginBottom: "20px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                          <span style={{ fontSize: "24px" }}>📱</span>
                          <span style={{ color: "#c9a84c", fontFamily: "sans-serif", fontSize: "15px", fontWeight: "700" }}>
                            {m.label}
                          </span>
                        </div>
                        <div style={{ fontFamily: "sans-serif", fontSize: "13px", color: "#d4e6f3", lineHeight: "1.8" }}>
                          <strong style={{ color: "#8fb3d3" }}>Account Name:</strong> {m.account_name}<br />
                          {m.mobile_number && <><strong style={{ color: "#8fb3d3" }}>Mobile Number:</strong> {m.mobile_number}<br /></>}
                          {m.account_number && <><strong style={{ color: "#8fb3d3" }}>Account Number:</strong> {m.account_number}<br /></>}
                        </div>
                        <div style={{
                          marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #1e3d5c",
                          fontFamily: "sans-serif", fontSize: "18px", fontWeight: "700", color: "#c9a84c",
                        }}>
                          Amount to Pay: PKR 500
                        </div>
                      </div>
                    ))}

                    {/* Payment Form */}
                    <div style={{
                      background: "#0d1f33", border: "1px solid #1e3d5c",
                      borderRadius: "8px", padding: "20px",
                    }}>
                      <div style={{ color: "#c9a84c", fontFamily: "sans-serif", fontSize: "14px", fontWeight: "700", marginBottom: "16px" }}>
                        Confirm Your Payment
                      </div>

                      {error && (
                        <div style={{
                          background: "#2d0a0a", border: "1px solid #8b1a1a",
                          borderRadius: "6px", padding: "12px", color: "#ff6b6b",
                          fontFamily: "sans-serif", fontSize: "13px", marginBottom: "16px",
                        }}>
                          ⚠️ {error}
                        </div>
                      )}

                      <Field
                        label="Transaction ID *"
                        value={paymentForm.transaction_id}
                        onChange={v => setPaymentForm(f => ({ ...f, transaction_id: v }))}
                        placeholder="e.g., TAN123456789"
                      />
                      <Field
                        label="Sender Name (as per JazzCash account) *"
                        value={paymentForm.sender_name}
                        onChange={v => setPaymentForm(f => ({ ...f, sender_name: v }))}
                        placeholder="Your full name as per account"
                      />
                      <Field
                        label="Sender Mobile Number"
                        value={paymentForm.sender_account}
                        onChange={v => setPaymentForm(f => ({ ...f, sender_account: v }))}
                        placeholder="e.g., 03XX-XXXXXXX"
                      />

                      <button
                        onClick={handlePayment}
                        disabled={paymentSubmitting || !paymentForm.transaction_id || !paymentForm.sender_name}
                        style={{
                          width: "100%",
                          background: paymentForm.transaction_id && paymentForm.sender_name
                            ? "linear-gradient(135deg, #c9a84c, #e8c86e)" : "#1e3d5c",
                          border: "none",
                          color: paymentForm.transaction_id && paymentForm.sender_name ? "#0a1628" : "#4a7a9b",
                          padding: "12px",
                          borderRadius: "6px",
                          cursor: paymentForm.transaction_id && paymentForm.sender_name ? "pointer" : "not-allowed",
                          fontFamily: "sans-serif",
                          fontSize: "15px",
                          fontWeight: "700",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        {paymentSubmitting ? (
                          <><Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Submitting...</>
                        ) : (
                          "✅ Confirm Payment & Generate Draft"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}

            <style>{`@keyframes spin { 0%,100%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
          </div>
        )}

        {/* ── STEP 6: Draft Output ── */}
        {step === 6 && (
          <div ref={draftRef}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <SectionTitle style={{ marginBottom: 0 }}>Generated Legal Draft</SectionTitle>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={copyDraft} style={{
                  background: copied ? "#2d8a4e" : "linear-gradient(135deg, #c9a84c, #e8c86e)",
                  border: "none",
                  color: copied ? "#fff" : "#0a1628",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontFamily: "sans-serif",
                  fontSize: "13px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}>
                  <Copy size={14} /> {copied ? "Copied!" : "Copy Draft"}
                </button>
                <button onClick={reset} style={{
                  background: "transparent",
                  border: "1px solid #1e3d5c",
                  color: "#8fb3d3",
                  padding: "8px 18px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontFamily: "sans-serif",
                  fontSize: "13px",
                }}>
                  New Case
                </button>
              </div>
            </div>

            {loading && (
              <div style={{
                background: "#0d1f33",
                border: "1px solid #c9a84c33",
                borderRadius: "8px",
                padding: "40px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "32px", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>⚖️</div>
                <div style={{ color: "#c9a84c", fontFamily: "sans-serif", fontSize: "16px", marginBottom: "8px" }}>
                  Drafting your legal document...
                </div>
                <div style={{ color: "#5a8ab5", fontFamily: "sans-serif", fontSize: "13px" }}>
                  Applying Pakistani law · Structuring facts · Formulating prayer
                </div>
                <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
              </div>
            )}

            {error && (
              <div style={{
                background: "#2d0a0a", border: "1px solid #8b1a1a",
                borderRadius: "8px", padding: "16px", color: "#ff6b6b",
                fontFamily: "sans-serif", fontSize: "14px",
              }}>
                ⚠️ {error}
              </div>
            )}

            {draft && (
              <>
                <div style={{
                  background: "#f8f4ec",
                  border: "2px solid #c9a84c",
                  borderRadius: "8px",
                  padding: "32px",
                  color: "#1a1a1a",
                  fontFamily: "'Times New Roman', Georgia, serif",
                  fontSize: "15px",
                  lineHeight: "1.8",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "600px",
                  overflowY: "auto",
                }}>
                  {draft}
                </div>

                <div style={{
                  marginTop: "16px",
                  background: "#0d1a27",
                  border: "1px solid #1e3d5c",
                  borderRadius: "8px",
                  padding: "14px 18px",
                  display: "flex",
                  gap: "12px",
                  alignItems: "flex-start",
                  fontFamily: "sans-serif",
                }}>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>⚠️</span>
                  <div>
                    <div style={{ color: "#c9a84c", fontSize: "13px", fontWeight: "600", marginBottom: "4px" }}>
                      Important Disclaimer
                    </div>
                    <div style={{ color: "#8fb3d3", fontSize: "12px", lineHeight: "1.6" }}>
                      This AI-generated draft is for guidance only. It must be reviewed, verified, and approved by a qualified Pakistani advocate before filing in any court.
                      All citations must be verified. Legal-diary.com and its AI tools do not constitute legal advice.
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Navigation Buttons ── */}
        {step < 5 && (
          <div style={{
            display: "flex",
            justifyContent: step > 1 ? "space-between" : "flex-end",
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid #1e3d5c",
          }}>
            {step > 1 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                background: "transparent",
                border: "1px solid #1e3d5c",
                color: "#8fb3d3",
                padding: "10px 24px",
                borderRadius: "6px",
                cursor: "pointer",
                fontFamily: "sans-serif",
                fontSize: "14px",
              }}>
                ← Back
              </button>
            )}
            {step < 4 && (
              <button
                onClick={() => canProceed() && setStep(s => s + 1)}
                disabled={!canProceed()}
                style={{
                  background: canProceed() ? "linear-gradient(135deg, #c9a84c, #e8c86e)" : "#1e3d5c",
                  border: "none",
                  color: canProceed() ? "#0a1628" : "#4a7a9b",
                  padding: "10px 28px",
                  borderRadius: "6px",
                  cursor: canProceed() ? "pointer" : "not-allowed",
                  fontFamily: "sans-serif",
                  fontSize: "14px",
                  fontWeight: "700",
                }}
              >
                Continue →
              </button>
            )}
            {step === 4 && (
              <button
                onClick={() => { if (canProceed()) setStep(5) }}
                disabled={!canProceed()}
                style={{
                  background: canProceed() ? "linear-gradient(135deg, #c9a84c, #e8c86e)" : "#1e3d5c",
                  border: "none",
                  color: canProceed() ? "#0a1628" : "#4a7a9b",
                  padding: "12px 32px",
                  borderRadius: "6px",
                  cursor: canProceed() ? "pointer" : "not-allowed",
                  fontFamily: "sans-serif",
                  fontSize: "15px",
                  fontWeight: "700",
                }}
              >
                💳 Proceed to Payment
              </button>
            )}
          </div>
        )}

        {/* Step 5 navigation (back only, payment handled by button above) */}
        {step === 5 && !paymentDone && (
          <div style={{
            marginTop: "20px",
            textAlign: "center",
          }}>
            <button onClick={() => setStep(4)} style={{
              background: "transparent",
              border: "1px solid #1e3d5c",
              color: "#8fb3d3",
              padding: "10px 24px",
              borderRadius: "6px",
              cursor: "pointer",
              fontFamily: "sans-serif",
              fontSize: "14px",
            }}>
              ← Back to Relief
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────
function SectionTitle({ children, style: customStyle }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <h2 style={{
      color: "#c9a84c",
      fontSize: "20px",
      fontFamily: "'Georgia', serif",
      fontWeight: "700",
      marginBottom: "20px",
      marginTop: "0",
      paddingBottom: "10px",
      borderBottom: "1px solid #1e3d5c",
      ...customStyle,
    }}>{children}</h2>
  )
}

function CardBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: "#0d1f33",
      border: "1px solid #1e3d5c",
      borderRadius: "8px",
      padding: "18px",
    }}>
      <div style={{
        color: "#c9a84c",
        fontFamily: "sans-serif",
        fontSize: "13px",
        fontWeight: "700",
        letterSpacing: "0.5px",
        textTransform: "uppercase",
        marginBottom: "14px",
        paddingBottom: "8px",
        borderBottom: "1px solid #1e3d5c",
      }}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, placeholder, rows }: {
  label: string; value?: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  return (
    <div style={{ marginBottom: "14px" }}>
      <label style={labelStyle}>{label}</label>
      {rows ? (
        <textarea
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          style={{ ...inputStyle, resize: "vertical", minHeight: `${rows * 24}px` }}
        />
      ) : (
        <input
          type="text"
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: "block",
  color: "#8fb3d3",
  fontFamily: "sans-serif",
  fontSize: "12px",
  fontWeight: "600",
  letterSpacing: "0.3px",
  marginBottom: "6px",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "#0a1628",
  border: "1px solid #1e3d5c",
  borderRadius: "6px",
  color: "#d4e6f3",
  padding: "10px 12px",
  fontFamily: "sans-serif",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
  lineHeight: "1.5",
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
}
