import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { SubscriptionPlan } from '@/types'
import { Check, Loader2, ArrowRight, Star, Building2, Crown } from 'lucide-react'

interface TierFeatures {
  solo: string[]
  team: string[]
  firm: string[]
}

const TIER_FEATURES: TierFeatures = {
  solo: [
    '1 lawyer · 10 GB cloud storage',
    'Unlimited matters, clients & hearings',
    'AI Pilot — research & drafting (10 questions/day)',
    '12 Pakistani legal calculators',
    'Vakalatnama generator (General · Special · Overseas)',
    'Trust account ledger',
    'Document scanner + in-app PDF editor',
    'Invoices with QR pay (JazzCash · EasyPaisa · Bank)',
    'Voice notes + WhatsApp share',
    'Bar Council CLE tracker',
    'Pakistani court holidays calendar',
    'Web + iOS + Android · everything synced',
    '7-day free trial · no card required',
  ],
  team: [
    'Up to 5 lawyers · 75 GB cloud storage',
    'Everything in Solo Pro',
    'Team roles & permissions (partner · associate · paralegal)',
    'Shared client files + matters',
    'Per-lawyer billable hour reports',
    'AI Pilot — 100 questions/day per lawyer',
    'Lawyer-to-lawyer messaging (refer matters in-app)',
    'Marketplace profile with verified blue tick',
    'Group onboarding session (30 min)',
    'WhatsApp + email support · 24h response',
  ],
  firm: [
    'Up to 20 lawyers · 200 GB cloud storage',
    'Everything in Team',
    'Trust account audit reports + bank reconciliation',
    'Custom client intake forms',
    'Advanced reports + CSV/Excel export',
    'AI Pilot — unlimited questions, premium model',
    'Featured marketplace listing (top of results)',
    'Conflict-of-interest checker',
    'API access (Zapier · webhooks · integrations)',
    '1-on-1 onboarding (1 hour) + dedicated WhatsApp line',
    'Priority support · 4h response',
  ],
}

const TIER_PRICES: Record<string, { month: number; year: number }> = {
  solo: { month: 2500, year: 24900 },
  team: { month: 9999, year: 99900 },
  firm: { month: 24999, year: 249900 },
}

export default function Pricing() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('month')
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  useEffect(() => { load() }, [])

  async function load() {
    const { data } = await supabase
      .from('subscription_plans')
      .select('*')
      .eq('is_active', true)
      .order('price_pkr')
    if (data) setPlans(data as SubscriptionPlan[])
    setLoading(false)
  }

  function getPrice(tier: string): number {
    if (billingInterval === 'year') return TIER_PRICES[tier].year
    return TIER_PRICES[tier].month
  }

  function getMonthlyEquiv(tier: string): number {
    if (billingInterval === 'year') return Math.round(TIER_PRICES[tier].year / 12)
    return TIER_PRICES[tier].month
  }

  function handleSubscribe(tier: string) {
    if (!isAuthenticated) {
      navigate(`/login?redirect=/pricing`)
      return
    }
    const dbPlan = plans.find(p => p.slug === tier && p.is_active)
    if (dbPlan) {
      navigate(`/subscribe/${dbPlan.id}`)
    } else {
      navigate(`/subscribe/${tier}`)
    }
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>

  const tiers = [
    {
      key: 'solo',
      name: 'Solo Pro',
      tagline: 'For solo practitioners',
      icon: Star,
      price: getPrice('solo'),
      monthlyEquiv: getMonthlyEquiv('solo'),
      features: TIER_FEATURES.solo,
      highlighted: false,
      badge: null,
    },
    {
      key: 'team',
      name: 'Team',
      tagline: 'For small partnerships',
      icon: Building2,
      price: getPrice('team'),
      monthlyEquiv: getMonthlyEquiv('team'),
      features: TIER_FEATURES.team,
      highlighted: true,
      badge: 'Most Popular',
    },
    {
      key: 'firm',
      name: 'Firm',
      tagline: 'For mid-size firms',
      icon: Crown,
      price: getPrice('firm'),
      monthlyEquiv: getMonthlyEquiv('firm'),
      features: TIER_FEATURES.firm,
      highlighted: false,
      badge: null,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-4">
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">&larr; Back</button>
        </div>

        <div className="mb-4 text-center">
          <h1 className="text-3xl font-bold text-slate-900">Built for Pakistan, priced in Rupees</h1>
          <p className="mt-2 text-slate-500">
            Every plan starts with a <strong>7-day free trial — no card required.</strong> Per-firm pricing, not per-seat extortion.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
            <button
              onClick={() => setBillingInterval('month')}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
                billingInterval === 'month' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >Monthly</button>
            <button
              onClick={() => setBillingInterval('year')}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
                billingInterval === 'year' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Yearly <span className="text-xs opacity-75">(save 17%)</span>
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {tiers.map((tier) => {
            const pricePerMonth = billingInterval === 'year' ? tier.monthlyEquiv : tier.price
            return (
              <div
                key={tier.key}
                className={`relative rounded-xl border bg-white p-6 shadow-sm transition-all hover:shadow-lg ${
                  tier.highlighted ? 'border-blue-300 ring-2 ring-blue-100 scale-105 lg:scale-105' : 'border-slate-200'
                }`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white shadow-sm">
                      {tier.badge}
                    </span>
                  </div>
                )}

                <div className={`${tier.highlighted ? 'mt-4' : ''}`}>
                  <tier.icon className={`h-8 w-8 ${tier.key === 'solo' ? 'text-amber-500' : tier.key === 'team' ? 'text-blue-600' : 'text-purple-600'}`} />
                  <h2 className="mt-3 text-xl font-bold text-slate-900">{tier.name}</h2>
                  <p className="text-sm text-slate-500">{tier.tagline}</p>
                </div>

                <div className="mt-4">
                  <span className="text-4xl font-bold text-slate-900">Rs {tier.price.toLocaleString()}</span>
                  <span className="text-slate-500">/{billingInterval === 'year' ? 'year' : 'month'}</span>
                  {billingInterval === 'year' && (
                    <p className="mt-1 text-sm font-medium text-green-600">
                      Rs {tier.monthlyEquiv.toLocaleString()}/month when billed annually
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleSubscribe(tier.key)}
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold transition-all ${
                    tier.highlighted
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                      : 'border border-blue-600 text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  Start 7-day Trial <ArrowRight className="h-4 w-4" />
                </button>

                <ul className="mt-6 space-y-3">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>

        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <Crown className="h-10 w-10 shrink-0 text-amber-500" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">Enterprise</h3>
              <p className="text-sm text-slate-500">
                20+ lawyers · unlimited storage · SSO (SAML / Azure AD) · IP allowlisting · dedicated account manager · on-premise deployment · white-label option
              </p>
            </div>
            <a
              href="mailto:info@legallawdiary.com"
              className="shrink-0 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Talk to Sales →
            </a>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">Storage Add-on</h3>
              <p className="text-sm text-slate-500">Add +5 GB to any paid plan. Stack multiple add-ons if your firm grows beyond your tier's storage.</p>
            </div>
            <span className="text-2xl font-bold text-slate-900">Rs 999<span className="text-sm font-normal text-slate-500">/month</span></span>
            <button className="shrink-0 rounded-lg border border-blue-600 px-5 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50">
              Add Storage →
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Billed in PKR via Stripe · accept Visa, Mastercard and most Pakistani debit cards · GST inclusive · cancel anytime in one click.
          </p>
        </div>

        {plans.length > 0 && (
          <div className="mt-12 rounded-lg border bg-slate-50 p-6">
            <h3 className="text-lg font-semibold text-slate-900">Available Plans</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.filter(p => p.is_active).map(plan => (
                <div key={plan.id} className="rounded-lg border bg-white p-4">
                  <h4 className="font-semibold text-slate-900">{plan.name}</h4>
                  <p className="text-lg font-bold text-blue-600">PKR {plan.price_pkr.toLocaleString()}/{plan.interval}</p>
                  <p className="text-xs text-slate-400">{plan.type} · {plan.max_members} members</p>
                  <button
                    onClick={() => navigate(`/subscribe/${plan.id}`)}
                    className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  >Subscribe</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
