require('dotenv').config();
const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'client')));

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

// Test DB connection on startup
driver.verifyConnectivity()
  .then(() => console.log('Connected to CognoDB!'))
  .catch(err => console.error('DB connection failed:', err));

// Get all movies
app.get('/api/movies', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      'MATCH (m:Movie) RETURN m ORDER BY m.year DESC'
    );
    const movies = result.records.map(r => r.get('m').properties);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch movies' });
  } finally {
    await session.close();
  }
});

// Get a single movie with its actors, director and genres
app.get('/api/movies/:title', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {title: $title})
       OPTIONAL MATCH (a:Person)-[:ACTED_IN]->(m)
       OPTIONAL MATCH (d:Person)-[:DIRECTED]->(m)
       OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
       RETURN m,
              collect(DISTINCT a.name) AS actors,
              collect(DISTINCT d.name) AS directors,
              collect(DISTINCT g.name) AS genres`,
      { title: req.params.title }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    const record = result.records[0];
    res.json({
      ...record.get('m').properties,
      actors: record.get('actors'),
      directors: record.get('directors'),
      genres: record.get('genres'),
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch movie details' });
  } finally {
    await session.close();
  }
});

// Get movies by actor name (2-hop: Person -> Movie -> Genre)
app.get('/api/actor/:name', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person {name: $name})-[:ACTED_IN]->(m:Movie)-[:IN_GENRE]->(g:Genre)
       RETURN m.title AS title, m.year AS year, m.rating AS rating,
              collect(DISTINCT g.name) AS genres`,
      { name: req.params.name }
    );
    const movies = result.records.map(r => ({
      title: r.get('title'),
      year: r.get('year'),
      rating: r.get('rating'),
      genres: r.get('genres'),
    }));
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch actor movies' });
  } finally {
    await session.close();
  }
});

// Search movies by title
app.get('/api/search', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie)
       WHERE toLower(m.title) CONTAINS toLower($query)
       RETURN m ORDER BY m.rating DESC LIMIT 10`,
      { query: req.query.q || '' }
    );
    const movies = result.records.map(r => r.get('m').properties);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));