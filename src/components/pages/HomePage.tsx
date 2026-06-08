import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel"
import Autoplay from "embla-carousel-autoplay"
import { Button } from "../ui/button"

const MOCK_MOVIES = [
  {
    id: 1,
    title: "Dune: Part Two",
    year: "2024",
    rating: "8.8",
    genres: ["Sci-Fi", "Adventure"],
    overview:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    backdrop:
      "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600",
  },
  {
    id: 2,
    title: "Spider-Man: Across the Spider-Verse",
    year: "2023",
    rating: "8.9",
    genres: ["Action", "Sci-Fi"],
    overview:
      "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
    backdrop:
      "https://images.unsplash.com/photo-1635805737707-575885ab0820?q=80&w=1600",
  },
  {
    id: 3,
    title: "Oppenheimer",
    year: "2023",
    rating: "8.6",
    genres: ["Drama", "History"],
    overview:
      "The story of J. Robert Oppenheimer's role in the Manhattan Project and the development of the atomic bomb.",
    backdrop:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1600",
  },
]

export default function HomePage() {
  return (
    <div className="mx-auto w-full max-w-screen py-8">
      <Carousel
        opts={{
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 4000,
          }),
        ]}
        className="group relative w-full overflow-hidden rounded-3xl border border-border/40 shadow-2xl"
      >
        <CarouselContent>
          {MOCK_MOVIES.map((movie) => (
            <CarouselItem
              key={movie.id}
              className="relative h-[480px] w-full pl-0"
            >
              {/* Background Image with Dark Fade */}
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${movie.backdrop})` }}
              >
                {/* Side Gradient for Text Readability */}
                <div className="absolute inset-0 z-10 bg-gradient-to-r from-background via-background/65 to-transparent" />
                {/* Bottom Ambient Fade */}
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent" />
              </div>

              {/* Content Panel */}
              <div className="relative z-20 flex h-full max-w-2xl flex-col justify-end p-8 text-left md:p-14">
                <div className="mb-4 flex flex-wrap gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/20 px-2.5 py-1 text-xs font-bold tracking-wider text-primary-foreground uppercase">
                    ★ {movie.rating}
                  </span>
                  <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {movie.year}
                  </span>
                  {movie.genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-border/50 bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <h1 className="mb-4 text-4xl leading-none font-extrabold tracking-tight text-foreground drop-shadow-lg md:text-6xl">
                  {movie.title}
                </h1>

                <p className="mb-8 line-clamp-3 max-w-xl text-sm leading-relaxed text-muted-foreground/90 md:text-base">
                  {movie.overview}
                </p>

                <div className="flex gap-3">
                  <Button className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]">
                    Watch Now
                  </Button>
                  <Button
                    variant="outline"
                    className="cursor-pointer rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:scale-[1.02]"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Buttons (Placed inside, hidden by default, visible on hover) */}
        <CarouselPrevious className="left-4 z-30 size-10 border-none bg-background/50 text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-background/80" />
        <CarouselNext className="right-4 z-30 size-10 border-none bg-background/50 text-foreground opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100 hover:bg-background/80" />
      </Carousel>
    </div>
  )
}
