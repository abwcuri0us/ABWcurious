import { StatsSkeleton, CardListSkeleton } from '@/components/SkeletonLoaders'
export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6">
      <StatsSkeleton />
      <CardListSkeleton count={4} />
    </div>
  )
}