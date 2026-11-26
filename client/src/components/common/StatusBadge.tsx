import type { BookingStatus } from '../../types';

const STATUS_STYLES: Record<
  BookingStatus,
  { label: string; classes: string; dot: string }
> = {
  pending: {
    label: 'Awaiting Confirmation',
    classes:
      'bg-[#FBF3E4] text-[#8B6220] border border-[#C6A16B]/45',
    dot: 'bg-[#C6A16B]',
  },
  accepted: {
    label: 'Confirmed',
    classes:
      'bg-[#EFE8F6] text-[#4E2E68] border border-[#9E82BC]/45',
    dot: 'bg-[#7A549E]',
  },
  completed: {
    label: 'Completed',
    classes:
      'bg-[#EAF4EE] text-[#265B3F] border border-[#6FA787]/40',
    dot: 'bg-[#3C865E]',
  },
  rejected: {
    label: 'Declined',
    classes:
      'bg-[#F9E8EA] text-[#8E3B46] border border-[#DFB4B6]',
    dot: 'bg-[#B5727B]',
  },
  cancelled: {
    label: 'Cancelled',
    classes:
      'bg-[#F2EFEF] text-[#6E616B] border border-[#D4CAD1]',
    dot: 'bg-[#8F808B]',
  },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${cfg.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

