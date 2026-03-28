// src/pages/SuspendedPage.tsx
import { useRoles } from '@/contexts/RoleContext';
import { SignOutButton } from '@clerk/clerk-react';
import { Link } from 'react-router-dom';
import { PauseCircle, Mail, LogOut, AlertTriangle, LayoutDashboard } from 'lucide-react';

export default function SuspendedPage() {
  const { suspendReason } = useRoles();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Orange top bar */}
          <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-500" />

          <div className="p-8 text-center">
            {/* Icon */}
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <PauseCircle className="w-10 h-10 text-orange-500" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Designer Account Suspended
            </h1>
            <p className="text-gray-500 mb-6">
              Your designer access has been temporarily suspended by our team.
            </p>

            {/* Reason box */}
            {suspendReason && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-orange-800 mb-1">Reason for suspension</p>
                    <p className="text-sm text-orange-700">{suspendReason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* What's affected */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
              <p className="text-sm font-semibold text-gray-700">What's affected:</p>
              <ul className="space-y-2">
                {[
                  'You cannot bid on or receive new projects',
                  'Your designer profile is hidden from clients',
                  'Existing active projects remain unaffected',
                  'Your client account still works normally',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0 mt-1.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Key difference from ban — they still have client access */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8 text-left">
              <p className="text-sm text-blue-700">
                <span className="font-semibold">Good news:</span> Your client account is still active.
                You can still browse, post projects, and hire designers.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <Link
                to="/dashboard/client"
                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition"
              >
                <LayoutDashboard className="w-4 h-4" />
                Go to Client Dashboard
              </Link>
              <a
                href="mailto:support@hudumalink.com?subject=Designer Suspension Appeal"
                className="flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition"
              >
                <Mail className="w-4 h-4" />
                Appeal Suspension
              </a>
              <SignOutButton>
                <button className="flex items-center justify-center gap-2 px-6 py-3 text-gray-400 text-sm hover:text-gray-600 transition w-full">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-4">
          Suspensions are reviewed within 48 hours. Contact{' '}
          <a href="mailto:support@hudumalink.com" className="underline">
            support@hudumalink.com
          </a>{' '}
          to appeal.
        </p>
      </div>
    </div>
  );
}