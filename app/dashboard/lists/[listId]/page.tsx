'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getListVideos, getListDetails } from '@/lib/firestore'
import type { VideoDocument, ListDocument } from '@/types/database'
import { FaHeart, FaArrowLeft } from 'react-icons/fa'
import { VideoEmbed } from '@/components/VideoEmbed'

export default function ListVideos() {
  const [videos, setVideos] = useState<VideoDocument[]>([])
  const [list, setList] = useState<ListDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const listId = params.listId as string

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [videosData, listData] = await Promise.all([
          getListVideos(listId),
          getListDetails(listId)
        ])
        setVideos(videosData)
        setList(listData)
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [listId])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FaArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-2xl font-bold">{list?.name || 'List Videos'}</h1>
      </div>
      
      {videos.length === 0 ? (
        <p className="text-gray-600">This list doesn't have any videos yet.</p>
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
                  {video.isFavorite && (
                    <FaHeart className="text-red-500 flex-shrink-0 ml-2" />
                  )}
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

