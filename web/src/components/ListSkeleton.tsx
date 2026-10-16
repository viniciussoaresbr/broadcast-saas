import Skeleton from '@mui/material/Skeleton';

type ListSkeletonProps = {
  rows?: number;
  /** Accessible label announced while loading. */
  label?: string;
};

/** Placeholder rows shaped like the lists they stand in for. */
const ListSkeleton = ({
  rows = 3,
  label = 'Carregando',
}: ListSkeletonProps) => (
  <div role="status" aria-label={label} className="flex flex-col gap-1">
    {Array.from({ length: rows }, (_, index) => (
      <div
        key={index}
        className="flex items-center gap-3 px-3 py-3"
        aria-hidden
      >
        <Skeleton variant="rounded" width={36} height={36} />
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton variant="text" width={`${55 - index * 8}%`} height={16} />
          <Skeleton variant="text" width="30%" height={14} />
        </div>
      </div>
    ))}
  </div>
);

export default ListSkeleton;
