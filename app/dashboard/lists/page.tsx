'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserLists, deleteList } from '@/lib/firestore'
import type { ListDocument } from '@/types/database'
import Link from 'next/link'
import { FaList, FaTrash } from 'react-icons/fa'

export default function Lists() {
  const [lists, setLists] = useState<ListDocument[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchLists = async () => {
      if (!user) return

      try {
        const listsData = await getUserLists(user.uid)
        setLists(listsData)
      } catch (error) {
        console.error('Error fetching lists:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchLists()
  }, [user])

  const handleDeleteList = async (listId: string) => {
    if (!confirm('Are you sure you want to delete this list? All videos will be removed from the list.')) return

    try {
      await deleteList(listId)
      // Update the UI by removing the deleted list
      setLists(lists.filter(l => l.id !== listId))
    } catch (error) {
      console.error('Error deleting list:', error)
      alert('Error deleting list')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Lists</h1>
      {lists.length === 0 ? (
        <p className="text-gray-600">You haven't created any lists yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lists.map((list) => (
            <div key={list.id} className="relative">
              <Link href={`/dashboard/lists/${list.id}`}>
                <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200">
                  <div className="flex items-center mb-4">
                    <FaList className="text-indigo-500 mr-2" />
                    <h2 className="text-xl font-semibold">{list.name}</h2>
                  </div>
                  <p className="text-gray-600">
                    {list.videos.length} video{list.videos.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteList(list.id);
                }}
                className="absolute top-2 right-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete list"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

