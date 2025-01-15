'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getFavoriteVideos } from '@/lib/firestore'
import type { VideoDocument } from '@/types/database'
import { FaHeart } from 'react-icons/fa'
import { VideoEmbed } from '@/components/VideoEmbed'

export default function Favorites() {
  const [videos, setVideos] = useState<VideoDocument[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchFavoriteVideos = async () => {
      if (!user) return

      try {
        const videosData = await getFavoriteVideos(user.uid)
        setVideos(videosData)
      } catch (error) {
        console.error('Error fetching favorite videos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFavoriteVideos()
  }, [user])

  const getVideoId = (url: string) => {
    try {
      const urlParams = new URLSearchParams(new URL(url).search)
      return urlParams.get('v')
    } catch (error) {
      return null
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
      <h1 className="text-2xl font-bold mb-6">Favorite Videos</h1>
      {videos.length === 0 ? (
        <p className="text-gray-600">You haven't added any videos to your favorites yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <VideoEmbed url={video.url} title={video.title} />
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <h2 className="font-bold text-lg mb-2 truncate flex-1">
                    {video.title}
                  </h2>
                  <FaHeart className="text-red-500 flex-shrink-0 ml-2" />
                </div>
                <div className="text-sm text-gray-500">
                  Added: {new Date(video.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

