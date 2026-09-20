import React from 'react';
import { AlertCircle, ShieldCheck } from 'lucide-react';
import { useTranslation } from '../../i18n';

export const DisclaimerBanner = () => {
  const { t } = useTranslation();

  return (
    <div className="bg-amber-500 text-white text-xs px-3 py-1.5 font-medium flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-2 max-w-5xl mx-auto w-full">
        <span className="bg-black/20 text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded">
          DEMO DATA
        </span>
        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
        <p className="truncate">
          {t('ai_disclaimer', 'AI-assisted screening indicator. Confirm critical crop issues with local agricultural officers. Data shown is simulated for demonstration.')}
        </p>
      </div>
    </div>
  );
};

export default DisclaimerBanner;
