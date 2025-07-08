import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Header } from '../components/header';
import { FeedbackForm } from './components/feedback-form';

const title = 'Send Feedback';
const description = 'Help us improve Threadly with your thoughts';

export const metadata: Metadata = {
  title,
  description,
};

const FeedbackPage = async () => {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  return (
    <>
      <Header pages={['Dashboard', 'Feedback']} page="Feedback" />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
        <FeedbackForm userEmail={user.emailAddresses[0]?.emailAddress} />
      </div>
    </>
  );
};

export default FeedbackPage;