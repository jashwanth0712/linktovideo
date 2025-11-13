import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const videos = useQuery(api.queries.getAllVideos) || []

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-light tracking-tight text-white mb-2">
              Generated Videos
            </h1>
            <p className="text-zinc-400 text-lg">
              AI-powered video content from your websites
            </p>
          </div>
          <Link
            to="/firecrawl"
            className="group relative px-8 py-3 bg-white text-zinc-950 rounded-xl font-medium hover:bg-zinc-100 transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <span className="relative z-10">Create New Video</span>
          </Link>
        </div>

        {videos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-24 h-24 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-8">
              <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-white mb-4">
              No videos yet
            </h2>
            <p className="text-zinc-400 text-lg mb-8 max-w-md">
              Transform any website into engaging video content with AI
            </p>
            <Link
              to="/firecrawl"
              className="px-8 py-3 bg-white text-zinc-950 rounded-xl font-medium hover:bg-zinc-100 transition-all duration-200 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {videos.map((video) => (
              <div
                key={video._id}
                className="group relative bg-zinc-900/50 backdrop-blur-sm rounded-2xl border border-zinc-800/50 hover:border-zinc-700/50 transition-all duration-300 hover:bg-zinc-900/70 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    {video.status === 'completed' && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mr-2"></div>
                        Completed
                      </span>
                    )}
                    {video.status === 'processing' && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2 animate-pulse"></div>
                        Processing
                      </span>
                    )}
                    {video.status === 'failed' && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></div>
                        Failed
                      </span>
                    )}
                  </div>

                  {video.title && (
                    <h3 className="text-xl font-medium mb-3 text-white line-clamp-2 group-hover:text-zinc-100 transition-colors">
                      {video.title}
                    </h3>
                  )}

                  {video.domain && (
                    <p className="text-sm text-zinc-500 mb-4 font-mono break-all">
                      {video.domain.baseUrl}
                    </p>
                  )}

                  {video.description && (
                    <p className="text-zinc-400 mb-6 line-clamp-2 text-sm leading-relaxed">
                      {video.description}
                    </p>
                  )}

                  <div className="mb-6 aspect-video bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-800/50">
                    {video.status === 'completed' ? (
                      <video
                        src={video.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.parentElement
                          if (fallback) {
                            fallback.innerHTML = `
                              <div class="flex items-center justify-center h-full text-zinc-500">
                                <div class="text-center">
                                  <p class="text-sm mb-3">Video Preview</p>
                                  <a href="${video.videoUrl}" target="_blank" rel="noopener noreferrer" class="text-white hover:text-zinc-300 underline underline-offset-2">
                                    Open Video
                                  </a>
                                </div>
                              </div>
                            `
                          }
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-zinc-500">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                            {video.status === 'processing' ? (
                              <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-400 rounded-full animate-spin"></div>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                          </div>
                          <p className="text-sm">
                            {video.status === 'processing'
                              ? 'Generating video...'
                              : 'Generation failed'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-4">
                    <span>
                      {new Date(video.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    {video.completedAt && (
                      <span>
                        Completed {new Date(video.completedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    )}
                  </div>

                  {video.status === 'completed' && (
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full text-center px-4 py-3 bg-white text-zinc-950 rounded-xl font-medium hover:bg-zinc-100 transition-all duration-200 hover:scale-[1.02]"
                    >
                      Watch Video
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
