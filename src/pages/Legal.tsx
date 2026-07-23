import { useNavigate } from 'react-router-dom'
import { Scale, ArrowLeft } from 'lucide-react'
import { AdBanner } from '@/components/ads/AdBanner'

export default function Legal() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-1 text-sm text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="mb-8 flex items-center gap-3">
          <Scale className="h-8 w-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Legal Information</h1>
        </div>

        <section id="terms" className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Terms of Service</h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            <p><strong>Last updated:</strong> June 2026</p>
            <p>
              By accessing or using Legal Law Diary ("the Software"), you agree to be bound by these Terms of Service.
              If you do not agree, do not use the Software.
            </p>
            <h3 className="font-semibold text-slate-800">1. Service Description</h3>
            <p>
              Legal Law Diary is a practice management tool designed to help lawyers organize case diaries,
              client information, court proceedings, and related documents. It is provided as a software-as-a-service (SaaS) product.
            </p>
            <h3 className="font-semibold text-slate-800">2. User Responsibilities</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>You are responsible for the accuracy and completeness of all data you enter into the Software.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You agree to <strong>back up your data regularly</strong>. The Software provides export functionality for this purpose.</li>
              <li>You must not use the Software for any unlawful purpose.</li>
            </ul>
            <h3 className="font-semibold text-slate-800">3. Subscription & Payments</h3>
            <p>
              Use of the Software requires a paid subscription after the trial period. Subscription fees are charged in
              Pakistani Rupees (PKR) and are non-refundable except as required by applicable law. Prices are subject
              to change with notice. Existing subscribers are locked in at their current rate until renewal.
            </p>
            <h3 className="font-semibold text-slate-800">4. Data & Privacy</h3>
            <p>
              Your data is stored securely using Supabase infrastructure. We do not sell, rent, or share your data
              with third parties. See our <a href="#privacy" className="text-blue-600 underline">Privacy Policy</a> for details.
            </p>
            <h3 className="font-semibold text-slate-800">5. Limitation of Liability</h3>
            <p>
              The Software is provided "as is" without warranty of any kind. The developers shall not be liable for
              any direct, indirect, incidental, or consequential damages arising from the use or inability to use the Software,
              including but not limited to data loss, even if advised of the possibility of such damages.
            </p>
            <h3 className="font-semibold text-slate-800">6. Termination</h3>
            <p>
              We reserve the right to suspend or terminate access to the Software for violation of these terms or
              non-payment of subscription fees.
            </p>
          </div>
        </section>

        <section id="privacy" className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Privacy Policy</h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            <h3 className="font-semibold text-slate-800">Information We Collect</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Account information:</strong> name, email address, bar council, license number, mobile number, and chamber address.</li>
              <li><strong>Case data:</strong> case numbers, client information, court proceedings, diary entries, and documents you upload.</li>
              <li><strong>Usage data:</strong> login timestamps and feature usage for improving the service.</li>
            </ul>
            <h3 className="font-semibold text-slate-800">How We Use Your Information</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>To provide and maintain the Software.</li>
              <li>To process subscription payments.</li>
              <li>To communicate with you about your account and service updates.</li>
              <li>To improve and develop new features.</li>
            </ul>
            <h3 className="font-semibold text-slate-800">Data Storage & Security</h3>
            <p>
              Your data is stored on Supabase infrastructure with encryption in transit (TLS) and at rest.
              We implement industry-standard security measures to protect your data.
            </p>
            <h3 className="font-semibold text-slate-800">Data Retention</h3>
            <p>
              We retain your data for as long as your account is active. Upon account deletion, your data is
              permanently deleted within 30 days.
            </p>
            <h3 className="font-semibold text-slate-800">Third-Party Services</h3>
            <p>
              We use Supabase for database and authentication services. Supabase's privacy policy applies
              to the infrastructure layer. We do not use any other third-party analytics or tracking services.
            </p>
            <h3 className="font-semibold text-slate-800">Your Rights</h3>
            <p>
              You may request access to, correction of, or deletion of your data by contacting us.
              You may export your data at any time via the Settings page.
            </p>
          </div>
        </section>

        <section id="disclaimer" className="mb-10">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Disclaimer</h2>
          <div className="space-y-3 text-sm leading-relaxed text-slate-600">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
              <p className="font-medium">Important: Read Carefully</p>
            </div>
            <p>
              Legal Law Diary is a <strong>practice management tool</strong> intended to help legal professionals
              organize their case workflow. It is <strong>NOT</strong> a substitute for:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Professional legal advice or legal representation.</li>
              <li>Independent legal research and verification.</li>
              <li>Proper court filing procedures and deadlines.</li>
              <li>Professional judgment of a qualified lawyer.</li>
            </ul>
            <h3 className="font-semibold text-slate-800">No Legal Advice</h3>
            <p>
              The Software does not provide legal advice, legal opinions, or recommendations.
              Any templates, calculators (including limitation calculators), or automated features
              are provided as convenience tools only and should not be relied upon without
              independent verification by a qualified legal professional.
            </p>
            <h3 className="font-semibold text-slate-800">Data Accuracy</h3>
            <p>
              You are solely responsible for ensuring the accuracy, completeness, and legality
              of all data entered into the Software. The developers make no representations
              about the accuracy or reliability of data stored in or processed by the Software.
            </p>
            <h3 className="font-semibold text-slate-800">Backup Responsibility</h3>
            <p>
              <strong>You are responsible for maintaining regular backups of your data.</strong>
              The Software provides export functionality, but the frequency and safekeeping
              of backups is your responsibility. The developers are not liable for data loss
              resulting from failure to maintain backups.
            </p>
            <h3 className="font-semibold text-slate-800">No Warranty</h3>
            <p>
              The Software is provided "as is" and "as available" without any warranty,
              express or implied. The developers disclaim all warranties, including but not
              limited to merchantability, fitness for a particular purpose, and non-infringement.
            </p>
            <h3 className="font-semibold text-slate-800">Limitation of Liability</h3>
            <p>
              To the maximum extent permitted by applicable law, in no event shall the developers
              be liable for any indirect, punitive, incidental, special, consequential, or exemplary
              damages arising out of or in connection with the use of the Software.
            </p>
          </div>
        </section>

        <div className="my-8 flex justify-center">
          <AdBanner adKey="xpdt49gn" height={90} width={728} />
        </div>

        <div className="border-t border-slate-200 pt-6 text-center text-xs text-slate-400">
          <p className="mb-2">
            <a href="/faq" className="text-blue-600 underline hover:text-blue-800">FAQ</a>
            <span className="mx-2">|</span>
            <a href="/guides" className="text-blue-600 underline hover:text-blue-800">Guides</a>
          </p>
          <p>Legal Law Diary v1.0 &mdash; Practice management tool for Pakistan courts</p>
          <p className="mt-1">Questions? Contact the administrator.</p>
        </div>
      </div>
    </div>
  )
}
