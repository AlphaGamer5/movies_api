const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

//Middleware for json parsing
app.use(express.json());

// initialize server and database
const serverAndDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(PORT, () => {
      console.log(`Server started at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log("Error : " + error.message);
    process.exit(1);
  }
};

serverAndDb();

const makeMovie = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};

const makeDirector = (director) => {
  return {
    directorId: director.director_id,
    directorName: director.director_name,
  };
};

//Getting all movies
app.get("/movies/", async (req, res) => {
  const query = `
        SELECT (movie_name)
        FROM movie
    ;`;

  const movies = await db.all(query);
  res.send(movies.map((movie) => makeMovie(movie)));
});

//Adding a movie to database
app.post("/movies/", async (req, res) => {
  const { directorId, movieName, leadActor } = req.body;
  const query = `
        INSERT INTO movie (director_id, movie_name, lead_actor)
        VALUES (${directorId}, '${movieName}', '${leadActor}')
    ;`;

  const movie = await db.run(query);
  res.send("Movie Successfully Added");
});

//Getting a specific movie based on id
app.get("/movies/:movieId", async (req, res) => {
  try {
    const { movieId } = req.params;
    const query = `
        SELECT *
        FROM movie
        WHERE movie_id=${movieId}
    ;`;

    const movie = await db.get(query);
    res.send(makeMovie(movie));
  } catch (error) {
    console.log("Error: " + error.message);
  }
});

// Updating a movie
app.put("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const { directorId, movieName, leadActor } = req.body;
  const query = `
        UPDATE movie
        SET director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId}
    ;`;

  const movie = await db.run(query);
  res.send("Movie Details Updated");
});

// Deleting a movie
app.delete("/movies/:movieId", async (req, res) => {
  const { movieId } = req.params;
  const query = `
        DELETE FROM movie
        WHERE movie_id = ${movieId}
    ;`;

  const movie = await db.run(query);
  res.send("Movie Removed");
});

// Getting all directors
app.get("/directors/", async (req, res) => {
  const query = `
        SELECT *
        FROM director
    ;`;

  const directors = await db.all(query);
  res.send(directors.map((director) => makeDirector(director)));
});

//Getting movies by a director
app.get("/directors/:directorId/movies/", async (req, res) => {
  const { directorId } = req.params;
  const query = `
        SELECT (movie_name)
        FROM movie
        WHERE director_id = ${directorId}
    ;`;

  const movies = await db.all(query);
  res.send(movies.map((movie) => ({ movieName: movie.movie_name })));
});

module.exports = app;
