import { useTranslation } from 'react-i18next';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';
import { cn } from '@/lib/utils';

const languages = [
  { code: 'pt', label: '🇧🇷 PT', fullLabel: '🇧🇷 Português' },
  { code: 'es', label: '🇪🇸 ES', fullLabel: '🇪🇸 Español' },
  { code: 'en', label: '🇺🇸 EN', fullLabel: '🇺🇸 English' },
];

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageSwitcher = ({ variant = 'compact', className }: LanguageSwitcherProps) => {
  const { i18n } = useTranslation();

  const currentLang = i18n.language?.split('-')[0] || 'pt';
  const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

  return (
    <Select value={currentLang} onValueChange={(lang) => i18n.changeLanguage(lang)}>
      <SelectTrigger
        className={cn(
          "w-auto gap-2 bg-transparent border-none shadow-none focus:ring-0",
          className
        )}
      >
        <Globe className="w-4 h-4" />
        <SelectValue>
          {variant === 'compact' ? currentLanguage.label : currentLanguage.fullLabel}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            {variant === 'compact' ? lang.label : lang.fullLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguageSwitcher;
