import React from 'react';
import { HeartHandshake, Phone, MessageSquare, ShieldAlert, X, ExternalLink } from 'lucide-react';

const SafetyCrisisModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="relative bg-white dark:bg-gray-900 border border-red-200 dark:border-red-900/60 rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 text-gray-900 dark:text-gray-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center shadow-xs">
            <HeartHandshake className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">You Are Not Alone</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Immediate, confidential, and free 24/7 human support</p>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
          FriendAI is an artificial intelligence wellness companion, but right now, having a compassionate human listener is what matters most. Please connect directly with one of these trusted services:
        </p>

        {/* Crisis Contact Cards */}
        <div className="space-y-2.5 mb-5">
          <div className="p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Phone className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-900 dark:text-red-200">988 Suicide & Crisis Lifeline</p>
                <p className="text-xs text-red-700 dark:text-red-300">USA & Canada - Call or Text 988 (Free, 24/7, Confidential)</p>
              </div>
            </div>
            <a
              href="tel:988"
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
            >
              Call 988
            </a>
          </div>

          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-blue-900 dark:text-blue-200">Crisis Text Line</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">Text HOME to 741741 to connect with a Crisis Counselor</p>
              </div>
            </div>
            <a
              href="sms:741741&body=HOME"
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
            >
              Text
            </a>
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-xs space-y-1.5 text-gray-700 dark:text-gray-300">
            <p className="font-semibold text-gray-900 dark:text-white">International Support Resources:</p>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <div>🇬🇧 <strong>UK:</strong> 111 or 116 123</div>
              <div>🇮🇳 <strong>India:</strong> 1800-599-0019</div>
              <div>🇦🇺 <strong>Australia:</strong> 13 11 14</div>
              <div>🇪🇺 <strong>Europe:</strong> 112 (Emergency)</div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-xl text-[11px] text-amber-800 dark:text-amber-200 flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
          <span>If you or someone you know is in immediate physical danger, please call your local emergency services (911/112/999) or proceed to the nearest emergency medical room.</span>
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-white text-white dark:text-gray-900 rounded-xl transition-colors"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyCrisisModal;
