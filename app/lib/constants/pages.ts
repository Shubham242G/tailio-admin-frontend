// lib/constants/pages.ts

export const PAGE_OPTIONS = [
  // Main Pages
  { value: 'home', label: '🏠 Home' },
  { value: 'about', label: '📖 About Us' },
  { value: 'how-it-works', label: '⚡ How It Works' },
  { value: 'why-tailio', label: '❓ Why Tailio' },
  // Blog
  { value: 'blog', label: '📝 Blog' },
  // City Pages - /pet-registration-in-[city]
  { value: 'delhi', label: '🏛️ Pet Registration in Delhi' },
  { value: 'noida', label: '🏛️ Pet Registration in Noida' },
  { value: 'faridabad', label: '🏛️ Pet Registration in Faridabad' },
  { value: 'gurugram', label: '🏛️ Pet Registration in Gurugram' },
  { value: 'ghaziabad', label: '🏛️ Pet Registration in Ghaziabad' },
];

export const PAGE_OPTIONS_VALUES = PAGE_OPTIONS.map(p => p.value);
export const PAGE_OPTIONS_LABELS = PAGE_OPTIONS.map(p => p.label);

// For the form select options
export const PAGE_OPTIONS_GROUPS = {
  main: PAGE_OPTIONS.filter(p => 
    ['home', 'about', 'how-it-works', 'why-tailio'].includes(p.value)
  ),
  blog: PAGE_OPTIONS.filter(p => 
    ['blog'].includes(p.value)
  ),
  cities: PAGE_OPTIONS.filter(p => 
    ['delhi', 'noida', 'faridabad', 'gurugram', 'ghaziabad'].includes(p.value)
  ),
};