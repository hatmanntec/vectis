import {
  Building2,
  FileText,
  History,
  Image as ImageIcon,
  Inbox,
  LayoutDashboard,
  Layers,
  Newspaper,
  Settings,
  TrendingUp,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/**
 * The CMS sidebar. Modules not built yet are listed but switched off and
 * labelled with the milestone that adds them, so there are no dead buttons.
 * To switch a module on, set `ready: true`.
 */
export type NavItem = { label: string; href: string; icon: LucideIcon; ready: boolean; milestone?: string };
export type NavGroup = { label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", href: "/admin", icon: LayoutDashboard, ready: true }],
  },
  {
    label: "Content",
    items: [
      { label: "Companies", href: "/admin/companies", icon: Building2, ready: false, milestone: "M6" },
      { label: "Investments", href: "/admin/investments", icon: TrendingUp, ready: false, milestone: "M7" },
      { label: "Projects", href: "/admin/projects", icon: Wrench, ready: false, milestone: "M8" },
      { label: "News & Media", href: "/admin/news", icon: Newspaper, ready: false, milestone: "M9" },
      { label: "Leadership", href: "/admin/leadership", icon: Users, ready: false, milestone: "M10" },
      { label: "Website Pages", href: "/admin/pages", icon: FileText, ready: false, milestone: "M10" },
    ],
  },
  {
    label: "Library",
    items: [
      { label: "Sectors", href: "/admin/sectors", icon: Layers, ready: true },
      { label: "Media Library", href: "/admin/media", icon: ImageIcon, ready: true },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "Enquiries", href: "/admin/enquiries", icon: Inbox, ready: false, milestone: "M10" },
      { label: "Audit Log", href: "/admin/audit-log", icon: History, ready: true },
      { label: "Settings", href: "/admin/settings", icon: Settings, ready: true },
    ],
  },
];
