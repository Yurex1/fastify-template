import { Loader2 } from 'lucide-react';

export const Loader = ({ className }: { className?: string }) => (
  <div className={`flex items-center justify-center ${className}`}>
    <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
  </div>
);
