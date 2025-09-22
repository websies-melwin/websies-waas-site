'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Detect current language from URL
  const currentLang = pathname.startsWith('/vi') ? 'vi' : 'en';
  const currentLanguage = languages.find(lang => lang.code === currentLang) || languages[0];

  const switchLanguage = (langCode: string) => {
    // Remove existing locale from path
    let newPath = pathname;
    if (pathname.startsWith('/vi')) {
      newPath = pathname.slice(3);
    } else if (pathname.startsWith('/en')) {
      newPath = pathname.slice(3);
    }

    // Add new locale if not English (English is default, no prefix)
    if (langCode === 'vi') {
      newPath = `/vi${newPath}`;
    }

    // Set cookie for persistence
    document.cookie = `locale=${langCode};path=/;max-age=31536000`;

    // Navigate to new path
    router.push(newPath);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        aria-label="Change language"
        aria-expanded={isOpen}
        data-testid="language-switch"
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-medium">{currentLanguage.code.toUpperCase()}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-lg overflow-hidden z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
              aria-current={lang.code === currentLang}
            >
              <span className="text-lg">{lang.flag}</span>
              <span className="text-sm font-medium">{lang.name}</span>
              {lang.code === currentLang && (
                <span className="ml-auto text-[var(--accent-cyan)] text-xs">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}