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

driver.verifyConnectivity()
  .then(() => console.log('Connected to CognoDB!'))
  .catch(err => console.error('DB connection failed:', err));

// ─── MOVIES ───────────────────────────────────────────────

app.get('/api/movies', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run('MATCH (m:Movie) RETURN m ORDER BY m.year DESC');
    const movies = result.records.map(r => r.get('m').properties);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch movies' });
  } finally {
    await session.close();
  }
});

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
    if (result.records.length === 0) return res.status(404).json({ error: 'Movie not found' });
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

app.get('/api/movies/:title/similar', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie {title: $title})<-[:ACTED_IN]-(a:Person)-[:ACTED_IN]->(other:Movie)
       WHERE other.title <> $title
       RETURN other.title AS title, other.rating AS rating, count(DISTINCT a) AS sharedCount
       ORDER BY sharedCount DESC, other.rating DESC
       LIMIT 5`,
      { title: req.params.title }
    );
    const similar = result.records.map(r => ({
      title: r.get('title'),
      rating: r.get('rating'),
      sharedCount: r.get('sharedCount').toNumber(),
    }));
    res.json(similar);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch similar movies' });
  } finally {
    await session.close();
  }
});

// ─── SEARCH ──────────────────────────────────────────────

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

// ─── GENRES ──────────────────────────────────────────────

app.get('/api/genres', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (g:Genre)<-[:IN_GENRE]-(m:Movie)
       RETURN g.name AS name, count(m) AS movieCount
       ORDER BY movieCount DESC`
    );
    const genres = result.records.map(r => ({
      name: r.get('name'),
      movieCount: r.get('movieCount').toNumber(),
    }));
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch genres' });
  } finally {
    await session.close();
  }
});

app.get('/api/genres/:name', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (m:Movie)-[:IN_GENRE]->(g:Genre {name: $name})
       RETURN m ORDER BY m.rating DESC`,
      { name: req.params.name }
    );
    const movies = result.records.map(r => r.get('m').properties);
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch genre movies' });
  } finally {
    await session.close();
  }
});

// ─── LEGACY ACTOR ENDPOINTS (case‑insensitive) ──────────

app.get('/api/actor/:name', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person)
       WHERE toLower(p.name) = toLower($name)
       MATCH (p)-[:ACTED_IN]->(m:Movie)-[:IN_GENRE]->(g:Genre)
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

app.get('/api/actor/:name/collaborators', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person)
       WHERE toLower(p.name) = toLower($name)
       MATCH (p)-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(other:Person)
       WHERE other.name <> p.name
       RETURN other.name AS name, count(DISTINCT m) AS sharedMovies
       ORDER BY sharedMovies DESC
       LIMIT 10`,
      { name: req.params.name }
    );
    const collabs = result.records.map(r => ({
      name: r.get('name'),
      sharedMovies: r.get('sharedMovies').toNumber(),
    }));
    res.json(collabs);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch collaborators' });
  } finally {
    await session.close();
  }
});

// ─── NEW UNIFIED PERSON ENDPOINTS (case‑insensitive) ────

app.get('/api/person/:name', async (req, res) => {
  const session = driver.session();
  try {
    // 1. Get person info
    const personResult = await session.run(
      `MATCH (p:Person)
       WHERE toLower(p.name) = toLower($name)
       RETURN p`,
      { name: req.params.name }
    );
    if (personResult.records.length === 0) {
      return res.status(404).json({ error: 'Person not found' });
    }
    const person = personResult.records[0].get('p').properties;

    // 2. Acted‑in movies with genres
    const actedResult = await session.run(
      `MATCH (p:Person)
       WHERE toLower(p.name) = toLower($name)
       MATCH (p)-[:ACTED_IN]->(m:Movie)
       OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
       RETURN m.title AS title, m.year AS year, m.rating AS rating,
              collect(DISTINCT g.name) AS genres`,
      { name: req.params.name }
    );
    const acted = actedResult.records.map(r => ({
      title: r.get('title'),
      year: r.get('year'),
      rating: r.get('rating'),
      genres: r.get('genres'),
    }));

    // 3. Directed movies with genres
    const directedResult = await session.run(
      `MATCH (p:Person)
       WHERE toLower(p.name) = toLower($name)
       MATCH (p)-[:DIRECTED]->(m:Movie)
       OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
       RETURN m.title AS title, m.year AS year, m.rating AS rating,
              collect(DISTINCT g.name) AS genres`,
      { name: req.params.name }
    );
    const directed = directedResult.records.map(r => ({
      title: r.get('title'),
      year: r.get('year'),
      rating: r.get('rating'),
      genres: r.get('genres'),
    }));

    res.json({
      name: person.name,
      born: person.born || null,
      acted,
      directed,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch person details' });
  } finally {
    await session.close();
  }
});

app.get('/api/person/:name/collaborators', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (p:Person)
       WHERE toLower(p.name) = toLower($name)
       MATCH (p)-[:ACTED_IN]->(m:Movie)<-[:ACTED_IN]-(other:Person)
       WHERE other.name <> p.name
       RETURN other.name AS name, count(DISTINCT m) AS sharedMovies
       ORDER BY sharedMovies DESC
       LIMIT 10`,
      { name: req.params.name }
    );
    const collabs = result.records.map(r => ({
      name: r.get('name'),
      sharedMovies: r.get('sharedMovies').toNumber(),
    }));
    res.json(collabs);
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch collaborators' });
  } finally {
    await session.close();
  }
});

// ─── START ──────────────────────────────────────────────

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));