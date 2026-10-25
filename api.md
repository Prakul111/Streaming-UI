#### [2embed](https://www.2embed.cc/), [2](https://2embed.skin/) - Movies / TV


https://www.2embed.cc/
https://www.2embed.skin/

Embed Movies
By IMDB ID => https://www.2embed.cc/embed/tt10676048
By TMDB ID => https://www.2embed.cc/embed/609681

Embed Tv-Series by Season and Episode Number
By IMDB ID => https://www.2embed.cc/embedtv/tt3107288&s=1&e=1
By TMDB ID => https://www.2embed.cc/embedtv/60735&s=1&e=1
Embed Complete TV Seasons
By IMDB ID => https://www.2embed.cc/embedtvfull/tt3107288
By TMDB ID => https://www.2embed.cc/embedtvfull/60735

JSON API for Movies & Tv-Shows
Below is a step-by-step guide to our JSON API endpoints. All endpoints support imdb_id / tmdb_id parameters and return full JSON metadata.

Movie Details => https://api.2embed.cc/movie?imdb_id={tt…}
Trending Movies => https://api.2embed.cc/trending?time_window={day|week|month}&page={1…N}
Search Movies => https://api.2embed.cc/search?q={keyword}&page={1…N}
Similar Movies => https://api.2embed.cc/similar?imdb_id={tt…}&page={1…N}
TV Details => https://api.2embed.cc/tv?imdb_id={tt…}
Trending TV Shows => https://api.2embed.cc/trendingtv?time_window={day|week|month}&page={1…N}
Search TV Shows => https://api.2embed.cc/searchtv?q={keyword}&page={1…N}
Similar TV Shows => https://api.2embed.cc/similartv?imdb_id={tt…}&page={1…N}
Season Details => https://api.2embed.cc/season?imdb_id={tt…}&season={1…N}

---

#### - [AutoEmbed](https://autoembed.app/) - Movies / TV / Anime / Drama 


- Movie Endpoint
https://player.autoembed.app/embed/movie/{id}
Valid parameters:
 {id} required - from imdb.com or themoviedb.com , imdb id must have tt prefix.

Examples
https://player.autoembed.app/embed/movie/tt3359350

https://player.autoembed.app/embed/movie/359410

- Tv Show Endpoint
https://player.autoembed.app/embed/tv/{id}/{season}/{episode}
Valid parameters:
- {id} required - from imdb.com or themoviedb.com , imdb id must have tt prefix.

- {season} required - the season number

- {episode} required - the episode number

Examples
https://player.autoembed.app/embed/tv/tt0903747/1/1

https://player.autoembed.app/embed/tv/1396/1/1

- Drama Endpoint
https://drama.autoembed.cc/embed/{title}-episode-{number}
Valid parameters:
 {title} required - title of your favourite drama.

 {episode no} required - episode number of your favourite drama.

Examples
https://drama.autoembed.cc/embed/kissed-by-the-rain-2024-episode-11

Remember where " kissed-by-the-rain-2024 " is the {title} and " 11 " is the {episode no}

- Anime Endpoint
https://anime.autoembed.cc/embed/{title}-episode-{number}

Valid parameters:

{title} required - title of your favourite anime.

 {episode no} required - episode number of your favourite anime.

Examples
https://anime.autoembed.cc/embed/yao-shen-ji-8th-season-2024-episode-23

Remember where " yao-shen-ji-8th-season-2024 " is the {title} and " 23 " is the {episode no}

---
#### - [Atlantic API](http://embed.atlantic.st/) - Movies / TV / Anime

Movie
https://atlantic.st/embed/movie/{tmdbId}
TV episode
https://atlantic.st/embed/tv/{tmdbId}/{season}/{episode}

---
#### - [Cinemaos](https://cinemaos.tech/embed) - Movies / TV / Anime

- Movie

https://cinemaos.tech/player/{tmdb_id}

- TV Show
 
https://cinemaos.tech/player/{tmdb_id}/{season}/{episode}

---

#### - [CineSRC](https://cinesrc.st/) - Movies / TV / Anime
- Movies

https://cinesrc.st/embed/movie/{tmdb_id}

TV Shows

https://cinesrc.st/embed/tv/{tmdb_id}?s={season}&e={episode}

| type | string | RequiredContent type: "movie" or "tv"          |
| ---- | ------ | ---------------------------------------------- |
| id   | number | RequiredTMDB ID of the movie or TV show        |
| s    | number | Season number (TV shows only). Alias: season   |
| e    | number | Episode number (TV shows only). Alias: episode |

---

#### - [Cinextream API](https://cinextream.cc/) - Movies / TV / Anime

- movie embed

https://cinextream.net/api/embed/movie/[ID]

- Tv Shows
TMDB ID and season number. Episode defaults to 1 (pass ?e=2 for episode 2).
 
https://cinextream.net/api/embed/tv/[ID]/[season]/[episode]

- Anime 
AniList ID or MAL ID + episode number. Supports sub & dub.

https://cinextream.net/api/embed/anime/sub/[ID]/[episode]
https://cinextream.net/api/embed/anime/mal/sub/[ID]/[episode]

---

#### - [Fmov](https://fmov.my/) - Movies / TV / Anime

- Embed Movie
How to embed a movie using its TMDB ID.

https://fmov.my/embed/movie/{tmdb_id}

- Embed TV Series
How to embed a TV series episode using its TMDB ID, season, and episode number.

https://fmov.my/embed/series/{tmdb_id}/{season}/{episode}

- Embed Anime
How to embed an anime episode using either AniList ID or TMDB ID.

FMOV supports embedding anime with both standard Season/Episode numbering and absolute episode numbering. The player automatically resolves both AniList IDs and TMDB IDs via built-in mappings.

Format 1: Season & Episode

https://fmov.my/embed/anime/{id}/{season}/{episode}

Format 2: Absolute Episode (Defaults to Season 1)

https://fmov.my/embed/anime/{id}/{episode}

---

#### - [frameXTV](https://framextv.tech/api) - Movies / TV / Anime.

- React / Next.js Component Example


```
import React from 'react';

export function VideoPlayer({ tmdbId, season, episode }) {
  const embedUrl = season && episode
    ? `https://framextv.xyz/embed/${tmdbId}/${season}/${episode}`
    : `https://framextv.xyz/embed/${tmdbId}`;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-zinc-800">
      <iframe
        src={embedUrl}
        className="w-full h-full border-0"
        allowFullScreen
        title="frameXTV Stream Player"
      />
    </div>
  );
}
```

#### - [Mapple Player](https://mappletv.uk/) - Movies / TV / Anime

- Movie Embed Endpoint

https://mapple.fun/watch/movie/{id}?autoPlay=true

Required Parameters

{id}: Movie identifier from IMDB or TMDB

- TV Show Embed
https://mapple.fun/watch/tv/{id}-{season}-{episode}?autoPlay=true
Required Parameters

{id}: TV show identifier from IMDB or TMDB
{season}: The season number
{episode}: The episode number