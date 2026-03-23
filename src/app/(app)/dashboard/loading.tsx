import React from "react";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-background-light dark:bg-background-dark animate-pulse">
      <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/50 backdrop-blur-md" />
      <main className="flex flex-1 flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-8">
        <aside className="w-64 hidden md:flex flex-col gap-6">
           <div className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
           <div className="space-y-3">
             {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg" />)}
           </div>
        </aside>
        <div className="flex-1 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
           </div>
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="h-14 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1,2].map(i => <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
                </div>
              </div>
              <div className="lg:col-span-4 space-y-8">
                <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}
