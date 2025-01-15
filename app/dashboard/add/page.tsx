'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { addVideo, createList, getUserLists, updateList } from '@/lib/firestore'
import type { ListDocument } from '@/types/database'
import { FaHeart, FaPlus } from 'react-icons/fa'
import { useEffect } from 'react'

export default function AddVideo() {
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedListId, setSelectedListId] = useState('')
  const [lists, setLists] = useState<ListDocument[]>([])
  const [loading, setLoading] = useState(false)
  const [showNewListForm, setShowNewListForm] = useState(false)
  const [newListName, setNewListName] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchLists = async () => {
      if (!user) return
      try {
        const listsData = await getUserLists(user.uid)
        setLists(listsData)
      } catch (error) {
        console.error('Error fetching lists:', error)
      }
    }

    fetchLists()
  }, [user])

  const handleCreateList = async () => {
    if (!user || !newListName.trim()) return

    try {
      setLoading(true)
      const newListId = await createList({
        name: newListName.trim(),
        userId: user.uid,
        videos: []
      })
      
      // Refresh lists
      const listsData = await getUserLists(user.uid)
      setLists(listsData)
      
      // Seleccionar automáticamente la lista recién creada
      setSelectedListId(newListId)
      
      setNewListName('')
      setShowNewListForm(false)
      
      // Mostrar mensaje de éxito
      alert('List created successfully!')
    } catch (error) {
      console.error('Error creating list:', error)
      alert('Failed to create list')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      setLoading(true)
      
      // Create the video document with the listId if a list is selected
      const videoId = await addVideo({
        title,
        url,
        isFavorite,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        listId: selectedListId
      })

      // If a list is selected, update the list's videos array
      if (selectedListId) {
        const selectedList = lists.find(list => list.id === selectedListId)
        if (selectedList) {
          const updatedVideos = [...(selectedList.videos || []), videoId]
          await updateList(selectedListId, {
            videos: updatedVideos
          })
        }
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error adding video:', error)
      alert('Error adding video')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New Video</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Video Title
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              Video URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="YouTube URL (youtube.com, youtu.be) or Instagram Reel URL"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Add to List
            </label>
            <div className="flex items-center gap-2 mb-2">
              <select
                value={selectedListId}
                onChange={(e) => setSelectedListId(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">None</option>
                {lists.map((list) => (
                  <option key={list.id} value={list.id}>
                    {list.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setShowNewListForm(true)}
                className="p-2 text-indigo-600 hover:text-indigo-700"
              >
                <FaPlus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {showNewListForm && (
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Create New List</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="List name"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleCreateList}
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewListForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsFavorite(!isFavorite)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                isFavorite 
                  ? 'text-red-600 bg-red-50 hover:bg-red-100' 
                  : 'text-gray-700 bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <FaHeart className={isFavorite ? 'text-red-600' : 'text-gray-400'} />
              {isFavorite ? 'Added to Favorites' : 'Add to Favorites'}
            </button>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Adding Video...' : 'Add Video'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

