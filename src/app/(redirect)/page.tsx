import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function HomeRedirect() {
  const jar = await cookies();
  const selected = jar.get('iojh-book-locale')?.value;
  redirect(selected === 'en' ? '/en' : '/bn');
}
