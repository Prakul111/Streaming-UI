import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { NavLink } from "react-router"
import { cn } from "@/lib/utils"

const NavigationMenuDemo = () => {
  return (
    <div className="flex items-center justify-center">
      <NavigationMenu>
        <NavigationMenuList className="gap-1">
          <NavigationMenuItem>
            <NavLink
              to="/movie"
              className={({ isActive }) =>
                cn(
                  navigationMenuTriggerStyle(),
                  "cursor-pointer text-sm font-medium transition-colors bg-transparent",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              Movie
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink
              to="/tv-shows"
              className={({ isActive }) =>
                cn(
                  navigationMenuTriggerStyle(),
                  "cursor-pointer text-sm font-medium transition-colors bg-transparent",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              Tv Show
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavLink
              to="/people"
              className={({ isActive }) =>
                cn(
                  navigationMenuTriggerStyle(),
                  "cursor-pointer text-sm font-medium transition-colors bg-transparent",
                  isActive
                    ? "bg-muted text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              People
            </NavLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="[&>svg]:size-4">
              Trending
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-50">
                <li>
                  <NavigationMenuLink render={<NavLink to="/trending-all" />}>
                    <div className="px-1 font-medium">All</div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink render={<NavLink to="/trending-movie" />}>
                    <div className="px-1 font-medium">Movies</div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink render={<NavLink to="/trending-tv" />}>
                    <div className="px-1 font-medium">TV</div>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          {/*<NavigationMenuItem>
            <NavigationMenuLink render={<NavLink to="#" />}>
              Docs
            </NavigationMenuLink>
          </NavigationMenuItem>*/}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  )
}

export default NavigationMenuDemo
