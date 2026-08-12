\# CineGraph — Movie Explorer



A small full-stack app for exploring movies, actors, directors, and genres — backed by \*\*CognoDB\*\*, a managed graph database.



\*\*Live demo:\*\* https://movierec-pri1.onrender.com

\*(Free-tier hosting — the app may take 30–50 seconds to wake up if it's been idle.)\*



\---



\## Why a graph database?



Movies, people, and genres are naturally a network of relationships, not flat rows. Questions like \*"which movies share cast with this one?"\* or \*"what genres has this actor worked across?"\* require traversing connections — not joining tables.



In a relational schema, "movies with shared cast" needs a self-join through a bridge table (`movie\_cast`), grouped and counted — verbose and gets slower as the join depth grows. In Cypher, it's a single pattern match:



```cypher

MATCH (m:Movie {title: $title})<-\[:ACTED\_IN]-(p:Person)-\[:ACTED\_IN]->(other:Movie)

WHERE other.title <> $title

RETURN other.title, count(p) AS sharedCast

ORDER BY sharedCast DESC

```



This is the core reason a graph model earns its place here: relationships \*are\* the data, not an afterthought.



\---



\## Data model



\*\*Nodes\*\*

\- `Movie` — `title`, `year`, `rating`

\- `Person` — `name`, `born`

\- `Genre` — `name`



\*\*Relationships\*\*

\- `(Person)-\[:ACTED\_IN]->(Movie)`

\- `(Person)-\[:DIRECTED]->(Movie)`

\- `(Movie)-\[:IN\_GENRE]->(Genre)`

