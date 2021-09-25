class App {
    static async run() {
        const movies = await APIService.fetchMovies()
        HomePage.renderMovies(movies);
        APIService.fetchAllGenres();      
        document.getElementById('actors').addEventListener('click', async () => {
        const actors = await APIService.fetchActorsList()
        ActorsPage.renderActors(actors);
        });
      
    }
}



class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';


    static async fetchMovies() {
        const url = APIService._constructUrl(`movie/now_playing`)
        const response = await fetch(url)
        const data = await response.json()
        // console.log(data)
        return data.results.map(movie => new Movie(movie))
        return new Movie(data)
    }
    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(url)
        const data = await response.json()
        // console.log(data)
        return new Movie(data)
    }
    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
    }
    static async fetchActors(movie_id) {
      const url = APIService._constructUrl(`/movie/${movie_id}/credits`);
        const response = await fetch(url);
        const data = await response.json();
        // console.log(data)
        return data;   
    } 

  

    static async fetchRelatedMovies(movie_id) {
      const url = APIService._constructUrl(`/movie/${movie_id}/similar`);
        const response = await fetch(url);
        const data = await response.json();
        // console.log(data)
        return data.results.slice(0, 5);   
    }
    static async fetchTrailer(movie_id) {
       const url = APIService._constructUrl(`/movie/${movie_id}/videos`)
        const response = await fetch(url)
        const data = await response.json()
        return data.results.slice(0, 1); 
    } 

    

    static async fetchActorsList() {
        const url = APIService._constructUrl(`person/popular`)
        const response = await fetch(url)
        const data = await response.json()
        // console.log(data)
        return data.results.map(actor => new Actor(actor))
    }
    static async fetchActor(actorId){
        const url = APIService._constructUrl(`person/${actorId}`)
        const response = await fetch(url)
        const data = await response.json()
        return new Actor(data)
    }
        static async fetchMoviesGenre(genreId){
        const firstUrl= APIService._constructUrl(`discover/movie`);
        const url = firstUrl + `&with_genres=${genreId}`;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    static async fetchAllGenres(){
        const menu = document.querySelector(".dropdown-menu");
        const url = APIService._constructUrl(`genre/movie/list`);
        const response = await fetch(url);
        const data = await response.json();
        const genres = data.genres.map(genre => genre.name)
        const ids = data.genres.map(genre=>genre.id)
        data.genres.forEach(genre => { 
            let menuItem = document.createElement("a")
            menuItem.className = "dropdown-item";
            menuItem.innerText = genre.name;
            menu.appendChild(menuItem);
            menuItem.addEventListener("click", async () =>{
            const movies = await APIService.fetchMoviesGenre(genre.id)
            const moviesObj = movies.results.map(movie=>new Movie(movie))
            GenresPage.renderMovies(moviesObj)
            })
        })
    }

    //returns actor results for search
  static async fetchActorSearchResults (search) {
    const personSearchResults = await (await fetch(`https://api.themoviedb.org/3/search/person?api_key=ecfdd3d5230c96c392fc9421937894a9&query=${search}&include_adult=false`)).json()
    //results is the array that has the people as objects inside
    return personSearchResults.results.map(person => new Actor(person))
  }

  //returns movie results for search
  static async fetchMovieSearchResults (search) {
    const movieSearchResults = await (await fetch(`https://api.themoviedb.org/3/search/movie?api_key=ecfdd3d5230c96c392fc9421937894a9&query=${search}&include_adult=false`)).json()
    //results is the array that has the movies as objects inside
    return movieSearchResults.results.map(movie => new Movie(movie))
  }
  

}


class HomePage {
    static container = document.getElementById('row');
    static renderMovies(movies) {
        movies.forEach(movie => {
            const movieCont = document.createElement("div");
            movieCont.setAttribute("class", "col-sm-12 col-md-6 col-lg-4 d-flex justify-content-between");
            const movieDiv = document.createElement("div");
            movieDiv.setAttribute("class", "card w3-center w3-animate-zoom");
            const movieImage = document.createElement("img");
            movieImage.setAttribute("class", "card-img-top");
            movieImage.src = `${movie.backdropUrl}`;
            const movieTitle = document.createElement("h4");
            movieTitle.setAttribute("class", "card-body");
            movieTitle.textContent = `${movie.title}`;
            movieImage.addEventListener("click", function() {
                Movies.run(movie);
            });
            movieTitle.addEventListener("click", function() {
                Movies.run(movie);
            });

            movieCont.appendChild(movieDiv);
            movieDiv.appendChild(movieImage);
            movieDiv.appendChild(movieTitle);
            this.container.appendChild(movieCont);
        })
    }
}



class Movies {
    static async run(movie) {
        const movieData = await APIService.fetchMovie(movie.id)
        const castData = await APIService.fetchActors(movie.id)
        const relatedMovies = await APIService.fetchRelatedMovies(movie.id)
        const trailer = await APIService.fetchTrailer(movie.id)
        MoviePage.renderMovieSection(movieData, castData, relatedMovies,trailer);
      
    }
    
}


class MoviePage {
    static container = document.getElementById('container');
    static renderMovieSection(movie, castData, relatedMovies, trailer) {
        MovieSection.renderMovie(movie, castData, relatedMovies, trailer);
    }

}


class MovieSection {
    static renderMovie(movie, castData, relatedMovies, trailer) {
    let relMovies = relatedMovies.map(obj => { 
      return `<div class="card">
      <img class="castImg" src="${`http://image.tmdb.org/t/p/w780` + obj.poster_path}";><p class="card-body">${obj.title}</p></div>`});
  
      // iteration over castData to render each actor
    let castName = castData.cast.slice(0, 5).map(obj => {
      return `<div class="card"><img class="castImg" src="${`http://image.tmdb.org/t/p/w780` + obj.profile_path}" onclick='
      SingleActorPage.run(${obj.id})'><p class="card-body">${obj.name}<br><span style="font-weight: 600; font-size: 14px;">${obj.character}</span></p></div>`});

  

      let trail = trailer.map(obj => {
      return `<div class="trailer"><div class="col-12 trailer">
          <iframe class="trailer-vid"
              width="100%" height="550" src="${`https://www.youtube.com/embed/` + obj.key}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen>
          </iframe>
      </div>
      </div>
`
      
     });

      let company = movie.company.slice(0, 1).map(obj => {return `
      <img src="${`http://image.tmdb.org/t/p/w780` + obj.logo_path}" width= 100px;/>`}); 
     
     let director = castData.crew.map(obj => {
       if (obj.job === 'Director') {
      return `${obj.name}`}});

        MoviePage.container.innerHTML = `
      <div class="container-fluid movie">
            <div class="row" id="movieBg">
        <div class="col-sm-12 col-md-12 col-lg-4 align-self-center pic">
          <img id="movie-backdrop" src=${movie.backdropUrl}> 
        </div>
        <div class="col-sm-12 col-md-12 col-lg-8 align-self-center" id="desc">
        <h2 id="movie-title">${movie.title}</h2>
          <div class="d-flex justify-content-between">
          <div class="d-flex justify-content-between">
          <p id="genres">Genre: ${movie.genres.map(obj => obj.name).join(', ')}</p>
          </div>
          <div class="d-flex justify-content-between">
          <p id="language">${movie.language}</p>
          </div>
          <div class="d-flex justify-content-between">
          <p id="movie-release-date">${movie.releaseDate}</p>
          </div>
          </div>

          <div class="d-flex justify-content-between">
          <div class="d-flex justify-content-between">
          <p id="movie-runtime">${movie.runtime}</p>
          </div>
          <div class="d-flex justify-content-between">
          <p id="vote">Rate: ${movie.vote_average}</p>
          </div>
          <div class="d-flex justify-content-between">
          <p id="movie-votes">Number of Votes: ${movie.vote_count}</p>
          </div>
          </div>
          <h3>Overview:</h3>
          <p id="movie-overview">${movie.overview}</p>
          <div class="d-flex justify-content-between">
          <p>Production Company:<br> ${company.join(' ')}</p>
          <p>Movie Director:<br> ${director.join('')}</p>
          <p></p>
          </div>

        </div>

        </div>
      </div>
      <h3 id="trailer">Movie Trailer:</h3>
          ${trail}


      <h3>Actors:</h3>
      <div class="d-flex flex-wrap flex-sm-wrap flex-md-nowrap justify-content-between">
      ${castName.join(' ')}
      </div>
      <h3>Related Movies:</h3>
      <div class="relMovies d-flex flex-wrap flex-sm-wrap flex-md-nowrap justify-content-between">
      ${relMovies.join(' ')}
      </div>
      
    `;
    
    }

}



class Movie {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';
    constructor(json) {  
        this.id = json.id;
        this.genres = json.genres;
        this.language = "Language: " + json.original_language;
        this.title = json.title;
        this.releaseDate = "Release Date: " + json.release_date;
        this.runtime = "Runtime: " + json.runtime + " minutes";
        this.overview = json.overview;
        this.backdropPath = json.poster_path;
        this.company = json.production_companies;
        this.vote_average = json.vote_average;
        this.vote_count = json.vote_count;
    }

    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "";
    }
}



//genres
class GenresPage {
    static container = document.getElementById('row');
    static renderMovies(movies) {
        this.container.innerHTML= "";
        movies.forEach(movie => {
            const movieCont = document.createElement("div");
            movieCont.setAttribute("class", "col-sm-12 col-md-6 col-lg-4 d-flex align-items-stretch");
            const movieDiv = document.createElement("div");
            movieDiv.setAttribute("class", "card w3-center w3-animate-zoom");
            const movieImage = document.createElement("img");
            movieImage.setAttribute("class", "card-img-top");
            movieImage.src = `${movie.backdropUrl}`;
            const movieTitle = document.createElement("h4");
            movieTitle.setAttribute("class", "card-body");
            movieTitle.textContent = `${movie.title}`;
            movieImage.addEventListener("click", function() {
                Movies.run(movie);
            });
            movieTitle.addEventListener("click", function() {
                Movies.run(movie);
            });

            movieCont.appendChild(movieDiv);
            movieDiv.appendChild(movieImage);
            movieDiv.appendChild(movieTitle);
            this.container.appendChild(movieCont);

        })
    }
}

// Actors
class ActorsPage {
    static container = document.getElementById('row');
    static renderActors(actors) {
    this.container.innerHTML = '';
      console.log(actors)
        actors.forEach(actor => {
            const actorCont = document.createElement("div");
            actorCont.setAttribute("class", "col-sm-12 col-md-6 col-lg-4 d-flex align-items-stretch");
            const actorDiv = document.createElement("div");
            actorDiv.setAttribute("class", "card w3-center w3-animate-zoom");
            const actorTitle = document.createElement("h4");
            actorTitle.setAttribute("class", "card-body");
            const actorImage = document.createElement("img");
            actorImage.setAttribute("class", "card-img-top");
            actorImage.src = `${actor.backdropUrl}`;
            
            actorTitle.addEventListener("click", function() {
                Actors.run(actor);
            });
            actorTitle.textContent = `${actor.name}`;
            actorImage.addEventListener("click", function() {
                SingleActorPage.renderActor(actor)
            });

            actorCont.appendChild(actorDiv);
            actorDiv.appendChild(actorImage);
            actorDiv.appendChild(actorTitle);
            this.container.appendChild(actorCont);
        })
    }
}


class Actors {
    static async run(actor) {
        const actorData = await APIService.fetchActorsList(actor.id)
        ActorPage.renderActorSection(actorData);
      
    }
    
}

//Single actor


class Actor {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780'
    constructor(json){
        this.id = json.id;
        this.name = json.name;
        this.gender = json.gender===2? "male" : "famale"; 
        this.knownFor = json.known_for;
        this.popularity = json.popularity;
        this.profilePath = json.profile_path;
        this.birthday = json.birthday;
        this.deathday= json.deathday;
        this.bio = json.biography;
    }
    get backdropUrl() {
        return this.profilePath ? Actor.BACKDROP_BASE_URL + this.profilePath : "";
    }
  };

class SingleActorPage{
    static async renderActor(actor) {
        const singleActor = await APIService.fetchActor(actor.id)
        const birthday = singleActor.birthday===null? "unknown" : singleActor.birthday
        const deathday = singleActor.deathday === null? "alive" :singleActor.deathday
        const knownFor = actor.knownFor.map(obj => {
          return `<div class="card">
        <img class="castImg" src="${`http://image.tmdb.org/t/p/w780` + obj.poster_path}"><p class="card-body">${obj.original_title}</p></div>  `
            });

        const container = document.querySelector("#container")
            
        container.innerHTML = ""
       container.innerHTML = `
        <div class="container-fluid movie">
        <div class="row" id="movieBg">
        <div class="col-md-4 align-self-center pic">
          <img id="actor-backdrop" src=${actor.backdropUrl?actor.backdropUrl:"./img/NoThumbnail.png"}> 
        </div>
        <div class="col-md-8 align-self-center" id="desc">
        <h2 id="movie-title">${actor.name}</h2>
          <div class="row d-flex justify-content-between" id="movieBg">
          <div class="d-flex justify-content-between">
          <p id="genres">Gender: ${actor.gender}</p>
          </div>
          <div class="d-flex justify-content-between">
          <p id="language">Birthday/Deathday: ${birthday}/ ${deathday}</p>
          </div>
          <div class="d-flex justify-content-between">
          <p id="movie-release-date">Popularity: ${actor.popularity}</p>
          </div>
          </div>
          <div>
          <h4>Bio:</h4>
          <p id="movie-overview">${singleActor.bio}</p>
          </div>
          </div>
          
          </div>
          </div>

          <h4 id="know">Known for:</h4>
          <div class="d-flex justify-content-between">
          ${knownFor.join(' ')}
          </div>
        </div>
      </div>
    `;           
        
    }
}

class SearchPage {

  static async renderSearchResults(search) {
    const movieSearchResults = await APIService.fetchMovieSearchResults(search)
    const personSearchResults = await APIService.fetchActorSearchResults(search)



    let movies, people
    if (movieSearchResults.length === 0) { movies = "<h4>Unfortunately, no such movies found.</h4>" }

    //Loop through movie search results and create a html string to display
    else {movies = movieSearchResults.map(movie => `
      <div class="searchResult-card col-md-2 col-sm-3 col-6">
        <img src='${'http://image.tmdb.org/t/p/w780' + movie.backdropPath}' class="img-fluid" alt="${movie.title}" onclick="MovieSection.renderMovie(${movie.id})">
        <h4>${movie.title}</h4>
      </div>`).join(" ");}  

    if (personSearchResults.length === 0) { people = "<h4>Unfortunately, no such people found.</h4>"}

    //Loop through person search results and create a html string to display
    else {people = personSearchResults.map(person => `
    <div class="searchResult-card col-md-2 col-sm-3 col-6">
      <img src='${`http://image.tmdb.org/t/p/w780`+ person.profilePath}' class="img-fluid" alt="${person.name}" onclick='SingleActorPage.run(${person.id})'>
      <h4>${person.name}</h4>
    </div>`).join(" ")}

    container.innerHTML = `
    <h2>Movie Search Results</h2>
    <div class="row searchResults">${movies}</div>
    <h2>People Search Results</h2>
    <div class="row searchResults">${people}</div>`
  }

  
}

// Search button functionality
const submit = document.querySelector("#submit");
  submit.addEventListener("click", (e) => {
    e.preventDefault();
    const search = document.querySelector("#search").value;    
    SearchPage.renderSearchResults(search)
  })



document.addEventListener("DOMContentLoaded", App.run);




