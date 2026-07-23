'use client'

import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Lock,
  Truck,
  Smartphone,
  Building2,
  Wallet,
  Banknote,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  Percent
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { OrderSummary } from '@/components/cart/order-summary'
import { CheckoutSteps } from '@/components/checkout/checkout-steps'
import { Container } from '@/components/shared/container'
import { useStore } from '@/components/providers/store-provider'
import { formatPrice } from '@/lib/format'
import { cn } from '@/lib/utils'

type Address = {
  email: string
  firstName: string
  lastName: string
  address: string
  city: string
  state: string
  zip: string
  phone: string
}

type PaymentMethodItem = {
  id: string
  code: string
  name: string
  type: string
  description: string | null
  isAvailable: boolean
  reason?: string
}

const shippingMethods = [
  { id: 'standard', label: 'Standard', desc: '4-6 business days', price: 0 },
  { id: 'express', label: 'Express', desc: '2-3 business days', price: 12 },
  { id: 'overnight', label: 'Overnight', desc: 'Next business day', price: 28 },
]

const emptyAddress: Address = {
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
}

const popularBanks = [
  { id: 'SBI', name: 'State Bank of India', short: 'SBI' },
  { id: 'HDFC', name: 'HDFC Bank', short: 'HDFC' },
  { id: 'ICICI', name: 'ICICI Bank', short: 'ICICI' },
  { id: 'AXIS', name: 'Axis Bank', short: 'AXIS' },
  { id: 'KOTAK', name: 'Kotak Mahindra Bank', short: 'KOTAK' },
  { id: 'BOB', name: 'Bank of Baroda', short: 'BOB' },
]

const otherBanks = [
  'Punjab National Bank',
  'Canara Bank',
  'IDBI Bank',
  'Union Bank of India',
  'Federal Bank',
  'Yes Bank',
  'IndusInd Bank',
]

const popularWallets = [
  { id: 'paytm', name: 'Paytm Wallet' },
  { id: 'amazon', name: 'Amazon Pay' },
  { id: 'phonepe', name: 'PhonePe Wallet' },
  { id: 'mobikwik', name: 'Mobikwik' },
  { id: 'freecharge', name: 'Freecharge' },
]

function Field({
  label,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        {...props}
        className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-foreground/30"
      />
    </label>
  )
}

function getMethodIcon(code: string) {
  switch (code.toUpperCase()) {
    case 'UPI':
      return <Smartphone className="size-5 text-indigo-500" />
    case 'CARD':
      return <CreditCard className="size-5 text-blue-500" />
    case 'NETBANKING':
      return <Building2 className="size-5 text-emerald-500" />
    case 'WALLET':
      return <Wallet className="size-5 text-amber-500" />
    case 'COD':
      return <Banknote className="size-5 text-teal-500" />
    case 'EMI':
      return <Percent className="size-5 text-indigo-600 animate-pulse" />
    case 'PAYLATER':
      return <Wallet className="size-5 text-rose-500" />
    default:
      return <CreditCard className="size-5" />
  }
}

export function CheckoutView() {
  const router = useRouter()
  const { cart, cartSubtotal, clearCart } = useStore()
  const [step, setStep] = useState(0)
  const [address, setAddress] = useState<Address>(emptyAddress)
  const [shipMethod, setShipMethod] = useState('standard')
  const [placing, setPlacing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isBusiness, setIsBusiness] = useState(false)
  const [gstin, setGstin] = useState('')
  const [companyName, setCompanyName] = useState('')

  // Payment Methods State
  const [methods, setMethods] = useState<PaymentMethodItem[]>([])
  const [loadingMethods, setLoadingMethods] = useState(false)
  const [selectedMethodCode, setSelectedMethodCode] = useState<string>('UPI')

  // Sub-selection state
  const [upiOption, setUpiOption] = useState<'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'vpa'>('gpay')
  const [upiVpa, setUpiVpa] = useState('')
  const [cardHolder, setCardHolder] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvc, setCardCvc] = useState('')
  const [selectedBank, setSelectedBank] = useState('HDFC')
  const [selectedWallet, setSelectedWallet] = useState('paytm')

  const handleZipChange = async (zipVal: string) => {
    setAddress(prev => ({ ...prev, zip: zipVal }));
    if (zipVal.trim().length === 6) {
      try {
        const res = await fetch(`/api/v1/pincode/${zipVal}`);
        const json = await res.json();
        if (json.success && json.data.isServiced) {
          const { city, state } = json.data;
          setAddress(prev => ({
            ...prev,
            city: city || prev.city,
            state: state || prev.state,
          }));
        }
      } catch (e) {
        console.error("PIN code lookup failure:", e);
      }
    }
  };

  const shipUpcharge = useMemo(
    () => shippingMethods.find((m) => m.id === shipMethod)?.price ?? 0,
    [shipMethod],
  )

  // Fetch payment methods dynamically from API
  useEffect(() => {
    async function loadMethods() {
      try {
        setLoadingMethods(true)
        const total = cartSubtotal + shipUpcharge
        const res = await fetch(`/api/v1/payment/methods?cartTotal=${total}`)
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          const list = [...data.data];
          list.push({
            id: 'emi',
            code: 'EMI',
            name: 'EMI (Easy Installments)',
            type: 'EMI',
            description: 'No Cost EMI starts from ₹1,699/month on credit cards',
            isAvailable: true
          });
          list.push({
            id: 'paylater',
            code: 'PAYLATER',
            name: 'Pay Later',
            type: 'PAYLATER',
            description: 'ICICI PayLater, Simple, LazyPay or HDFC FlexiPay',
            isAvailable: true
          });
          setMethods(list)
          
          // Default to first available method if selectedMethodCode is not valid
          const available = list.find((m: PaymentMethodItem) => m.isAvailable)
          if (available) {
            setSelectedMethodCode((prev) => {
              const currentAvailable = list.find((m: PaymentMethodItem) => m.code === prev && m.isAvailable)
              return currentAvailable ? prev : available.code
            })
          }
        }
      } catch (err) {
        console.error('Error fetching payment methods:', err)
      } finally {
        setLoadingMethods(false)
      }
    }

    loadMethods()
  }, [cartSubtotal, shipUpcharge])

  if (cart.length === 0 && !placing) {
    return (
      <Container className="flex flex-col items-center gap-4 py-24 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <p className="text-muted-foreground">Add items before checking out.</p>
        <Link
          href="/category/all"
          className="inline-flex h-11 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background"
        >
          Continue shopping
        </Link>
      </Container>
    )
  }

  const isPinValid = address.zip && address.zip.trim().length === 6 && /^\d+$/.test(address.zip)
  const isPhoneValid = address.phone && (address.phone.replace(/[^0-9]/g, '').length >= 10)
  const isGstValid = !isBusiness || (gstin.trim().length === 15 && companyName.trim().length > 0)

  const infoValid =
    address.email &&
    address.firstName &&
    address.lastName &&
    address.address &&
    address.city &&
    address.state &&
    isPinValid &&
    isPhoneValid &&
    isGstValid

  const next = () => setStep((s) => Math.min(s + 1, 3))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const placeOrder = async () => {
    setPlacing(true)
    setErrorMsg(null)
    try {
      if (selectedMethodCode === 'UPI') {
        const isMobileDevice = /Android|iPhone|iPad/i.test(navigator.userAgent);
        if (isMobileDevice) {
          const totalAmount = cartSubtotal + shipUpcharge;
          const upiUrl = `upi://pay?pa=smartgo@okaxis&pn=SmartGO%20India&am=${totalAmount}&cu=INR&tn=Order%20Payment`;
          window.location.href = upiUrl;
          await new Promise((r) => setTimeout(r, 1500));
        }
      }

      const res = await fetch('/api/v1/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'mock-user-id' },
        body: JSON.stringify({
          address: {
            fullName: `${address.firstName} ${address.lastName}`,
            phone: address.phone,
            street: address.address,
            city: address.city,
            state: address.state,
            country: 'IN',
            postalCode: address.zip,
          },
          isBusiness,
          gstin,
          companyName,
          paymentMethodCode: selectedMethodCode,
          paymentProvider: selectedMethodCode,
        }),
      })
      const data = await res.json()
      if (data.success) {
        clearCart()
        const orderNum = data.data?.orderNumber || data.data?.orderId || `ORD-${Date.now()}`
        router.push(`/checkout/success?order=${orderNum}`)
      } else {
        setErrorMsg(data.error || data.message || 'Failed to place order. Please try again.')
        setPlacing(false)
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to place order. Please try again.')
      setPlacing(false)
    }
  }

  const selectedMethodObj = methods.find((m) => m.code === selectedMethodCode)

  return (
    <Container className="py-8 lg:py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <Link href="/" className="text-xl font-bold tracking-tight">
          SmartGO
        </Link>
        <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-4" /> 256-Bit Encrypted Checkout
        </span>
      </div>

      <div className="mb-10 max-w-2xl">
        <CheckoutSteps current={step} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="relative">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.section
                key="step-0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                aria-labelledby="info-heading"
                className="flex flex-col gap-5"
              >
              <h2 id="info-heading" className="text-lg font-semibold">
                Contact & shipping address
              </h2>
              <Field
                label="Email address"
                type="email"
                autoComplete="email"
                value={address.email}
                onChange={(e) => setAddress({ ...address, email: e.target.value })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First name"
                  type="text"
                  autoComplete="given-name"
                  value={address.firstName}
                  onChange={(e) => setAddress({ ...address, firstName: e.target.value })}
                />
                <Field
                  label="Last name"
                  type="text"
                  autoComplete="family-name"
                  value={address.lastName}
                  onChange={(e) => setAddress({ ...address, lastName: e.target.value })}
                />
              </div>
              <Field
                label="House / Flat No., Building Name, Street, Area"
                type="text"
                autoComplete="street-address"
                value={address.address}
                onChange={(e) => setAddress({ ...address, address: e.target.value })}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <Field
                  label="PIN code (6 digits)"
                  type="text"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="e.g. 560001"
                  value={address.zip}
                  onChange={(e) => handleZipChange(e.target.value)}
                />
                <Field
                  label="City"
                  type="text"
                  autoComplete="address-level2"
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                />
                <Field
                  label="State"
                  type="text"
                  autoComplete="address-level1"
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value })}
                />
              </div>
              <Field
                label="Mobile Number (10 digits)"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                pattern="[0-9]*"
                placeholder="e.g. 9876543210"
                value={address.phone}
                onChange={(e) => setAddress({ ...address, phone: e.target.value })}
              />
              <div className="mt-4 border-t border-border pt-4">
                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isBusiness}
                    onChange={(e) => setIsBusiness(e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  Ordering for business? (Get GST Invoice & Tax Credit)
                </label>
                {isBusiness && (
                  <div className="grid gap-4 mt-3 sm:grid-cols-2">
                    <Field
                      label="GSTIN"
                      placeholder="e.g. 29AAAAA1111A1Z1"
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value)}
                    />
                    <Field
                      label="Company Name"
                      placeholder="e.g. Acme Corp"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {/* STEP 1: Shipping */}
          {step === 1 && (
            <motion.section
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-labelledby="ship-heading"
              className="flex flex-col gap-4"
            >
              <h2 id="ship-heading" className="flex items-center gap-2 text-lg font-semibold">
                <Truck className="size-5" /> Shipping method
              </h2>
              <div className="flex flex-col gap-3">
                {shippingMethods.map((m) => (
                  <label
                    key={m.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all',
                      shipMethod === m.id
                        ? 'border-foreground bg-accent/60 shadow-sm'
                        : 'border-border hover:border-foreground/30',
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="ship"
                        checked={shipMethod === m.id}
                        onChange={() => setShipMethod(m.id)}
                        className="size-4 accent-foreground"
                      />
                      <span className="flex flex-col">
                        <span className="text-sm font-medium">{m.label}</span>
                        <span className="text-xs text-muted-foreground">{m.desc}</span>
                      </span>
                    </span>
                    <span className="text-sm font-semibold">
                      {m.price === 0 ? 'Free' : formatPrice(m.price)}
                    </span>
                  </label>
                ))}
              </div>
            </motion.section>
          )}

          {/* STEP 2: Enterprise Database-Driven Payment Options */}
          {step === 2 && (
            <motion.section
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-labelledby="pay-heading"
              className="flex flex-col gap-5"
            >
              <div className="flex items-center justify-between">
                <h2 id="pay-heading" className="flex items-center gap-2 text-lg font-semibold">
                  <Lock className="size-5 text-emerald-500" /> Choose Payment Method
                </h2>
                <span className="text-xs font-medium text-muted-foreground">
                  Database-Driven Engine
                </span>
              </div>

              {loadingMethods ? (
                <div className="flex flex-col gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 w-full animate-pulse rounded-2xl border border-border bg-accent/30"
                    />
                  ))}
                </div>
              ) : methods.length === 0 ? (
                <div className="rounded-2xl border border-border p-6 text-center text-sm text-muted-foreground">
                  No payment methods available. Please contact support.
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {methods.map((m) => {
                    const isSelected = selectedMethodCode === m.code
                    return (
                      <div
                        key={m.code}
                        className={cn(
                          'rounded-2xl border transition-all overflow-hidden',
                          !m.isAvailable
                            ? 'opacity-50 border-border bg-muted/20 cursor-not-allowed'
                            : isSelected
                              ? 'border-foreground bg-accent/30 shadow-md ring-1 ring-foreground/10'
                              : 'border-border hover:border-foreground/30 bg-background cursor-pointer',
                        )}
                        onClick={() => {
                          if (m.isAvailable) setSelectedMethodCode(m.code)
                        }}
                      >
                        <div className="flex items-center justify-between p-4 sm:p-5">
                          <div className="flex items-center gap-3.5">
                            <input
                              type="radio"
                              name="paymentMethod"
                              checked={isSelected}
                              disabled={!m.isAvailable}
                              onChange={() => setSelectedMethodCode(m.code)}
                              className="size-4 accent-foreground"
                            />
                            <div className="flex items-center gap-3">
                              <div className="flex size-10 items-center justify-center rounded-xl bg-background border border-border shadow-xs">
                                {getMethodIcon(m.code)}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-sm font-semibold text-foreground">
                                  {m.name}
                                </span>
                                {m.description && (
                                  <span className="text-xs text-muted-foreground">
                                    {m.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {!m.isAvailable && (
                            <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-600 dark:text-red-400">
                              Unavailable
                            </span>
                          )}
                        </div>

                        {!m.isAvailable && m.reason && (
                          <div className="px-5 pb-4 text-xs font-medium text-red-500/90 flex items-center gap-1.5">
                            <AlertCircle className="size-3.5 shrink-0" />
                            {m.reason}
                          </div>
                        )}

                        {/* Expanded Option UI */}
                        {isSelected && m.isAvailable && (
                          <div className="border-t border-border/60 bg-background/50 p-4 sm:p-5 flex flex-col gap-4">
                            {/* UPI UI */}
                            {m.code === 'UPI' && (
                              <div className="flex flex-col gap-4">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Select your UPI app or enter UPI ID
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                  {[
                                    { id: 'gpay', name: 'Google Pay' },
                                    { id: 'phonepe', name: 'PhonePe' },
                                    { id: 'paytm', name: 'Paytm UPI' },
                                    { id: 'bhim', name: 'BHIM UPI' },
                                  ].map((app) => (
                                    <button
                                      key={app.id}
                                      type="button"
                                      onClick={() => setUpiOption(app.id as any)}
                                      className={cn(
                                        'flex items-center justify-center gap-2 h-11 px-3 rounded-xl border text-xs font-medium transition-all',
                                        upiOption === app.id
                                          ? 'border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold'
                                          : 'border-border hover:bg-accent text-foreground',
                                      )}
                                    >
                                      {upiOption === app.id && <Check className="size-3.5" />}
                                      {app.name}
                                    </button>
                                  ))}
                                </div>

                                <div className="mt-1">
                                  <Field
                                    label="Or enter UPI ID / VPA (Optional)"
                                    placeholder="username@upi"
                                    value={upiVpa}
                                    onChange={(e) => setUpiVpa(e.target.value)}
                                  />
                                </div>

                                <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 p-3 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                                  <Smartphone className="size-4 shrink-0 text-indigo-500" />
                                  <span>
                                    You will receive a payment request notification in your UPI app upon continuing.
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* CARD UI */}
                            {m.code === 'CARD' && (
                              <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Card Details
                                  </span>
                                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <span className="rounded border px-1.5 py-0.5 font-bold">VISA</span>
                                    <span className="rounded border px-1.5 py-0.5 font-bold">MC</span>
                                    <span className="rounded border px-1.5 py-0.5 font-bold">RuPay</span>
                                    <span className="rounded border px-1.5 py-0.5 font-bold">AMEX</span>
                                  </div>
                                </div>
                                <Field
                                  label="Cardholder name"
                                  placeholder="Name as printed on card"
                                  value={cardHolder}
                                  onChange={(e) => setCardHolder(e.target.value)}
                                />
                                <Field
                                  label="Card number"
                                  placeholder="4532 •••• •••• 8921"
                                  maxLength={19}
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                />
                                <div className="grid gap-4 grid-cols-2">
                                  <Field
                                    label="Expiry date"
                                    placeholder="MM / YY"
                                    maxLength={5}
                                    value={cardExpiry}
                                    onChange={(e) => setCardExpiry(e.target.value)}
                                  />
                                  <Field
                                    label="CVC / CVV"
                                    placeholder="123"
                                    maxLength={4}
                                    value={cardCvc}
                                    onChange={(e) => setCardCvc(e.target.value)}
                                  />
                                </div>
                              </div>
                            )}

                            {/* NET BANKING UI */}
                            {m.code === 'NETBANKING' && (
                              <div className="flex flex-col gap-4">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Popular Banks
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {popularBanks.map((bank) => (
                                    <button
                                      key={bank.id}
                                      type="button"
                                      onClick={() => setSelectedBank(bank.id)}
                                      className={cn(
                                        'flex items-center justify-between px-3.5 h-11 rounded-xl border text-xs font-medium transition-all',
                                        selectedBank === bank.id
                                          ? 'border-emerald-600 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold'
                                          : 'border-border hover:bg-accent text-foreground',
                                      )}
                                    >
                                      <span>{bank.name}</span>
                                      {selectedBank === bank.id && <Check className="size-3.5" />}
                                    </button>
                                  ))}
                                </div>

                                <div className="flex flex-col gap-1.5 mt-2">
                                  <span className="text-xs font-medium text-muted-foreground">
                                    Or select all other banks
                                  </span>
                                  <select
                                    value={selectedBank}
                                    onChange={(e) => setSelectedBank(e.target.value)}
                                    className="h-11 rounded-xl border border-border bg-background px-3.5 text-sm outline-none transition-colors focus:border-foreground/30"
                                  >
                                    <option value="">Choose bank...</option>
                                    {otherBanks.map((b) => (
                                      <option key={b} value={b}>
                                        {b}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            )}

                            {/* WALLETS UI */}
                            {m.code === 'WALLET' && (
                              <div className="flex flex-col gap-3">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Select Wallet
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {popularWallets.map((w) => (
                                    <button
                                      key={w.id}
                                      type="button"
                                      onClick={() => setSelectedWallet(w.id)}
                                      className={cn(
                                        'flex items-center justify-between px-3.5 h-11 rounded-xl border text-xs font-medium transition-all',
                                        selectedWallet === w.id
                                          ? 'border-amber-600 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold'
                                          : 'border-border hover:bg-accent text-foreground',
                                      )}
                                    >
                                      <span>{w.name}</span>
                                      {selectedWallet === w.id && <Check className="size-3.5" />}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* COD UI */}
                            {m.code === 'COD' && (
                              <div className="rounded-xl border border-teal-500/20 bg-teal-500/5 p-4 flex items-start gap-3">
                                <Banknote className="size-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-1 text-xs text-teal-800 dark:text-teal-200">
                                  <span className="font-semibold text-sm">Cash on Delivery Available</span>
                                  <span>
                                    You can pay with cash or UPI directly to the delivery partner when your order arrives.
                                  </span>
                                  <span className="text-[11px] opacity-75 mt-1">
                                    No advance payment required.
                                  </span>
                                 </div>
                              </div>
                            )}

                            {/* EMI UI */}
                            {m.code === 'EMI' && (
                              <div className="flex flex-col gap-3">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Select EMI Tenure Plan (Credit Cards)
                                </span>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  {[
                                    { months: 3, cost: Math.round(cartSubtotal / 3), rate: '0% (No Cost)' },
                                    { months: 6, cost: Math.round(cartSubtotal / 6), rate: '0% (No Cost)' },
                                    { months: 9, cost: Math.round((cartSubtotal * 1.1) / 9), rate: '14% interest' },
                                    { months: 12, cost: Math.round((cartSubtotal * 1.12) / 12), rate: '15% interest' },
                                  ].map((plan) => (
                                    <button
                                      key={plan.months}
                                      type="button"
                                      onClick={() => alert(`Selected ${plan.months} Months Plan!`)}
                                      className="flex flex-col justify-center px-4 py-3 rounded-xl border border-border bg-card text-left text-xs hover:border-foreground/30 transition-all"
                                    >
                                      <span className="font-semibold text-foreground">{plan.months} Months Plan</span>
                                      <span className="text-muted-foreground font-medium mt-0.5">{formatPrice(plan.cost, 'INR')} / month</span>
                                      <span className="text-[10px] text-success font-semibold mt-0.5">{plan.rate}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* PAYLATER UI */}
                            {m.code === 'PAYLATER' && (
                              <div className="flex flex-col gap-3">
                                <span className="text-xs font-medium text-muted-foreground">
                                  Select Pay Later Provider
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                  {['ICICI PayLater', 'Simple PayLater', 'LazyPay', 'HDFC FlexiPay'].map((pl) => (
                                    <button
                                      key={pl}
                                      type="button"
                                      onClick={() => alert(`Selected ${pl} PayLater Option!`)}
                                      className="flex items-center justify-center px-3.5 h-11 rounded-xl border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors"
                                    >
                                      {pl}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </motion.section>
          )}

          {/* STEP 3: Review Order */}
          {step === 3 && (
            <motion.section
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              aria-labelledby="review-heading"
              className="flex flex-col gap-5"
            >
              <h2 id="review-heading" className="text-lg font-semibold">
                Review your order
              </h2>
              <div className="rounded-2xl border border-border p-5 text-sm flex flex-col gap-3">
                <div>
                  <span className="text-xs font-medium text-muted-foreground block">Shipping Address</span>
                  <p className="font-medium mt-1">
                    {address.firstName} {address.lastName}
                  </p>
                  <p className="text-muted-foreground">{address.address}</p>
                  <p className="text-muted-foreground">
                    {address.city}, {address.state} {address.zip}
                  </p>
                  <p className="text-muted-foreground">{address.email}</p>
                </div>

                <div className="border-t border-border pt-3">
                  <span className="text-xs font-medium text-muted-foreground block">Selected Payment Method</span>
                  <p className="font-semibold text-foreground mt-1 flex items-center gap-2">
                    {getMethodIcon(selectedMethodCode)}
                    {selectedMethodObj?.name || selectedMethodCode}
                  </p>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  {errorMsg}
                </div>
              )}

              <ul className="flex flex-col gap-3">
                {cart.map((item) => (
                  <li key={item.product.id} className="flex items-center gap-3 text-sm">
                    <img
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt=""
                      className="size-14 rounded-xl border border-border object-cover"
                    />
                    <span className="flex-1">
                      <span className="font-medium">{item.product.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        Qty {item.quantity}
                      </span>
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.section>
          )}
          </AnimatePresence>

          {/* Navigation Controls */}
          <div className="hidden sm:flex mt-8 items-center justify-between gap-3">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-accent cursor-pointer"
              >
                <ArrowLeft className="size-4" /> Back
              </button>
            ) : (
              <Link
                href="/cart"
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-5 text-sm font-medium transition-colors hover:bg-accent"
              >
                <ArrowLeft className="size-4" /> Cart
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                disabled={(step === 0 && !infoValid) || (step === 2 && (!selectedMethodCode || selectedMethodObj?.isAvailable === false))}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity disabled:opacity-40 cursor-pointer"
              >
                Continue <ArrowRight className="size-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={placeOrder}
                disabled={placing}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity disabled:opacity-60 cursor-pointer"
              >
                <Lock className="size-4" /> {placing ? 'Processing Order...' : 'Place order'}
              </button>
            )}
          </div>

          {/* Sticky Navigation Controls (Mobile) */}
          <div className="flex sm:hidden fixed bottom-16 inset-x-0 z-40 bg-background/95 border-t border-border p-3 justify-between gap-3 shadow-soft backdrop-blur-md">
            {step > 0 ? (
              <button
                type="button"
                onClick={back}
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold bg-card text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Back
              </button>
            ) : (
              <Link
                href="/cart"
                className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border px-4 text-xs font-semibold bg-card text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Cart
              </Link>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={next}
                disabled={(step === 0 && !infoValid) || (step === 2 && (!selectedMethodCode || selectedMethodObj?.isAvailable === false))}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-foreground px-5 text-xs font-semibold text-background disabled:opacity-40"
              >
                Continue <ArrowRight className="size-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={placeOrder}
                disabled={placing}
                className="inline-flex h-11 items-center gap-1.5 rounded-full bg-primary px-5 text-xs font-semibold text-primary-foreground disabled:opacity-60"
              >
                <Lock className="size-3.5" /> {placing ? 'Processing...' : 'Place Order'}
              </button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <OrderSummary subtotal={cartSubtotal + shipUpcharge} showCoupon={step >= 2} />
        </aside>
      </div>
    </Container>
  )
}
