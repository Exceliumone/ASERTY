import {
  Home,
  CalendarDays,
  BarChart3,
  Image as ImageIcon,
  FileText,
  Bot,
  History,
  Sparkles,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navItems: NavItem[] = [
  { label: 'Accueil', href: '/', icon: Home },
  { label: 'Calendrier', href: '/calendrier', icon: CalendarDays },
  { label: 'Statistiques', href: '/statistiques', icon: BarChart3 },
  { label: "Bibliothèque d'images", href: '/images', icon: ImageIcon },
  { label: 'Bibliothèque de prompts', href: '/prompts', icon: FileText },
  { label: 'Agents IA', href: '/agents', icon: Bot },
  { label: 'Historique', href: '/historique', icon: History },
  { label: 'Suggestions', href: '/suggestions', icon: Sparkles },
  { label: 'Réglages', href: '/reglages', icon: Settings },
];
