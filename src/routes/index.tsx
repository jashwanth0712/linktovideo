import { createFileRoute } from '@tanstack/react-router'
import { useState } from "react"
import { MasonryGallery } from "@/components/masonry-gallery"
import { ProjectModal } from "@/components/project-modal"
import { MenuIcon } from "@/lib/icons"

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])

  const handleAddProject = (project: any) => {
    setProjects([...projects, project])
    setIsModalOpen(false)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Masonry</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-full bg-blue-500 px-6 py-2 text-white font-medium hover:bg-blue-600 transition-colors"
            >
              Start project
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <MenuIcon size={24} className="text-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Gallery */}
      <section className="px-6 py-12">
        {projects.length > 0 ? (
          <MasonryGallery projects={projects} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-muted-foreground text-lg mb-4">No projects yet. Click "Start project" to begin!</p>
          </div>
        )}
      </section>

      {/* Modal */}
      <ProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddProject} />
    </main>
  )
}
