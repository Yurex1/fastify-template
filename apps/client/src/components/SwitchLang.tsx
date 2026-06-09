import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import useUserStore from '../stores/user';
import { LANG } from '../utils/consts/lang';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export const SwitchLangBtn = () => {
  const { i18n } = useTranslation();
  const setLanguage = useUserStore((s) => s.setLanguage);

  const handleChange = (value: string) => {
    i18n.changeLanguage(value);
    setLanguage(value);
  };

  return (
    <Select value={i18n.language} onValueChange={handleChange}>
      <SelectTrigger className="w-[120px] bg-gray-900 border-gray-700 text-gray-300">
        <div className="flex items-center gap-2">
          <Globe size={16} />
          <SelectValue placeholder="Language" />
        </div>
      </SelectTrigger>
      <SelectContent className="bg-gray-900 border-gray-700">
        <SelectItem value={LANG.EN} className="text-gray-300">
          English
        </SelectItem>
        <SelectItem value={LANG.UK} className="text-gray-300">
          Українська
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
