export function LotusEmblem({ className = 'w-8 h-8' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="32"
        cy="32"
        r="29"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeDasharray="3 3"
        opacity="0.65"
      />
      <path
        d="M32 12C35.5 21 38 27 32 37C26 27 28.5 21 32 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M32 37C22 33 17 25 18 18C24 21 29 27 32 37Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M32 37C42 33 47 25 46 18C40 21 35 27 32 37Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <path
        d="M14 38C21 41 28 41 32 39C36 41 43 41 50 38"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <path
        d="M27 45C29.5 47 34.5 47 37 45"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="32" cy="8" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function AstrolabeSeal({
  className = 'w-64 h-64',
}: {
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <circle
        cx="120"
        cy="120"
        r="112"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeDasharray="4 6"
      />
      <circle cx="120" cy="120" r="96" stroke="currentColor" strokeWidth="0.7" />
      <circle
        cx="120"
        cy="120"
        r="72"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 4"
      />
      <polygon
        points="120,24 146,94 216,120 146,146 120,216 94,146 24,120 94,94"
        stroke="currentColor"
        strokeWidth="0.8"
        fill="none"
      />
      <circle cx="120" cy="120" r="24" stroke="currentColor" strokeWidth="1" />
      <path
        d="M126 105C116 107 110 118 114 128C117 135 125 139 132 136C125 135 120 129 120 121C120 114 123 108 126 105Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function SacredDivider({ className = '' }: { className?: string }) {
  return (
    <div
      className={`flex items-center justify-center gap-4 my-3 ${className}`}
      aria-hidden="true"
    >
      <span className="h-px w-14 bg-gradient-to-r from-transparent to-[#C6A16B]/60" />
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4 text-[#C6A16B]"
        fill="none"
      >
        <path
          d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
          stroke="currentColor"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
      </svg>
      <span className="h-px w-14 bg-gradient-to-l from-transparent to-[#C6A16B]/60" />
    </div>
  );
}
