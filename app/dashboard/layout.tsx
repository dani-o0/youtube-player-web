'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { FaHome, FaHeart, FaList, FaPlus, FaSignOutAlt } from 'react-icons/fa'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-white shadow-md">
        <nav className="mt-5 px-2">
          <Link href="/dashboard" className="group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:bg-gray-100 transition ease-in-out duration-150">
            <FaHome className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            Home
          </Link>
          <Link href="/dashboard/favorites" className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:bg-gray-100 transition ease-in-out duration-150">
            <FaHeart className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            Favorites
          </Link>
          <Link href="/dashboard/lists" className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:bg-gray-100 transition ease-in-out duration-150">
            <FaList className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            Lists
          </Link>
          <Link href="/dashboard/add" className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:bg-gray-100 transition ease-in-out duration-150">
            <FaPlus className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            Add Video
          </Link>
          <button onClick={handleSignOut} className="mt-1 group flex items-center px-2 py-2 text-base leading-6 font-medium rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none focus:bg-gray-100 transition ease-in-out duration-150">
            <FaSignOutAlt className="mr-4 h-6 w-6 text-gray-400 group-hover:text-gray-500" />
            Sign Out
          </button>
        </nav>
      </aside>
      <main className="flex-1 overflow-y-auto p-5">
        {children}
      </main>
    </div>
  )
}

