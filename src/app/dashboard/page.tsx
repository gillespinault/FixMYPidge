'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAuthStore } from '@/store/auth-store'
import { useCaseStore } from '@/store/case-store'
import { CaseCard } from '@/components/CaseCard'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { PlusIcon } from '@heroicons/react/24/outline'

export default function DashboardPage() {
  const { user, signOut } = useAuthStore()
  const { cases, loading, fetchCases } = useCaseStore()

  useEffect(() => {
    if (user) {
      fetchCases()
    }
  }, [user, fetchCases])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">FixMyPidge</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Mes signalements</h2>
              <p className="text-gray-600 mt-1">
                Suivez l&apos;état de vos signalements de pigeons
              </p>
            </div>
            <Link
              href="/case/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nouveau signalement
            </Link>
          </div>
        </div>

        {/* Cases grid */}
        {cases.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-300">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Aucun signalement
            </h3>
            <p className="mt-2 text-gray-500">
              Vous n&apos;avez pas encore créé de signalement.
            </p>
            <div className="mt-6">
              <Link
                href="/case/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Créer mon premier signalement
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cases.map((case_item) => (
              <CaseCard key={case_item.id} case={case_item} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}