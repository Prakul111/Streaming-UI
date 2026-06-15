import {
  popularMovieQuery,
  topRatedQuery,
  upcomingQuery,
} from "@/api/fetch-movie"
import CardContentList from "@/components/card-content-list"
import { MovieRowSkeleton } from "@/components/skeleton"
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button"
import {
  Tabs,
  TabsContent,
  TabsContents,
  TabsList,
  TabsTrigger,
} from "@/components/ui/motion-tabs"
import { useQueries } from "@tanstack/react-query"
import { NavLink } from "react-router"

const AnimatedTabsMovie = () => {
  const [
    { data: popularData, isPending: isPopularPending, error: popularError },
    { data: topRatedData, isPending: isTopRatedPending, error: topRatedError },
    { data: upcomingData, isPending: isUpcomingPending, error: upcomingError },
  ] = useQueries({
    queries: [popularMovieQuery(), topRatedQuery(), upcomingQuery()],
  })

  if (popularError || topRatedError || upcomingError) {
    console.error("Failed to fetch movies from TMDB:", {
      popularError,
      topRatedError,
      upcomingError,
    })
  }

  const popularMovies = popularData?.results || []
  const topRatedMovies = topRatedData?.results || []
  const upcomingMovies = upcomingData?.results || []

  const tabs = [
    {
      name: "Popular",
      value: "popular",
      content: (
        <div>
          <div className="flex items-center justify-end">
            <NavLink to="/popular">
              <InteractiveHoverButton className="font-md rounded-md px-5 py-2 text-sm">
                View All
              </InteractiveHoverButton>
            </NavLink>
          </div>

          {isPopularPending ? (
            <MovieRowSkeleton />
          ) : popularMovies.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto rounded-md p-4">
              {popularMovies.map((movie: any) => (
                <CardContentList
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  image={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                  }
                  rating={
                    movie.vote_average
                      ? parseFloat(movie.vote_average.toFixed(1))
                      : 0.0
                  }
                  year={
                    movie.release_date
                      ? parseInt(movie.release_date.split("-")[0])
                      : 0
                  }
                  type="Movie"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
              <span className="text-muted-foreground">
                Failed to load popular movies.
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Top Rated",
      value: "top_rated",
      content: (
        <div>
          <div className="flex items-center justify-end">
            <NavLink to="/top-rated">
              <InteractiveHoverButton className="font-md rounded-md px-5 py-2 text-sm">
                View All
              </InteractiveHoverButton>
            </NavLink>
          </div>
          {isTopRatedPending ? (
            <MovieRowSkeleton />
          ) : topRatedMovies.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto rounded-md p-4">
              {topRatedMovies.map((movie: any) => (
                <CardContentList
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  image={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                  }
                  rating={
                    movie.vote_average
                      ? parseFloat(movie.vote_average.toFixed(1))
                      : 0.0
                  }
                  year={
                    movie.release_date
                      ? parseInt(movie.release_date.split("-")[0])
                      : 0
                  }
                  type="Movie"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
              <span className="text-muted-foreground">
                Failed to load top rated movies.
              </span>
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Upcoming",
      value: "upcoming",
      content: (
        <div>
          <div className="flex items-center justify-end">
            <NavLink to="/upcoming">
              <InteractiveHoverButton className="font-md rounded-md px-5 py-2 text-sm">
                View All
              </InteractiveHoverButton>
            </NavLink>
          </div>
          {isUpcomingPending ? (
            <MovieRowSkeleton />
          ) : upcomingMovies.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto rounded-md p-4">
              {upcomingMovies.map((movie: any) => (
                <CardContentList
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  image={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=500"
                  }
                  rating={
                    movie.vote_average
                      ? parseFloat(movie.vote_average.toFixed(1))
                      : 0.0
                  }
                  year={
                    movie.release_date
                      ? parseInt(movie.release_date.split("-")[0])
                      : 0
                  }
                  type="Movie"
                />
              ))}
            </div>
          ) : (
            <div className="flex h-[150px] items-center justify-center rounded-2xl border border-dashed border-border bg-muted/10">
              <span className="text-muted-foreground">
                Failed to load upcoming movies.
              </span>
            </div>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className="w-full max-w-screen">
      <Tabs defaultValue="popular" className="gap-4">
        <TabsList className="rounded-lg bg-purple-500/30 p-1">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContents>
          {tabs.map((tab) => (
            <TabsContent key={tab.value} value={tab.value}>
              {tab.content}
            </TabsContent>
          ))}
        </TabsContents>
      </Tabs>
    </div>
  )
}

export default AnimatedTabsMovie
