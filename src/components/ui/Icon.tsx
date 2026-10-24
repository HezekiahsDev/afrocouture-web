import React from 'react';
import {
  ArrowLeft,
  ArrowLeftRight,
  ArrowRight,
  Award,
  BadgeCheck,
  Box,
  Calculator,
  Camera,
  ChartLine,
  Check,
  ChevronDown,
  CircleCheck,
  CircleCheckBig,
  ClipboardCheck,
  CloudUpload,
  FileSearch,
  FileText,
  Fingerprint,
  Gavel,
  Gem,
  HardDriveDownload,
  Headset,
  IdCard,
  Landmark,
  LoaderCircle,
  LocateFixed,
  Lock,
  LockKeyhole,
  MapPin,
  MapPinned,
  Medal,
  MessageCircle,
  Minus,
  Package,
  Pencil,
  Percent,
  Phone,
  Plus,
  RefreshCw,
  Ruler,
  ScanLine,
  Shield,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  TrendingUp,
  Truck,
  User,
  WandSparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/* Material Symbols names from the Stitch exports → lucide equivalents */
const icons = {
  account_balance: Landmark,
  add: Plus,
  arrow_back: ArrowLeft,
  arrow_forward: ArrowRight,
  assignment_turned_in: ClipboardCheck,
  auto_awesome: Sparkles,
  auto_fix_high: WandSparkles,
  badge: IdCard,
  bolt: Zap,
  calculate: Calculator,
  call: Phone,
  camera: Camera,
  chat: MessageCircle,
  check: Check,
  check_circle: CircleCheck,
  cloud_done: CloudUpload,
  description: FileText,
  diamond: Gem,
  document_scanner: ScanLine,
  edit: Pencil,
  expand_more: ChevronDown,
  fingerprint: Fingerprint,
  gavel: Gavel,
  headset_mic: Headset,
  inventory_2: Package,
  local_shipping: Truck,
  location_on: MapPin,
  lock: Lock,
  military_tech: Medal,
  my_location: LocateFixed,
  percent: Percent,
  person: User,
  picture_as_pdf: FileText,
  pin_drop: MapPinned,
  policy: FileSearch,
  progress_activity: LoaderCircle,
  query_stats: ChartLine,
  remove: Minus,
  security: Shield,
  shield_lock: LockKeyhole,
  storefront: Store,
  straighten: Ruler,
  styler: Shirt,
  support_agent: Headset,
  switch_account: ArrowLeftRight,
  sync: RefreshCw,
  sync_saved_locally: HardDriveDownload,
  task_alt: CircleCheckBig,
  trending_up: TrendingUp,
  verified: BadgeCheck,
  verified_user: ShieldCheck,
  view_in_ar: Box,
  workspace_premium: Award,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'ref'> {
  name: IconName;
}

/** Sized by the surrounding font-size (1em), so `text-[18px]` classes keep working. */
export function Icon({ name, className, ...props }: IconProps) {
  const Glyph = icons[name];
  return (
    <Glyph
      size="1em"
      strokeWidth={2}
      aria-hidden="true"
      className={cn('inline-block shrink-0', className)}
      {...props}
    />
  );
}

export default Icon;
