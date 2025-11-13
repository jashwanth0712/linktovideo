
interface Project {
  name: string
  url: string
  logo: string
  colors: string[]
  productCount: number
  thumbnail: string
}

interface MasonryGalleryProps {
  projects: Project[]
}

export function MasonryGallery({ projects }: MasonryGalleryProps) {
  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
      {projects.map((project, index) => (
        <div
          key={index}
          className="break-inside-avoid animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="group relative overflow-hidden rounded-lg bg-card border border-border hover:border-foreground/30 transition-all cursor-pointer h-64">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={project.thumbnail || "/placeholder.svg"}
                alt={project.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
            </div>

            {/* Content */}
            <div className="relative h-full flex flex-col justify-end p-4">
              <div className="flex items-start justify-between mb-3">
                {project.logo && (
                  <img
                    src={project.logo || "/placeholder.svg"}
                    alt={`${project.name} logo`}
                    className="w-10 h-10 rounded-lg bg-white/10 object-cover"
                  />
                )}
              </div>

              <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-blue-400 transition-colors">
                {project.name}
              </h3>

              <p className="text-white/70 text-sm mb-3">{project.productCount} products</p>

              {/* Color dots */}
              <div className="flex gap-2">
                {project.colors.slice(0, 4).map((color, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-full border border-white/20"
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
