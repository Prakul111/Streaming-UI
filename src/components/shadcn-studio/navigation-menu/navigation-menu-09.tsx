import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { NavLink } from "react-router"

const NavigationMenuDemo = () => {
  return (
    <div className="flex items-center justify-center">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="[&>svg]:size-4">
              Movie
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-50">
                <li>
                  <NavigationMenuLink render={<NavLink to="/now-playing-movie" />}>
                    <div className="px-1 font-medium">Now Playing</div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink render={<NavLink to="/popular-movie" />}>
                    <div className="px-1 font-medium">Popular</div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink
                    render={<NavLink to="/top-rated-movie" />}
                  >
                    <div className="px-1 font-medium">Top rated</div>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="[&>svg]:size-4">
              Tv Show
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="w-50">
                <li>
                  <NavigationMenuLink render={<NavLink to="/popular-tv" />}>
                    <div className="px-1 font-medium">Popular</div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink render={<NavLink to="top-rated-tv" />}>
                    <div className="px-1 font-medium">Top Rated</div>
                  </NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink render={<NavLink to="/airing-today-tv" />}>
                    <div className="px-1 font-medium">Airing Today</div>
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
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
