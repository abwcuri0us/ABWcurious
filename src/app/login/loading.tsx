import { Skeleton } from '@/components/ui/skeleton'
export default function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-8 w-48 mx-auto" />
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  )
}