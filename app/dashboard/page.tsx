'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getUserVideos, getList, deleteVideo } from '@/lib/firestore'
import type { VideoDocument } from '@/types/database'
import { FaHeart, FaTrash } from 'react-icons/fa'
import { VideoEmbed } from '@/components/VideoEmbed'

export default function Dashboard() {
  const [videos, setVideos] = useState<VideoDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [listNames, setListNames] = useState<{[key: string]: string}>({})
  const { user } = useAuth()

  useEffect(() => {
    const fetchVideos = async () => {
      if (!user) return

      try {
        const videosData = await getUserVideos(user.uid)
        setVideos(videosData)

        // Fetch list names for all unique listIds
        const uniqueListIds = [...new Set(videosData.map(v => v.listId).filter(Boolean))]
        const listNamesMap: {[key: string]: string} = {}
        
        await Promise.all(
          uniqueListIds.map(async (listId) => {
            if (typeof listId === 'string') {
              const list = await getList(listId)
              if (list) {
                listNamesMap[listId] = list.name
              }
            }
          })
        )
        
        setListNames(listNamesMap)
      } catch (error) {
        console.error('Error fetching videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [user])

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) return

    try {
      await deleteVideo(videoId)
      // Update the UI by removing the deleted video
      setVideos(videos.filter(v => v.id !== videoId))
    } catch (error) {
      console.error('Error deleting video:', error)
      alert('Error deleting video')
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
      <h1 className="text-2xl font-bold mb-6">My Videos</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-w-16 aspect-h-9">
              <VideoEmbed url={video.url} title={video.title} />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg mb-2 truncate flex-1">
                  {video.title}
                </h2>
                <div className="flex items-center gap-2">
                  {video.isFavorite && (
                    <FaHeart className="text-red-500 flex-shrink-0" />
                  )}
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Delete video"
                  >
                    <FaTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Added: {new Date(video.createdAt).toLocaleDateString()}
              </div>
              {video.listId && listNames[video.listId] && (
                <div className="text-sm text-gray-500">
                  In list: {listNames[video.listId]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

