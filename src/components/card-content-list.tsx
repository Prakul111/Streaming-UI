import { useState, useRef } from "react"
import { cn } from "@/lib/utils"
import { Link } from "react-router"
import starIcon from "@/assets/star-svgrepo-com.svg"

interface ContentListProps {
  id?: number
  title: string
  image: string
  rating: number
  year: number
  type: string
  className?: string
}

export default function CardContentList({
  id,
  title,
  image,
  rating,
  year,
  type,
  className,
}: ContentListProps) {
  const isMovie = type.toLowerCase().includes("movie")
  const detailUrl = isMovie ? `/movie-details/${id}` : `/tv-details/${id}`
  const cardRef = useRef<HTMLDivElement>(null)
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({})

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return

    const rect = card.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Mouse position relative to the card element
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    // Calculate rotation angles based on mouse position relative to center
    const centerX = width / 2
    const centerY = height / 2

    const deltaX = mouseX - centerX
    const deltaY = mouseY - centerY

    // Normalize to range [-1, 1]
    const percentX = deltaX / centerX
    const percentY = deltaY / centerY

    // Max tilt angles (in degrees)
    const maxTiltX = 12
    const maxTiltY = 12

    // Tilt calculations (X tilt is based on Y mouse movement, and vice-versa)
    const tiltX = -percentY * maxTiltX
    const tiltY = percentX * maxTiltY

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.05)`,
      boxShadow: "0 25px 35px -5px rgba(0, 0, 0, 0.4), 0 12px 20px -8px rgba(0, 0, 0, 0.4)",
      transition: "transform 150ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 150ms ease",
    })
  }

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)",
      boxShadow: "none",
      transition: "transform 500ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 500ms ease",
    })
  }

  const cardContent = (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("w-40 shrink-0 select-none p-1.5 cursor-pointer", className)}
    >
      <div
        style={tiltStyle}
        className="relative rounded-2xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md transform-gpu"
      >
        <figure className="w-full">
          <img
            className="aspect-[2/3] w-full rounded-2xl object-cover pointer-events-none"
            src={image}
            alt={title}
          />
        </figure>
      </div>
      <div className="flex items-center justify-between gap-2 py-2 text-xs text-muted-foreground font-medium">
        <div className="flex items-center justify-center rounded-full bg-muted text-foreground px-2.5 py-1 whitespace-nowrap">
          <img
            src={starIcon}
            className="h-2.5 pr-0.5"
            alt="star"
          />
          {rating}
        </div>
        <span className="rounded-full bg-muted text-foreground px-2.5 py-1 whitespace-nowrap">{year}</span>
        <span className="rounded-full bg-muted text-foreground px-2.5 py-1 whitespace-nowrap">{type}</span>
      </div>
      <div className="font-md px-1 text-sm leading-snug wrap-anywhere">
        {title}
      </div>
    </div>
  )

  if (id) {
    return (
      <Link to={detailUrl} className="block no-underline">
        {cardContent}
      </Link>
    )
  }

  return cardContent
}
