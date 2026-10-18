import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'রিসার্চ মেথড, ম্যানুস্ক্রিপ্ট প্রিপারেশন এবং পাবলিকেশন | IOJH',
  description: '৫০৪ পৃষ্ঠার বাংলা গবেষণা ও প্রকাশনা বিষয়ক বই। বইটি সম্পর্কে জানুন, ৫ পৃষ্ঠা বিনামূল্যে পড়ুন এবং IOJH থেকে অর্ডার করুন।',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn">
      <body>{children}</body>
    </html>
  );
}
