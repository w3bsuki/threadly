import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { FeedbackForm } from './components/feedback-form';
import { getDictionary } from '@repo/internationalization';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: 'Send Feedback',
    description: 'Help us improve Threadly with your thoughts',
  };
}

const FeedbackPage = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <Header pages={['Dashboard', 'Feedback']} page="Feedback" dictionary={dictionary} />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <FeedbackForm userEmail={user.emailAddresses[0]?.emailAddress} />
      </div>
    </>
  );
};

export default FeedbackPage;