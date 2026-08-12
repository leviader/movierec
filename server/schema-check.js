require('dotenv').config();
const neo4j = require('neo4j-driver');

const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);

async function run() {
  const session = driver.session();
  try {
    console.log('--- Node counts by label ---');
    const nodeCounts = await session.run(
      'MATCH (n) RETURN labels(n) AS label, count(*) AS count'
    );
    nodeCounts.records.forEach(r =>
      console.log(r.get('label').join(','), '->', r.get('count').toNumber())
    );

    console.log('\n--- Relationship counts by type ---');
    const relCounts = await session.run(
      'MATCH ()-[r]->() RETURN type(r) AS type, count(*) AS count'
    );
    relCounts.records.forEach(r =>
      console.log(r.get('type'), '->', r.get('count').toNumber())
    );

    console.log('\n--- Sample: one Movie with its connections ---');
    const sample = await session.run(
      `MATCH (m:Movie)
       OPTIONAL MATCH (m)<-[:ACTED_IN]-(a:Person)
       OPTIONAL MATCH (m)<-[:DIRECTED]-(d:Person)
       OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
       RETURN m.title AS title, collect(DISTINCT a.name) AS actors,
              collect(DISTINCT d.name) AS directors, collect(DISTINCT g.name) AS genres
       LIMIT 1`
    );
    sample.records.forEach(r => console.log(r.toObject()));
  } finally {
    await session.close();
    await driver.close();
  }
}

run();