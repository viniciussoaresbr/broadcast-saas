type BrandMarkProps = {
  size?: number;
  className?: string;
};

const BrandMark = ({ size = 28, className }: BrandMarkProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    aria-hidden
    className={className}
  >
    <rect
      width="32"
      height="32"
      rx="8"
      style={{ fill: 'var(--mui-palette-primary-main)' }}
    />
    <circle cx="11" cy="21" r="3" fill="#FFFFFF" />
    <path
      d="M11 13.5a7.5 7.5 0 0 1 7.5 7.5"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M11 7.5A13.5 13.5 0 0 1 24.5 21"
      fill="none"
      stroke="#FFFFFF"
      strokeWidth="2.4"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const Wordmark = () => (
  <span className="flex items-center gap-2.5">
    <BrandMark />
    <span className="text-[1.0625rem] font-semibold tracking-[-0.01em] text-ink">
      Broadcast
    </span>
  </span>
);

export default BrandMark;
