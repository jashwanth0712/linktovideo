import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const videos = useQuery(api.queries.getAllVideos) || []

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Generated Videos</h1>
        <Link
          to="/firecrawl"
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Video
        </Link>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
            No videos yet. Create your first video by scraping a website!
          </p>
          <Link
            to="/firecrawl"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video._id}
              className="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
            >
              <div className="mb-4">
                {video.status === 'completed' && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                    Completed
                  </span>
                )}
                {video.status === 'processing' && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                    Processing
                  </span>
                )}
                {video.status === 'failed' && (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                    Failed
                  </span>
                )}
              </div>

              {video.title && (
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  {video.title}
                </h3>
              )}

              {video.domain && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-2 break-all">
                  {video.domain.baseUrl}
                </p>
              )}

              {video.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {video.description}
                </p>
              )}

              <div className="mb-4 aspect-video bg-gray-200 dark:bg-gray-700 rounded-md overflow-hidden">
                {video.status === 'completed' ? (
                  <video
                    src={video.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if video fails to load
                      e.currentTarget.style.display = 'none'
                      const fallback = e.currentTarget.parentElement
                      if (fallback) {
                        fallback.innerHTML = `
                          <div class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <div class="text-center">
                              <p class="text-sm mb-2">Video Preview</p>
                              <a href="${video.videoUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 hover:underline">
                                Open Video
                              </a>
                            </div>
                          </div>
                        `
                      }
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                    <div className="text-center">
                      <p className="text-sm mb-2">
                        {video.status === 'processing'
                          ? 'Video is being generated...'
                          : 'Video generation failed'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Created:{' '}
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
                {video.completedAt && (
                  <span>
                    Completed:{' '}
                    {new Date(video.completedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              {video.status === 'completed' && (
                <div className="mt-4">
                  <a
                    href={video.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Watch Video
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
