import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { NavLink, useLocation } from "react-router"
import { TrendingUp, Film, Tv, Sparkles, Users, Server, History } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationMenuDemoProps {
  onOpenSubmitServer?: () => void
}

const NavigationMenuDemo = ({ onOpenSubmitServer }: NavigationMenuDemoProps) => {
  const location = useLocation()
  const isTrendingActive = location.pathname.startsWith("/trending")
  const isMoreActive =
    location.pathname.startsWith("/anime") ||
    location.pathname.startsWith("/people") ||
    location.pathname.startsWith("/person-details") ||
    location.pathname.startsWith("/changelog")

  const linkBaseClasses =
    "cursor-pointer text-xs lg:text-sm font-medium transition-all duration-200 px-3.5 py-1.5 rounded-full border"

  return (
    <div className="flex items-center justify-center">
      <NavigationMenu>
        <NavigationMenuList className="gap-1 sm:gap-1.5">
          {/* Home Link */}
          <NavigationMenuItem>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                cn(
                  linkBaseClasses,
                  isActive
                    ? "bg-muted dark:bg-white/15 text-foreground dark:text-white font-semibold border-border/50 dark:border-white/15 shadow-sm"
                    : "text-muted-foreground dark:text-white/75 hover:text-foreground dark:hover:text-white hover:bg-muted/50 dark:hover:bg-white/10 border-transparent"
                )
              }
            >
              Home
            </NavLink>
          </NavigationMenuItem>

          {/* Movies Link */}
          <NavigationMenuItem>
            <NavLink
              to="/movie"
              className={({ isActive }) =>
                cn(
                  linkBaseClasses,
                  isActive
                    ? "bg-muted dark:bg-white/15 text-foreground dark:text-white font-semibold border-border/50 dark:border-white/15 shadow-sm"
                    : "text-muted-foreground dark:text-white/75 hover:text-foreground dark:hover:text-white hover:bg-muted/50 dark:hover:bg-white/10 border-transparent"
                )
              }
            >
              Movies
            </NavLink>
          </NavigationMenuItem>

          {/* TV Shows Link */}
          <NavigationMenuItem>
            <NavLink
              to="/tv-shows"
              className={({ isActive }) =>
                cn(
                  linkBaseClasses,
                  isActive
                    ? "bg-muted dark:bg-white/15 text-foreground dark:text-white font-semibold border-border/50 dark:border-white/15 shadow-sm"
                    : "text-muted-foreground dark:text-white/75 hover:text-foreground dark:hover:text-white hover:bg-muted/50 dark:hover:bg-white/10 border-transparent"
                )
              }
            >
              TV Shows
            </NavLink>
          </NavigationMenuItem>

          {/* Trending Dropdown */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                linkBaseClasses,
                "h-auto bg-transparent hover:bg-muted/50 dark:hover:bg-white/10",
                isTrendingActive
                  ? "bg-muted dark:bg-white/15 text-foreground dark:text-white font-semibold border-border/50 dark:border-white/15 shadow-sm"
                  : "text-muted-foreground dark:text-white/75 hover:text-foreground dark:hover:text-white border-transparent"
              )}
            >
              Trending
            </NavigationMenuTrigger>
            <NavigationMenuContent className="p-2 min-w-[210px] rounded-2xl border border-border/60 dark:border-white/15 bg-popover/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl">
              <ul className="flex flex-col gap-1">
                <li>
                  <NavigationMenuLink
                    closeOnClick
                    render={<NavLink to="/trending-all" />}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500">
                      <TrendingUp className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">All Trending</div>
                      <div className="text-[11px] text-muted-foreground">Today's top buzz</div>
                    </div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    closeOnClick
                    render={<NavLink to="/trending-movie" />}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-500">
                      <Film className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Trending Movies</div>
                      <div className="text-[11px] text-muted-foreground">Top film releases</div>
                    </div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    closeOnClick
                    render={<NavLink to="/trending-tv" />}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-500">
                      <Tv className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Trending TV Shows</div>
                      <div className="text-[11px] text-muted-foreground">Binge-worthy series</div>
                    </div>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          {/* More Dropdown (People, Anime, Add Server, Changelog) */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={cn(
                linkBaseClasses,
                "h-auto bg-transparent hover:bg-muted/50 dark:hover:bg-white/10",
                isMoreActive
                  ? "bg-muted dark:bg-white/15 text-foreground dark:text-white font-semibold border-border/50 dark:border-white/15 shadow-sm"
                  : "text-muted-foreground dark:text-white/75 hover:text-foreground dark:hover:text-white border-transparent"
              )}
            >
              More
            </NavigationMenuTrigger>
            <NavigationMenuContent className="p-2 min-w-[220px] rounded-2xl border border-border/60 dark:border-white/15 bg-popover/95 dark:bg-neutral-900/95 backdrop-blur-xl shadow-2xl">
              <ul className="flex flex-col gap-1">
                {/* Anime */}
                <li>
                  <NavigationMenuLink
                    closeOnClick
                    render={<NavLink to="/anime" />}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400">
                      <Sparkles className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">Anime</div>
                      <div className="text-[11px] text-muted-foreground">Series & animated films</div>
                    </div>
                  </NavigationMenuLink>
                </li>

                {/* People */}
                <li>
                  <NavigationMenuLink
                    closeOnClick
                    render={<NavLink to="/people" />}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400">
                      <Users className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">People</div>
                      <div className="text-[11px] text-muted-foreground">Actors & directors</div>
                    </div>
                  </NavigationMenuLink>
                </li>

                {/* Add Server */}
                <li>
                  <NavigationMenuLink
                    closeOnClick
                    render={(linkProps) => (
                      <button
                        {...linkProps}
                        type="button"
                        onClick={(e) => {
                          linkProps.onClick?.(e)
                          onOpenSubmitServer?.()
                        }}
                      />
                    )}
                    className="w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
                      <Server className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span>Add Server</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                          Custom
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">Submit custom stream</div>
                    </div>
                  </NavigationMenuLink>
                </li>

                {/* Changelog */}
                <li>
                  <NavigationMenuLink
                    closeOnClick
                    render={<NavLink to="/changelog" />}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-foreground hover:bg-muted/70 dark:hover:bg-white/10 transition-colors"
                  >
                    <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                      <History className="size-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground flex items-center gap-1.5">
                        <span>Changelog</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          v2.4
                        </span>
                      </div>
                      <div className="text-[11px] text-muted-foreground">Release notes & updates</div>
                    </div>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default NavigationMenuDemo
