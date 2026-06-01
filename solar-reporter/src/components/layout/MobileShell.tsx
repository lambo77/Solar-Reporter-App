'use client'
export function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-start">
      <div className="w-full max-w-[390px] min-h-screen bg-slate-900 flex flex-col shadow-2xl">
        {children}
      </div>
    </div>
  )
}
