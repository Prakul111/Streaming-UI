interface ContentListProps {
  image: string
  rating: number
  year: number
  type: string
}

export default function CardContentList({
  image,
  rating,
  year,
  type,
}: ContentListProps) {
  return (
    <div>
      <div className="hover-3d">
        {/* content */}
        <figure className="w-40 rounded-2xl">
          <img
            className="aspect-auto rounded-lg object-fill"
            src="https://images.unsplash.com/photo-1777579173763-b7539bf1ed37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2fHx8ZW58MHx8fHx8"
            alt="Tailwind CSS 3D card"
          />
          <div className="flex items-center justify-center gap-4 p-2 text-xs text-gray-200">
            <div className="">
              <span className="pr-0.5">⭐</span>
              {rating}
            </div>
            <span>{year}</span>
            <span>{type}</span>
          </div>
        </figure>
        {/* 8 empty divs needed for the 3D effect */}
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  )
}
