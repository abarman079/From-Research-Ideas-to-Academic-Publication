import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, ShieldCheck } from 'lucide-react';
import { isLocale } from '@/i18n/copy';
import { IOJH_LOGO_PATH } from '@/lib/brand';
import { parseLeadSource } from '@/lib/lead-validation';
import { getSiteUrl, isIndexableDeployment } from '@/lib/site';
import LeadRegistrationForm from '@/components/LeadRegistrationForm';
import styles from '@/components/LeadRegistration.module.css';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ source?: string | string[] }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const bn = locale === 'bn';
  const url = `${getSiteUrl()}/${locale}/register`;
  return {
    title: bn ? 'বইয়ের বিষয়ে আগ্রহ নিবন্ধন | IOJH' : 'Book interest registration | IOJH',
    description: bn ? 'IOJH গবেষণা বই সম্পর্কে জানতে আগ্রহ নিবন্ধন করুন।' : 'Register your interest in the IOJH research guide. No payment required.',
    alternates: { canonical: url, languages: { 'bn-BD': `${getSiteUrl()}/bn/register`, en: `${getSiteUrl()}/en/register` } },
    robots: isIndexableDeployment() ? { index: true, follow: true } : { index: false, follow: false },
  };
}

export default async function RegisterPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const query = await searchParams;
  const source = parseLeadSource(query.source);
  const bn = locale === 'bn';
  return (
    <main className={`${styles.page} ${bn ? styles.bn : ''}`}>
      <div className={styles.topbar}>
        <a className={styles.brand} href={`/${locale}`} aria-label="IOJH book homepage">
          {IOJH_LOGO_PATH ? <Image src={IOJH_LOGO_PATH} width={105} height={56} alt="IOJH" className={styles.logo} /> : <strong>IOJH.</strong>}
          <span>BOOK COLLECTION</span>
        </a>
        <a className={styles.back} href={`/${locale}`}><ArrowLeft size={17} aria-hidden="true" /> {bn ? 'বইয়ের পৃষ্ঠায় ফিরুন' : 'Back to the book'}</a>
      </div>
      <div className={styles.pageGrid}>
        <aside className={styles.story}>
          <div className={styles.storyTop}><span className={styles.storyIndex}>IOJH / 001</span><span>{bn ? 'গবেষণা-সহায়ক গ্রন্থ' : 'THE RESEARCH GUIDE'}</span></div>
          <div className={styles.storyContent}>
            <p className={styles.storyOverline}>{bn ? 'জানার পথ এখানেই থেমে নেই' : 'THE JOURNEY CONTINUES'}</p>
            <h2>{bn ? <>A good question.<br /><em>একটি নতুন শুরু।</em></> : <>Every question<br />opens <em>a door.</em></>}</h2>
            <p>{bn ? 'গবেষণা পদ্ধতি, পাণ্ডুলিপি প্রস্তুতি ও প্রকাশনা—একটি বই, আরও অনেক প্রশ্ন। বইটি সম্পর্কে জানতে আপনার আগ্রহ নিবন্ধন করুন।' : 'Research methods. Manuscript preparation. Publication. One Bengali-language guide, and an invitation to keep exploring.'}</p>
          </div>
          <div className={styles.storyFooter}><BookOpen size={18} aria-hidden="true" /> <span>{bn ? 'বই সম্পর্কে আগ্রহ নিবন্ধন' : 'An invitation to learn, not an order'}</span></div>
        </aside>
        <LeadRegistrationForm locale={locale} source={source} />
      </div>
      <div className={styles.pageBottom}><ShieldCheck size={15} aria-hidden="true" /> <span>{bn ? 'আপনার তথ্য শুধু অনুমোদিত IOJH টিম ব্যবহার করবে।' : 'Registration details are accessible only to authorized IOJH staff.'}</span></div>
    </main>
  );
}
