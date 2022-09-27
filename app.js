const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

let db = null;

const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error : ${error}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//ResponsiveObject
const dbResponsiveObject = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

//Get Movies
app.get("/movies/", async (request, response) => {
  const getMoviesList = `SELECT movie_name FROM movie`;
  const dbResponse = await db.all(getMoviesList);
  response.send(dbResponse.map((eachName) => dbResponsiveObject(eachName)));
});

//Add Movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO movie (director_id,movie_name,lead_actor)
    VALUES(${directorId},"${movieName}","${leadActor}")
    `;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT * FROM movie WHERE movie_id = ${movieId}`;
  const dbResponse = await db.get(getMovieQuery);
  response.send(dbResponsiveObject(dbResponse));
});

//Update movie
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const getUpdatedQuery = `UPDATE movie SET director_id = ${directorId},movie_name = "${movieName}",lead_actor = "${leadActor}"`;
  const dbResponse = await db.run(getUpdatedQuery);
  response.send("Movie Details Updated");
});

//Delete Movie
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
    DELETE FROM movie WHERE movie_id = ${movieId}`;
  const dbResponse = await db.run(deleteQuery);
  response.send("Movie Removed");
});

//ResponsiveDirectorsObject
const dbDirectorsObject = (each) => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
};
//Get Directors
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT * FROM director`;
  const dbResponse = await db.all(getDirectorsQuery);
  response.send(dbResponse.map((eachItem) => dbDirectorsObject(eachItem)));
});

const movieList = (name) => {
  return {
    movieName: name.movie_name,
  };
};
//Get Director Movie
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieListQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId}`;
  const dbResponse = await db.all(getMovieListQuery);
  response.send(dbResponse.map((each) => movieList(each)));
});
