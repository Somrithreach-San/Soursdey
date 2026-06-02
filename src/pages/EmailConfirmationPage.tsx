import { MailCheck } from 'lucide-react';

export const EmailConfirmationPage = () => {
  return (
    <div className="min-h-screen bg-duo-dark flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-duo-green/20 flex items-center justify-center">
            <MailCheck className="w-12 h-12 text-duo-green" strokeWidth={3} />
          </div>
        </div>
        <h1 className="text-3xl font-black text-white mb-4">Confirm Your Email</h1>
        <p className="text-duo-gray font-bold text-lg mb-8">
          We've sent a confirmation link to your email address. Please check your inbox and click the link to complete your registration.
        </p>

      </div>
    </div>
  );
};