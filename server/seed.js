require('dotenv').config();
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

const movies = [
  { title: 'The Matrix', year: 1999, rating: 8.7 },
  { title: 'John Wick', year: 2014, rating: 7.4 },
  { title: 'Cast Away', year: 2000, rating: 7.8 },
  { title: 'Forrest Gump', year: 1994, rating: 8.8 },
  { title: 'Inception', year: 2010, rating: 8.8 },
  { title: 'The Dark Knight', year: 2008, rating: 9.0 },
  { title: 'Interstellar', year: 2014, rating: 8.6 },
];

const people = [
  { name: 'Keanu Reeves', born: 1964 },
  { name: 'Tom Hanks', born: 1956 },
  { name: 'Leonardo DiCaprio', born: 1974 },
  { name: 'Christian Bale', born: 1974 },
  { name: 'Lana Wachowski', born: 1965 },
  { name: 'Christopher Nolan', born: 1970 },
  { name: 'Robert Zemeckis', born: 1951 },
  { name: 'Michael Caine', born: 1933 },
];

const genres = ['Action', 'Sci-Fi', 'Drama', 'Thriller'];

const actedIn = [
  { person: 'Keanu Reeves', movie: 'The Matrix' },
  { person: 'Keanu Reeves', movie: 'John Wick' },
  { person: 'Tom Hanks', movie: 'Cast Away' },
  { person: 'Tom Hanks', movie: 'Forrest Gump' },
  { person: 'Leonardo DiCaprio', movie: 'Inception' },
  { person: 'Leonardo DiCaprio', movie: 'The Dark Knight' },
  { person: 'Christian Bale', movie: 'The Dark Knight' },
  { person: 'Christian Bale', movie: 'Inception' },
  { person: 'Leonardo DiCaprio', movie: 'Interstellar' },
  { person: 'Michael Caine', movie: 'The Dark Knight' },
  { person: 'Michael Caine', movie: 'Inception' },
  { person: 'Michael Caine', movie: 'Interstellar' },
];

const directed = [
  { person: 'Lana Wachowski', movie: 'The Matrix' },
  { person: 'Christopher Nolan', movie: 'Inception' },
  { person: 'Christopher Nolan', movie: 'The Dark Knight' },
  { person: 'Christopher Nolan', movie: 'Interstellar' },
  { person: 'Robert Zemeckis', movie: 'Cast Away' },
  { person: 'Robert Zemeckis', movie: 'Forrest Gump' },
];

const movieGenres = [
  { movie: 'The Matrix', genre: 'Action' },
  { movie: 'The Matrix', genre: 'Sci-Fi' },
  { movie: 'John Wick', genre: 'Action' },
  { movie: 'John Wick', genre: 'Thriller' },
  { movie: 'Cast Away', genre: 'Drama' },
  { movie: 'Forrest Gump', genre: 'Drama' },
  { movie: 'Inception', genre: 'Sci-Fi' },
  { movie: 'Inception', genre: 'Thriller' },
  { movie: 'The Dark Knight', genre: 'Action' },
  { movie: 'The Dark Knight', genre: 'Thriller' },
  { movie: 'Interstellar', genre: 'Sci-Fi' },
  { movie: 'Interstellar', genre: 'Drama' },
];

async function seed() {
  const session = driver.session();
  try {
    console.log('Clearing old data...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('Creating movies...');
    for (const m of movies) {
      await session.run(
        'CREATE (:Movie {title: $title, year: $year, rating: $rating})',
        m
      );
    }

    console.log('Creating people...');
    for (const p of people) {
      await session.run(
        'CREATE (:Person {name: $name, born: $born})',
        p
      );
    }

    console.log('Creating genres...');
    for (const g of genres) {
      await session.run('CREATE (:Genre {name: $name})', { name: g });
    }

    console.log('Creating relationships...');
    for (const r of actedIn) {
      await session.run(
        `MATCH (p:Person {name: $person}), (m:Movie {title: $movie})
         CREATE (p)-[:ACTED_IN]->(m)`,
        r
      );
    }
    for (const r of directed) {
      await session.run(
        `MATCH (p:Person {name: $person}), (m:Movie {title: $movie})
         CREATE (p)-[:DIRECTED]->(m)`,
        r
      );
    }
    for (const r of movieGenres) {
      await session.run(
        `MATCH (m:Movie {title: $movie}), (g:Genre {name: $genre})
         CREATE (m)-[:IN_GENRE]->(g)`,
        r
      );
    }

    console.log('Done! Database seeded successfully.');
  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await session.close();
    await driver.close();
  }
}

seed();