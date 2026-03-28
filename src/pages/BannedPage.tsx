// src/pages/BannedPage.tsx
import { Link } from 'react-router-dom';
import { useRoles } from '@/contexts/RoleContext';
import { SignOutButton } from '@clerk/clerk-react';
import { ShieldX, Mail, LogOut, AlertTriangle } from 'lucide-react';

export default function BannedPage() {
  const { banReason } = useRoles();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Red top bar */}
          <div className="h-2 bg-gradient-to-r from-red-500 to-red-600" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldX className="w-10 h-10 text-red-600" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Your Account Has Been Banned
            </h1>
            <p className="text-gray-500 mb-6">
              Access to Hudumalink has been restricted for your account.
            </p>

            {/* Reason box */}
            {banReason && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 mb-1">Reason for ban</p>
                    <p className="text-sm text-red-700">{banReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* What happens now */}
            <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-3">
              <p className="text-sm font-semibold text-gray-700">What this means:</p>
              <ul className="space-y-2">
                {[
                  'You cannot post or bid on projects',
                  'Your profile is no longer visible',
                  'Active projects may be affected',
                  'You can appeal by contacting support',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <a
                href="mailto:support@hudumalink.com?subject=Account Ban Appeal"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition"
              >
                <Mail className="w-4 h-4" />
                Contact Support to Appeal
              </a>
              <SignOutButton>
                <button className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition w-full">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          If you believe this is a mistake, please reach out to{' '}
          <a href="mailto:support@hudumalink.com" className="underline">
            support@hudumalink.com
          </a>
        </p>
      </div>
    </div>
  );
}