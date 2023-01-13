const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const intializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server Running at http:/localhost:3000/movies/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

intializeDBAndServer();

let camelCaseMovies = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};

let aboutMovie = (obj) => {
  return {
    movieId: obj.movie_id,
    directorId: obj.director_id,
    movieName: obj.movie_name,
    leadActor: obj.lead_actor,
  };
};

//API 1
app.get("/movies/", async (request, response) => {
  const getAllMoviesQuery = `SELECT movie_name FROM movie;`;
  const moviesArrays = await db.all(getAllMoviesQuery);
  response.send(moviesArrays.map((movie) => camelCaseMovies(movie)));
});

//API 2

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;

  const { directorId, movieName, leadActor } = movieDetails;

  const addMovieQuery = `INSERT INTO movie 
                                       (director_id,movie_name, lead_actor)
                                        VALUES 
                                        ('${directorId}', '${movieName}' , '${leadActor}') ; `;

  const dbResponse = await db.run(addMovieQuery);

  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const movieQuery = `SELECT * FROM  movie 
                  WHERE movie_id = ${movieId};`;

  const movie = await db.get(movieQuery);

  response.send(aboutMovie(movie));
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const Query = `
                    UPDATE 
                    movie 
                    SET 
                    director_id = '${directorId}',
                    movie_name = '${movieName}',
                    lead_actor = '${leadActor}'
                    WHERE  
                    movie_id = '${movieId}';`;

  const dbResponse = await db.run(Query);

  console.log(dbResponse);
  response.send("Movie Details Updated");
});

//API 5

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  console.log(movieId);
  const Query = `DELETE FROM movie WHERE movie_id = '${movieId}';`;
  const dbResponse = await db.run(Query);
  response.send("Movie Removed");
});

//...

let directorCamelCase = function (dbObject) {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//API 6

app.get("/directors/", async (request, response) => {
  const directorQuery = `SELECT * FROM director ; `;
  const arrayOfDirectors = await db.all(directorQuery);

  response.send(arrayOfDirectors.map((obj) => directorCamelCase(obj)));
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;

  const Query = `SELECT movie_name FROM movie WHERE director_id = '${directorId}'`;

  const ArrayOfMovies = await db.all(Query);

  response.send(
    ArrayOfMovies.map((obj) => {
      return camelCaseMovies(obj);
    })
  );
});

module.exports = app;
