import { MailCheck } from 'lucide-react';
import { useTheme } from '../contexts';
import { cn } from '../lib/utils';

export const EmailConfirmationPage = () => {
  const { theme } = useTheme();
  
  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center px-4",
      theme === 'light' ? "bg-white" : "bg-duo-dark"
    )}>
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-8">
          <div className={cn(
            "w-24 h-24 rounded-full flex items-center justify-center transition-colors",
            theme === 'light' ? "bg-duo-green/10" : "bg-duo-green/20"
          )}>
            <MailCheck className="w-12 h-12 text-duo-green" strokeWidth={3} />
          </div>
        </div>
        <h1 className={cn(
          "text-3xl font-black mb-4",
          theme === 'light' ? "text-[#4B4B4B]" : "text-white"
        )}>Confirm Your Email</h1>
        <p className="text-duo-gray font-bold text-lg mb-8">
          We've sent a confirmation link to your email address. Please check your inbox and click the link to complete your registration.
        </p>

      </div>
    </div>
  );
};