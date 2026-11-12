'use client';

import { useRef, useState, type FormEvent } from 'react';
import Script from 'next/script';
import { ArrowRight, Check, Droplets, LockKeyhole } from 'lucide-react';
import type { Locale } from '@/i18n/copy';
import { asciiDigits, type LeadSource } from '@/lib/lead-validation';
import styles from './LeadRegistration.module.css';

type Props = { locale: Locale; source: LeadSource };
type Result = { code?: string; message?: string };

const content = {
  en: {
    kicker: 'YOUR RESEARCH / NEXT STEP',
    title: 'Stay connected to what comes next.',
    accent: 'what comes next.',
    intro: 'Register your interest in the IOJH research guide. Our team can follow up about the book, its availability, and how to get your copy.',
    badge: 'Interest registration — not an order or payment',
    detail: 'A few details help us understand the people behind the research.',
    name: 'Full name', phone: 'Mobile number', university: 'University / institution', department: 'Department', profession: 'Profession',
    nameHint: 'As you would like us to address you', phoneHint: 'Bangladesh mobile number · 11 digits',
    universityHint: 'Your university or organization', departmentHint: 'e.g., Civil Engineering', professionHint: 'e.g., Student, Faculty, Researcher',
    consent: 'I agree that IOJH may store these details and contact me about this book. I understand this is not an order. Details are retained for up to 12 months; I may request withdrawal or deletion via hr.iojhltd@gmail.com.',
    submit: 'Register my interest', saving: 'Saving your registration…',
    safe: 'Private submission. No payment required.',
    successEyebrow: 'REGISTRATION RECEIVED', successTitle: 'Thank you for joining the conversation.',
    successMessage: 'Your details have been saved. IOJH may contact you about the book. No purchase has been made.',
    back: 'Return to the book',
    duplicate: 'This mobile number is already registered. Please use a different number only if it belongs to you.',
    verification: 'Security check expired. Please complete it again.',
    error: 'We could not save your registration. Please try again.',
    security: 'Please complete the security verification.',
    configure: 'Registration is not yet available. Please check again soon.',
    textError: 'Please enter a valid Bangladeshi mobile number such as 017XXXXXXXX.',
  },
  bn: {
    kicker: 'আপনার গবেষণা / পরবর্তী ধাপ',
    title: 'গবেষণার পরবর্তী যাত্রায় যুক্ত থাকুন।',
    accent: 'যুক্ত থাকুন।',
    intro: 'IOJH গবেষণা-সহায়ক বইটি সম্পর্কে আগ্রহ নিবন্ধন করুন। বইয়ের তথ্য, প্রাপ্যতা ও সংগ্রহের উপায় জানাতে আমাদের দল যোগাযোগ করতে পারবে।',
    badge: 'আগ্রহ নিবন্ধন — এটি অর্ডার বা পেমেন্ট নয়',
    detail: 'কিছু তথ্য আমাদের পাঠক ও গবেষকদের প্রয়োজন বুঝতে সাহায্য করবে।',
    name: 'পূর্ণ নাম', phone: 'মোবাইল নম্বর', university: 'বিশ্ববিদ্যালয় / প্রতিষ্ঠান', department: 'বিভাগ', profession: 'পেশা',
    nameHint: 'যে নামে আপনাকে সম্বোধন করব', phoneHint: 'বাংলাদেশি নম্বর · ১১ সংখ্যা',
    universityHint: 'আপনার বিশ্ববিদ্যালয় বা প্রতিষ্ঠানের নাম', departmentHint: 'যেমন: সিভিল ইঞ্জিনিয়ারিং', professionHint: 'যেমন: শিক্ষার্থী, শিক্ষক, গবেষক',
    consent: 'আমি সম্মত যে IOJH এই তথ্য সংরক্ষণ করে বইটি সম্পর্কে আমার সঙ্গে যোগাযোগ করতে পারবে। এটি অর্ডার নয়। তথ্য সর্বোচ্চ ১২ মাস রাখা হবে। সম্মতি প্রত্যাহার বা তথ্য মুছে দেওয়ার অনুরোধ: hr.iojhltd@gmail.com।',
    submit: 'আগ্রহ নিবন্ধন করুন', saving: 'নিবন্ধন সংরক্ষণ হচ্ছে…',
    safe: 'নিরাপদ তথ্য জমা। কোনো পেমেন্ট লাগবে না।',
    successEyebrow: 'নিবন্ধন সম্পন্ন হয়েছে', successTitle: 'আপনার আগ্রহের জন্য ধন্যবাদ।',
    successMessage: 'আপনার তথ্য সংরক্ষণ করা হয়েছে। বইটি সম্পর্কে IOJH যোগাযোগ করতে পারে। কোনো ক্রয় সম্পন্ন হয়নি।',
    back: 'বইয়ের পৃষ্ঠায় ফিরুন',
    duplicate: 'এই মোবাইল নম্বরটি দিয়ে আগেই নিবন্ধন করা হয়েছে।',
    verification: 'নিরাপত্তা যাচাইয়ের সময় শেষ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
    error: 'এখন নিবন্ধন সংরক্ষণ করা যাচ্ছে না। আবার চেষ্টা করুন।',
    security: 'অনুগ্রহ করে নিরাপত্তা যাচাই সম্পন্ন করুন।',
    configure: 'নিবন্ধন সেবা এখনো চালু হয়নি। পরে আবার চেষ্টা করুন।',
    textError: 'সঠিক বাংলাদেশি মোবাইল নম্বর লিখুন, যেমন 017XXXXXXXX।',
  },
} as const;

declare global {
  interface Window { turnstile?: { reset: () => void } }
}

export default function LeadRegistrationForm({ locale, source }: Props) {
  const t = content[locale];
  const form = useRef<HTMLFormElement>(null);
  const [phone, setPhone] = useState('');
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [rippleKey, setRippleKey] = useState(0);
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const ready = Boolean(key);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || !form.current) return;
    setError('');
    setRippleKey(n => n + 1);
    if (!ready) { setError(t.configure); return; }
    if (!/^01[3-9]\d{8}$/.test(phone)) { setError(t.textError); return; }
    const fields = new FormData(form.current);
    const token = fields.get('cf-turnstile-response');
    if (typeof token !== 'string' || !token) { setError(t.security); return; }
    setPending(true);
    // Keep the ripple legible even on a very fast connection; skip the hold when
    // the visitor has requested reduced motion.
    const rippleFinished = new Promise<void>(resolve => window.setTimeout(resolve,
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 620));
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fields.get('name'),
          phone,
          university: fields.get('university'),
          department: fields.get('department'),
          profession: fields.get('profession'),
          consent: fields.get('consent') === 'on',
          turnstileToken: token,
          source,
        }),
      });
      const body = await response.json().catch(() => ({})) as Result;
      await rippleFinished;
      if (response.ok && body.code === 'created') { setSuccess(true); return; }
      setError(body.code === 'duplicate' ? t.duplicate : body.code === 'verification' ? t.verification : t.error);
      window.turnstile?.reset();
    } catch {
      setError(t.error);
      window.turnstile?.reset();
    } finally { setPending(false); }
  }

  if (success) return (
    <section className={styles.successPanel} role="status" aria-live="polite">
      <span className={styles.successIcon}><Check size={38} aria-hidden="true" /></span>
      <span className={styles.micro}>{t.successEyebrow}</span>
      <h2>{t.successTitle}</h2>
      <p>{t.successMessage}</p>
      <a className={styles.returnLink} href={`/${locale}`}><ArrowRight size={18} aria-hidden="true" /> {t.back}</a>
    </section>
  );

  return (
    <section className={`${styles.formShell} ${locale === 'bn' ? styles.bn : ''}`} aria-label={t.submit}>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" strategy="afterInteractive" />
      <div className={styles.formHeading}>
        <span className={styles.micro}>{t.kicker}</span>
        <h1>{t.title}</h1>
        <p className={styles.intro}>{t.intro}</p>
        <p className={styles.noticeBadge}><Droplets size={16} aria-hidden="true" /> {t.badge}</p>
      </div>
      <form ref={form} onSubmit={submit} className={styles.form}>
        <p className={styles.formNote}>{t.detail}</p>
        <div className={styles.fields}>
          <label className={styles.field}><span>{t.name}<b aria-hidden="true">*</b></span>
            <input autoFocus autoComplete="name" name="name" type="text" required minLength={2} maxLength={100} placeholder={t.nameHint} />
          </label>
          <label className={styles.field}><span>{t.phone}<b aria-hidden="true">*</b></span>
            <input name="phone" type="tel" autoComplete="tel-national" inputMode="numeric" pattern="01[3-9][0-9]{8}" required maxLength={11} value={phone}
              onChange={e => setPhone(asciiDigits(e.target.value).replace(/\D/g, '').slice(0, 11))}
              placeholder="017XXXXXXXX" title={t.phoneHint} />
            <small>{t.phoneHint}</small>
          </label>
          <label className={styles.field}><span>{t.university}<b aria-hidden="true">*</b></span>
            <input autoComplete="organization" name="university" type="text" required minLength={2} maxLength={140} placeholder={t.universityHint} />
          </label>
          <label className={styles.field}><span>{t.department}<b aria-hidden="true">*</b></span>
            <input autoComplete="organization-title" name="department" type="text" required minLength={2} maxLength={100} placeholder={t.departmentHint} />
          </label>
          <label className={`${styles.field} ${styles.fullWidth}`}><span>{t.profession}<b aria-hidden="true">*</b></span>
            <input name="profession" type="text" required minLength={2} maxLength={80} placeholder={t.professionHint} list="iojh-professions" />
            <datalist id="iojh-professions"><option value="Student" /><option value="Researcher" /><option value="Faculty" /><option value="Professional" /></datalist>
          </label>
        </div>
        <label className={styles.consent}><input type="checkbox" name="consent" required /><span>{t.consent}</span></label>
        {ready ? <div className="cf-turnstile" data-sitekey={key} data-theme="light" data-size="normal" /> : <p className={styles.error}>{t.configure}</p>}
        {error ? <p role="alert" className={styles.error}>{error}</p> : null}
        <button type="submit" disabled={pending || !ready} className={`${styles.submit} ${pending ? styles.submitting : ''}`}>
          <span key={rippleKey} className={styles.ripple} aria-hidden="true" />
          <span className={styles.submitText}>{pending ? t.saving : t.submit}</span>
          <ArrowRight size={20} aria-hidden="true" />
        </button>
        <p className={styles.safeNote}><LockKeyhole size={14} aria-hidden="true" /> {t.safe}</p>
      </form>
    </section>
  );
}
