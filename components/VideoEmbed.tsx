'use client'

import { useState } from 'react'

interface VideoEmbedProps {
  url: string
  title: string
}

export function VideoEmbed({ url, title }: VideoEmbedProps) {
  const getVideoInfo = (url: string): { type: 'youtube' | 'instagram' | null, id: string | null } => {
    try {
      const urlObj = new URL(url)
      
      if (urlObj.hostname.includes('youtube.com')) {
        const videoId = urlObj.searchParams.get('v')
        return { type: 'youtube', id: videoId }
      }
      
      if (urlObj.hostname === 'youtu.be') {
        const videoId = urlObj.pathname.slice(1)
        return { type: 'youtube', id: videoId }
      }
      
      if (urlObj.hostname === 'www.instagram.com') {
        const matches = url.match(/\/(p|reel)\/([^/?]+)/)
        const postId = matches ? matches[2] : null
        return { type: 'instagram', id: postId }
      }

      return { type: null, id: null }
    } catch (error) {
      console.error('Error parsing video URL:', error)
      return { type: null, id: null }
    }
  }

  const { type, id } = getVideoInfo(url)

  if (!type || !id) {
    return (
      <div className="aspect-w-16 aspect-h-9 bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">URL de video no válida</p>
      </div>
    )
  }

  if (type === 'youtube') {
    return (
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={`https://www.youtube.com/embed/${id}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    )
  }

  if (type === 'instagram') {
    return (
      <div className="aspect-w-16 aspect-h-9">
        <iframe
          src={`https://www.instagram.com/p/${id}/embed/`}
          title={title}
          allowFullScreen
          className="w-full h-full border-none"
        />
      </div>
    )
  }

  return null
}