require('dotenv').config();
const express = require('express');
const neo4j = require('neo4j-driver');

const app = express();
const PORT = 3000;

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(process.env.NEO4J_USER || 'neo4j', process.env.NEO4J_PASSWORD || 'password')
);

// ============ EXTENSIVE SEED DATA ============
const movies = [
  // Classic & Modern Classics
  { title: 'The Godfather', year: 1972, rating: 9.2 },
  { title: 'The Godfather Part II', year: 1974, rating: 9.0 },
  { title: 'The Shawshank Redemption', year: 1994, rating: 9.3 },
  { title: 'Pulp Fiction', year: 1994, rating: 8.9 },
  { title: 'The Dark Knight', year: 2008, rating: 9.0 },
  { title: 'Forrest Gump', year: 1994, rating: 8.8 },
  { title: 'Inception', year: 2010, rating: 8.8 },
  { title: 'The Matrix', year: 1999, rating: 8.7 },
  { title: 'The Lord of the Rings: The Fellowship of the Ring', year: 2001, rating: 8.8 },
  { title: 'The Lord of the Rings: The Two Towers', year: 2002, rating: 8.7 },
  { title: 'The Lord of the Rings: The Return of the King', year: 2003, rating: 9.0 },
  { title: 'Interstellar', year: 2014, rating: 8.6 },
  { title: 'The Departed', year: 2006, rating: 8.5 },
  { title: 'The Wolf of Wall Street', year: 2013, rating: 8.2 },
  { title: 'The Revenant', year: 2015, rating: 8.0 },
  { title: 'Django Unchained', year: 2012, rating: 8.4 },
  { title: 'Inglourious Basterds', year: 2009, rating: 8.3 },
  { title: 'The Social Network', year: 2010, rating: 7.7 },
  { title: 'The Avengers', year: 2012, rating: 8.0 },
  { title: 'Guardians of the Galaxy', year: 2014, rating: 8.0 },
  { title: 'Black Panther', year: 2018, rating: 7.3 },
  { title: 'Joker', year: 2019, rating: 8.4 },
  { title: 'Parasite', year: 2019, rating: 8.5 },
  { title: 'Knives Out', year: 2019, rating: 7.9 },
  { title: 'Once Upon a Time in Hollywood', year: 2019, rating: 7.6 },
  { title: 'Mad Max: Fury Road', year: 2015, rating: 8.1 },
  { title: 'The Big Short', year: 2015, rating: 7.8 },
  { title: 'La La Land', year: 2016, rating: 8.0 },
  { title: 'Get Out', year: 2017, rating: 7.8 },
  { title: 'Dunkirk', year: 2017, rating: 7.8 },
  { title: 'Spider-Man: Into the Spider-Verse', year: 2018, rating: 8.4 },
  { title: 'Jojo Rabbit', year: 2019, rating: 7.9 },
  { title: '1917', year: 2019, rating: 8.2 },
  { title: 'Tenet', year: 2020, rating: 7.3 },
  { title: 'Oppenheimer', year: 2023, rating: 8.4 },
  { title: 'Barbie', year: 2023, rating: 7.0 },
  
  // Action/Thriller
  { title: 'John Wick', year: 2014, rating: 7.4 },
  { title: 'John Wick: Chapter 2', year: 2017, rating: 7.5 },
  { title: 'John Wick: Chapter 3 - Parabellum', year: 2019, rating: 7.4 },
  { title: 'Taken', year: 2008, rating: 7.8 },
  { title: 'The Bourne Identity', year: 2002, rating: 7.9 },
  { title: 'The Bourne Supremacy', year: 2004, rating: 7.7 },
  { title: 'The Bourne Ultimatum', year: 2007, rating: 8.0 },
  { title: 'Casino Royale', year: 2006, rating: 8.0 },
  { title: 'Skyfall', year: 2012, rating: 7.8 },
  
  // Drama
  { title: 'The Pianist', year: 2002, rating: 8.5 },
  { title: 'A Beautiful Mind', year: 2001, rating: 8.2 },
  { title: 'The Pursuit of Happyness', year: 2006, rating: 8.0 },
  { title: 'The Green Book', year: 2018, rating: 8.2 },
  { title: 'Moonlight', year: 2016, rating: 7.4 },
  { title: 'Three Billboards Outside Ebbing, Missouri', year: 2017, rating: 8.1 },
  { title: 'The Shape of Water', year: 2017, rating: 7.3 },
  { title: 'Nomadland', year: 2020, rating: 7.3 },
  
  // Sci-Fi
  { title: 'Blade Runner 2049', year: 2017, rating: 8.0 },
  { title: 'Arrival', year: 2016, rating: 7.9 },
  { title: 'The Martian', year: 2015, rating: 8.0 },
  { title: 'Gravity', year: 2013, rating: 7.7 },
  { title: 'Ex Machina', year: 2014, rating: 7.7 },
  { title: 'Annihilation', year: 2018, rating: 6.8 },
  { title: 'Dune', year: 2021, rating: 8.0 },
  { title: 'Dune: Part Two', year: 2024, rating: 8.3 },
  
  // Comedy
  { title: 'The Grand Budapest Hotel', year: 2014, rating: 8.1 },
  { title: 'The Nice Guys', year: 2016, rating: 7.4 },
  { title: 'The Favourite', year: 2018, rating: 7.5 },
  { title: 'Booksmart', year: 2019, rating: 7.1 },
  { title: 'Licorice Pizza', year: 2021, rating: 7.1 },
];

const people = [
  // Actors
  { name: 'Marlon Brando', born: 1924 },
  { name: 'Al Pacino', born: 1940 },
  { name: 'Robert De Niro', born: 1943 },
  { name: 'Morgan Freeman', born: 1937 },
  { name: 'Tim Robbins', born: 1958 },
  { name: 'Samuel L. Jackson', born: 1948 },
  { name: 'John Travolta', born: 1954 },
  { name: 'Uma Thurman', born: 1970 },
  { name: 'Christian Bale', born: 1974 },
  { name: 'Heath Ledger', born: 1979 },
  { name: 'Tom Hanks', born: 1956 },
  { name: 'Leonardo DiCaprio', born: 1974 },
  { name: 'Joseph Gordon-Levitt', born: 1981 },
  { name: 'Elliot Page', born: 1987 },
  { name: 'Keanu Reeves', born: 1964 },
  { name: 'Laurence Fishburne', born: 1961 },
  { name: 'Carrie-Anne Moss', born: 1967 },
  { name: 'Elijah Wood', born: 1981 },
  { name: 'Ian McKellen', born: 1939 },
  { name: 'Viggo Mortensen', born: 1958 },
  { name: 'Matthew McConaughey', born: 1969 },
  { name: 'Anne Hathaway', born: 1982 },
  { name: 'Jack Nicholson', born: 1937 },
  { name: 'Matt Damon', born: 1970 },
  { name: 'Leonardo DiCaprio', born: 1974 },
  { name: 'Jonah Hill', born: 1983 },
  { name: 'Margot Robbie', born: 1990 },
  { name: 'Brad Pitt', born: 1963 },
  { name: 'Christoph Waltz', born: 1956 },
  { name: 'Jamie Foxx', born: 1967 },
  { name: 'Jesse Eisenberg', born: 1983 },
  { name: 'Andrew Garfield', born: 1983 },
  { name: 'Robert Downey Jr.', born: 1965 },
  { name: 'Chris Evans', born: 1981 },
  { name: 'Scarlett Johansson', born: 1984 },
  { name: 'Chadwick Boseman', born: 1976 },
  { name: 'Joaquin Phoenix', born: 1974 },
  { name: 'Song Kang-ho', born: 1967 },
  { name: 'Daniel Craig', born: 1968 },
  { name: 'Ryan Gosling', born: 1980 },
  { name: 'Emma Stone', born: 1988 },
  { name: 'Daniel Kaluuya', born: 1989 },
  { name: 'Timothée Chalamet', born: 1995 },
  { name: 'Zendaya', born: 1996 },
  
  // Directors
  { name: 'Francis Ford Coppola', born: 1939 },
  { name: 'Frank Darabont', born: 1959 },
  { name: 'Quentin Tarantino', born: 1963 },
  { name: 'Christopher Nolan', born: 1970 },
  { name: 'Robert Zemeckis', born: 1951 },
  { name: 'Lana Wachowski', born: 1965 },
  { name: 'Lilly Wachowski', born: 1967 },
  { name: 'Peter Jackson', born: 1961 },
  { name: 'Martin Scorsese', born: 1942 },
  { name: 'Alejandro G. Iñárritu', born: 1963 },
  { name: 'David Fincher', born: 1962 },
  { name: 'Joss Whedon', born: 1964 },
  { name: 'James Gunn', born: 1966 },
  { name: 'Ryan Coogler', born: 1986 },
  { name: 'Todd Phillips', born: 1970 },
  { name: 'Bong Joon-ho', born: 1969 },
  { name: 'Rian Johnson', born: 1973 },
  { name: 'George Miller', born: 1945 },
  { name: 'Adam McKay', born: 1968 },
  { name: 'Damien Chazelle', born: 1985 },
  { name: 'Jordan Peele', born: 1979 },
  { name: 'Taika Waititi', born: 1975 },
  { name: 'Sam Mendes', born: 1965 },
  { name: 'Greta Gerwig', born: 1983 },
  { name: 'Guillermo del Toro', born: 1964 },
  { name: 'Chloé Zhao', born: 1982 },
  { name: 'Denis Villeneuve', born: 1967 },
  { name: 'Wes Anderson', born: 1969 },
];

const genres = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 
  'Drama', 'Family', 'Fantasy', 'Film-Noir', 'History', 'Horror',
  'Music', 'Musical', 'Mystery', 'Romance', 'Sci-Fi', 'Sport',
  'Thriller', 'War', 'Western'
];

// Extensive acting relationships
const actedIn = [
  // The Godfather
  { person: 'Marlon Brando', movie: 'The Godfather' },
  { person: 'Al Pacino', movie: 'The Godfather' },
  { person: 'Robert De Niro', movie: 'The Godfather Part II' },
  { person: 'Al Pacino', movie: 'The Godfather Part II' },
  
  // Shawshank
  { person: 'Morgan Freeman', movie: 'The Shawshank Redemption' },
  { person: 'Tim Robbins', movie: 'The Shawshank Redemption' },
  
  // Pulp Fiction
  { person: 'John Travolta', movie: 'Pulp Fiction' },
  { person: 'Samuel L. Jackson', movie: 'Pulp Fiction' },
  { person: 'Uma Thurman', movie: 'Pulp Fiction' },
  
  // Dark Knight
  { person: 'Christian Bale', movie: 'The Dark Knight' },
  { person: 'Heath Ledger', movie: 'The Dark Knight' },
  { person: 'Morgan Freeman', movie: 'The Dark Knight' },
  { person: 'Michael Caine', movie: 'The Dark Knight' },
  
  // Forrest Gump
  { person: 'Tom Hanks', movie: 'Forrest Gump' },
  { person: 'Robin Wright', movie: 'Forrest Gump' },
  
  // Inception
  { person: 'Leonardo DiCaprio', movie: 'Inception' },
  { person: 'Joseph Gordon-Levitt', movie: 'Inception' },
  { person: 'Elliot Page', movie: 'Inception' },
  { person: 'Tom Hardy', movie: 'Inception' },
  { person: 'Michael Caine', movie: 'Inception' },
  
  // Matrix
  { person: 'Keanu Reeves', movie: 'The Matrix' },
  { person: 'Laurence Fishburne', movie: 'The Matrix' },
  { person: 'Carrie-Anne Moss', movie: 'The Matrix' },
  
  // Lord of the Rings
  { person: 'Elijah Wood', movie: 'The Lord of the Rings: The Fellowship of the Ring' },
  { person: 'Ian McKellen', movie: 'The Lord of the Rings: The Fellowship of the Ring' },
  { person: 'Viggo Mortensen', movie: 'The Lord of the Rings: The Fellowship of the Ring' },
  { person: 'Elijah Wood', movie: 'The Lord of the Rings: The Two Towers' },
  { person: 'Ian McKellen', movie: 'The Lord of the Rings: The Two Towers' },
  { person: 'Viggo Mortensen', movie: 'The Lord of the Rings: The Two Towers' },
  { person: 'Elijah Wood', movie: 'The Lord of the Rings: The Return of the King' },
  { person: 'Ian McKellen', movie: 'The Lord of the Rings: The Return of the King' },
  { person: 'Viggo Mortensen', movie: 'The Lord of the Rings: The Return of the King' },
  
  // Interstellar
  { person: 'Matthew McConaughey', movie: 'Interstellar' },
  { person: 'Anne Hathaway', movie: 'Interstellar' },
  { person: 'Michael Caine', movie: 'Interstellar' },
  
  // Departed
  { person: 'Leonardo DiCaprio', movie: 'The Departed' },
  { person: 'Matt Damon', movie: 'The Departed' },
  { person: 'Jack Nicholson', movie: 'The Departed' },
  
  // Wolf of Wall Street
  { person: 'Leonardo DiCaprio', movie: 'The Wolf of Wall Street' },
  { person: 'Jonah Hill', movie: 'The Wolf of Wall Street' },
  { person: 'Margot Robbie', movie: 'The Wolf of Wall Street' },
  
  // Django
  { person: 'Jamie Foxx', movie: 'Django Unchained' },
  { person: 'Christoph Waltz', movie: 'Django Unchained' },
  { person: 'Leonardo DiCaprio', movie: 'Django Unchained' },
  
  // Inglourious Basterds
  { person: 'Brad Pitt', movie: 'Inglourious Basterds' },
  { person: 'Christoph Waltz', movie: 'Inglourious Basterds' },
  
  // Social Network
  { person: 'Jesse Eisenberg', movie: 'The Social Network' },
  { person: 'Andrew Garfield', movie: 'The Social Network' },
  
  // Avengers
  { person: 'Robert Downey Jr.', movie: 'The Avengers' },
  { person: 'Chris Evans', movie: 'The Avengers' },
  { person: 'Scarlett Johansson', movie: 'The Avengers' },
  
  // Black Panther
  { person: 'Chadwick Boseman', movie: 'Black Panther' },
  { person: 'Michael B. Jordan', movie: 'Black Panther' },
  
  // Joker
  { person: 'Joaquin Phoenix', movie: 'Joker' },
  { person: 'Robert De Niro', movie: 'Joker' },
  
  // Parasite
  { person: 'Song Kang-ho', movie: 'Parasite' },
  
  // Once Upon a Time in Hollywood
  { person: 'Leonardo DiCaprio', movie: 'Once Upon a Time in Hollywood' },
  { person: 'Brad Pitt', movie: 'Once Upon a Time in Hollywood' },
  { person: 'Margot Robbie', movie: 'Once Upon a Time in Hollywood' },
  
  // John Wick series
  { person: 'Keanu Reeves', movie: 'John Wick' },
  { person: 'Keanu Reeves', movie: 'John Wick: Chapter 2' },
  { person: 'Keanu Reeves', movie: 'John Wick: Chapter 3 - Parabellum' },
  
  // Casino Royale / Skyfall
  { person: 'Daniel Craig', movie: 'Casino Royale' },
  { person: 'Daniel Craig', movie: 'Skyfall' },
  { person: 'Judi Dench', movie: 'Casino Royale' },
  { person: 'Judi Dench', movie: 'Skyfall' },
  
  // Dune
  { person: 'Timothée Chalamet', movie: 'Dune' },
  { person: 'Zendaya', movie: 'Dune' },
  { person: 'Timothée Chalamet', movie: 'Dune: Part Two' },
  { person: 'Zendaya', movie: 'Dune: Part Two' },
  
  // Barbie
  { person: 'Margot Robbie', movie: 'Barbie' },
  { person: 'Ryan Gosling', movie: 'Barbie' },
  
  // Oppenheimer
  { person: 'Cillian Murphy', movie: 'Oppenheimer' },
  { person: 'Robert Downey Jr.', movie: 'Oppenheimer' },
  { person: 'Matt Damon', movie: 'Oppenheimer' },
  
  // La La Land
  { person: 'Ryan Gosling', movie: 'La La Land' },
  { person: 'Emma Stone', movie: 'La La Land' },
  
  // Get Out
  { person: 'Daniel Kaluuya', movie: 'Get Out' },
  
  // The Revenant
  { person: 'Leonardo DiCaprio', movie: 'The Revenant' },
  { person: 'Tom Hardy', movie: 'The Revenant' },
  
  // The Pianist
  { person: 'Adrien Brody', movie: 'The Pianist' },
  
  // A Beautiful Mind
  { person: 'Russell Crowe', movie: 'A Beautiful Mind' },
  { person: 'Jennifer Connelly', movie: 'A Beautiful Mind' },
  
  // The Pursuit of Happyness
  { person: 'Will Smith', movie: 'The Pursuit of Happyness' },
  { person: 'Jaden Smith', movie: 'The Pursuit of Happyness' },
  
  // The Grand Budapest Hotel
  { person: 'Ralph Fiennes', movie: 'The Grand Budapest Hotel' },
  
  // Mad Max: Fury Road
  { person: 'Tom Hardy', movie: 'Mad Max: Fury Road' },
  { person: 'Charlize Theron', movie: 'Mad Max: Fury Road' },
  
  // The Big Short
  { person: 'Christian Bale', movie: 'The Big Short' },
  { person: 'Steve Carell', movie: 'The Big Short' },
  { person: 'Ryan Gosling', movie: 'The Big Short' },
];

// Director relationships
const directed = [
  { person: 'Francis Ford Coppola', movie: 'The Godfather' },
  { person: 'Francis Ford Coppola', movie: 'The Godfather Part II' },
  { person: 'Frank Darabont', movie: 'The Shawshank Redemption' },
  { person: 'Quentin Tarantino', movie: 'Pulp Fiction' },
  { person: 'Quentin Tarantino', movie: 'Django Unchained' },
  { person: 'Quentin Tarantino', movie: 'Inglourious Basterds' },
  { person: 'Quentin Tarantino', movie: 'Once Upon a Time in Hollywood' },
  { person: 'Christopher Nolan', movie: 'The Dark Knight' },
  { person: 'Christopher Nolan', movie: 'Inception' },
  { person: 'Christopher Nolan', movie: 'Interstellar' },
  { person: 'Christopher Nolan', movie: 'Dunkirk' },
  { person: 'Christopher Nolan', movie: 'Tenet' },
  { person: 'Christopher Nolan', movie: 'Oppenheimer' },
  { person: 'Robert Zemeckis', movie: 'Forrest Gump' },
  { person: 'Lana Wachowski', movie: 'The Matrix' },
  { person: 'Lilly Wachowski', movie: 'The Matrix' },
  { person: 'Peter Jackson', movie: 'The Lord of the Rings: The Fellowship of the Ring' },
  { person: 'Peter Jackson', movie: 'The Lord of the Rings: The Two Towers' },
  { person: 'Peter Jackson', movie: 'The Lord of the Rings: The Return of the King' },
  { person: 'Martin Scorsese', movie: 'The Departed' },
  { person: 'Martin Scorsese', movie: 'The Wolf of Wall Street' },
  { person: 'Alejandro G. Iñárritu', movie: 'The Revenant' },
  { person: 'David Fincher', movie: 'The Social Network' },
  { person: 'Joss Whedon', movie: 'The Avengers' },
  { person: 'James Gunn', movie: 'Guardians of the Galaxy' },
  { person: 'Ryan Coogler', movie: 'Black Panther' },
  { person: 'Todd Phillips', movie: 'Joker' },
  { person: 'Bong Joon-ho', movie: 'Parasite' },
  { person: 'Rian Johnson', movie: 'Knives Out' },
  { person: 'George Miller', movie: 'Mad Max: Fury Road' },
  { person: 'Adam McKay', movie: 'The Big Short' },
  { person: 'Damien Chazelle', movie: 'La La Land' },
  { person: 'Jordan Peele', movie: 'Get Out' },
  { person: 'Taika Waititi', movie: 'Jojo Rabbit' },
  { person: 'Sam Mendes', movie: '1917' },
  { person: 'Greta Gerwig', movie: 'Barbie' },
  { person: 'Guillermo del Toro', movie: 'The Shape of Water' },
  { person: 'Chloé Zhao', movie: 'Nomadland' },
  { person: 'Denis Villeneuve', movie: 'Arrival' },
  { person: 'Denis Villeneuve', movie: 'Blade Runner 2049' },
  { person: 'Denis Villeneuve', movie: 'Dune' },
  { person: 'Denis Villeneuve', movie: 'Dune: Part Two' },
  { person: 'Wes Anderson', movie: 'The Grand Budapest Hotel' },
];

// Genre assignments
const movieGenres = [
  // The Godfather
  { movie: 'The Godfather', genre: 'Crime' },
  { movie: 'The Godfather', genre: 'Drama' },
  { movie: 'The Godfather Part II', genre: 'Crime' },
  { movie: 'The Godfather Part II', genre: 'Drama' },
  
  // Shawshank
  { movie: 'The Shawshank Redemption', genre: 'Drama' },
  
  // Pulp Fiction
  { movie: 'Pulp Fiction', genre: 'Crime' },
  { movie: 'Pulp Fiction', genre: 'Drama' },
  
  // Dark Knight
  { movie: 'The Dark Knight', genre: 'Action' },
  { movie: 'The Dark Knight', genre: 'Crime' },
  { movie: 'The Dark Knight', genre: 'Drama' },
  { movie: 'The Dark Knight', genre: 'Thriller' },
  
  // Forrest Gump
  { movie: 'Forrest Gump', genre: 'Drama' },
  { movie: 'Forrest Gump', genre: 'Romance' },
  
  // Inception
  { movie: 'Inception', genre: 'Action' },
  { movie: 'Inception', genre: 'Sci-Fi' },
  { movie: 'Inception', genre: 'Thriller' },
  
  // Matrix
  { movie: 'The Matrix', genre: 'Action' },
  { movie: 'The Matrix', genre: 'Sci-Fi' },
  
  // Lord of the Rings
  { movie: 'The Lord of the Rings: The Fellowship of the Ring', genre: 'Action' },
  { movie: 'The Lord of the Rings: The Fellowship of the Ring', genre: 'Adventure' },
  { movie: 'The Lord of the Rings: The Fellowship of the Ring', genre: 'Drama' },
  { movie: 'The Lord of the Rings: The Fellowship of the Ring', genre: 'Fantasy' },
  { movie: 'The Lord of the Rings: The Two Towers', genre: 'Action' },
  { movie: 'The Lord of the Rings: The Two Towers', genre: 'Adventure' },
  { movie: 'The Lord of the Rings: The Two Towers', genre: 'Drama' },
  { movie: 'The Lord of the Rings: The Two Towers', genre: 'Fantasy' },
  { movie: 'The Lord of the Rings: The Return of the King', genre: 'Action' },
  { movie: 'The Lord of the Rings: The Return of the King', genre: 'Adventure' },
  { movie: 'The Lord of the Rings: The Return of the King', genre: 'Drama' },
  { movie: 'The Lord of the Rings: The Return of the King', genre: 'Fantasy' },
  
  // Interstellar
  { movie: 'Interstellar', genre: 'Adventure' },
  { movie: 'Interstellar', genre: 'Drama' },
  { movie: 'Interstellar', genre: 'Sci-Fi' },
  
  // Departed
  { movie: 'The Departed', genre: 'Crime' },
  { movie: 'The Departed', genre: 'Drama' },
  { movie: 'The Departed', genre: 'Thriller' },
  
  // Wolf of Wall Street
  { movie: 'The Wolf of Wall Street', genre: 'Biography' },
  { movie: 'The Wolf of Wall Street', genre: 'Comedy' },
  { movie: 'The Wolf of Wall Street', genre: 'Crime' },
  { movie: 'The Wolf of Wall Street', genre: 'Drama' },
  
  // Django
  { movie: 'Django Unchained', genre: 'Drama' },
  { movie: 'Django Unchained', genre: 'Western' },
  
  // Inglourious Basterds
  { movie: 'Inglourious Basterds', genre: 'Adventure' },
  { movie: 'Inglourious Basterds', genre: 'Drama' },
  { movie: 'Inglourious Basterds', genre: 'War' },
  
  // Social Network
  { movie: 'The Social Network', genre: 'Biography' },
  { movie: 'The Social Network', genre: 'Drama' },
  
  // Avengers
  { movie: 'The Avengers', genre: 'Action' },
  { movie: 'The Avengers', genre: 'Adventure' },
  { movie: 'The Avengers', genre: 'Sci-Fi' },
  
  // Black Panther
  { movie: 'Black Panther', genre: 'Action' },
  { movie: 'Black Panther', genre: 'Adventure' },
  { movie: 'Black Panther', genre: 'Sci-Fi' },
  
  // Joker
  { movie: 'Joker', genre: 'Crime' },
  { movie: 'Joker', genre: 'Drama' },
  { movie: 'Joker', genre: 'Thriller' },
  
  // Parasite
  { movie: 'Parasite', genre: 'Comedy' },
  { movie: 'Parasite', genre: 'Drama' },
  { movie: 'Parasite', genre: 'Thriller' },
  
  // Knives Out
  { movie: 'Knives Out', genre: 'Comedy' },
  { movie: 'Knives Out', genre: 'Crime' },
  { movie: 'Knives Out', genre: 'Drama' },
  { movie: 'Knives Out', genre: 'Mystery' },
  
  // Once Upon a Time in Hollywood
  { movie: 'Once Upon a Time in Hollywood', genre: 'Comedy' },
  { movie: 'Once Upon a Time in Hollywood', genre: 'Drama' },
  
  // John Wick
  { movie: 'John Wick', genre: 'Action' },
  { movie: 'John Wick', genre: 'Crime' },
  { movie: 'John Wick', genre: 'Thriller' },
  { movie: 'John Wick: Chapter 2', genre: 'Action' },
  { movie: 'John Wick: Chapter 2', genre: 'Crime' },
  { movie: 'John Wick: Chapter 2', genre: 'Thriller' },
  { movie: 'John Wick: Chapter 3 - Parabellum', genre: 'Action' },
  { movie: 'John Wick: Chapter 3 - Parabellum', genre: 'Crime' },
  { movie: 'John Wick: Chapter 3 - Parabellum', genre: 'Thriller' },
  
  // Casino Royale / Skyfall
  { movie: 'Casino Royale', genre: 'Action' },
  { movie: 'Casino Royale', genre: 'Adventure' },
  { movie: 'Casino Royale', genre: 'Thriller' },
  { movie: 'Skyfall', genre: 'Action' },
  { movie: 'Skyfall', genre: 'Adventure' },
  { movie: 'Skyfall', genre: 'Thriller' },
  
  // Dune
  { movie: 'Dune', genre: 'Action' },
  { movie: 'Dune', genre: 'Adventure' },
  { movie: 'Dune', genre: 'Drama' },
  { movie: 'Dune', genre: 'Sci-Fi' },
  { movie: 'Dune: Part Two', genre: 'Action' },
  { movie: 'Dune: Part Two', genre: 'Adventure' },
  { movie: 'Dune: Part Two', genre: 'Drama' },
  { movie: 'Dune: Part Two', genre: 'Sci-Fi' },
  
  // Barbie
  { movie: 'Barbie', genre: 'Adventure' },
  { movie: 'Barbie', genre: 'Comedy' },
  { movie: 'Barbie', genre: 'Fantasy' },
  
  // Oppenheimer
  { movie: 'Oppenheimer', genre: 'Biography' },
  { movie: 'Oppenheimer', genre: 'Drama' },
  { movie: 'Oppenheimer', genre: 'History' },
  
  // La La Land
  { movie: 'La La Land', genre: 'Comedy' },
  { movie: 'La La Land', genre: 'Drama' },
  { movie: 'La La Land', genre: 'Music' },
  { movie: 'La La Land', genre: 'Musical' },
  { movie: 'La La Land', genre: 'Romance' },
  
  // Get Out
  { movie: 'Get Out', genre: 'Horror' },
  { movie: 'Get Out', genre: 'Mystery' },
  { movie: 'Get Out', genre: 'Thriller' },
  
  // The Revenant
  { movie: 'The Revenant', genre: 'Adventure' },
  { movie: 'The Revenant', genre: 'Drama' },
  { movie: 'The Revenant', genre: 'Thriller' },
  { movie: 'The Revenant', genre: 'Western' },
  
  // The Pianist
  { movie: 'The Pianist', genre: 'Biography' },
  { movie: 'The Pianist', genre: 'Drama' },
  { movie: 'The Pianist', genre: 'Music' },
  { movie: 'The Pianist', genre: 'War' },
  
  // A Beautiful Mind
  { movie: 'A Beautiful Mind', genre: 'Biography' },
  { movie: 'A Beautiful Mind', genre: 'Drama' },
  
  // The Pursuit of Happyness
  { movie: 'The Pursuit of Happyness', genre: 'Biography' },
  { movie: 'The Pursuit of Happyness', genre: 'Drama' },
  
  // The Grand Budapest Hotel
  { movie: 'The Grand Budapest Hotel', genre: 'Adventure' },
  { movie: 'The Grand Budapest Hotel', genre: 'Comedy' },
  { movie: 'The Grand Budapest Hotel', genre: 'Drama' },
  
  // Mad Max: Fury Road
  { movie: 'Mad Max: Fury Road', genre: 'Action' },
  { movie: 'Mad Max: Fury Road', genre: 'Adventure' },
  { movie: 'Mad Max: Fury Road', genre: 'Sci-Fi' },
  { movie: 'Mad Max: Fury Road', genre: 'Thriller' },
  
  // The Big Short
  { movie: 'The Big Short', genre: 'Biography' },
  { movie: 'The Big Short', genre: 'Comedy' },
  { movie: 'The Big Short', genre: 'Drama' },
  
  // Mad Max: Fury Road
  { movie: 'Mad Max: Fury Road', genre: 'Action' },
  { movie: 'Mad Max: Fury Road', genre: 'Adventure' },
  { movie: 'Mad Max: Fury Road', genre: 'Sci-Fi' },
  { movie: 'Mad Max: Fury Road', genre: 'Thriller' },
  
  // The Big Short
  { movie: 'The Big Short', genre: 'Biography' },
  { movie: 'The Big Short', genre: 'Comedy' },
  { movie: 'The Big Short', genre: 'Drama' },
  
  // Dunkirk
  { movie: 'Dunkirk', genre: 'Action' },
  { movie: 'Dunkirk', genre: 'Drama' },
  { movie: 'Dunkirk', genre: 'History' },
  { movie: 'Dunkirk', genre: 'Thriller' },
  { movie: 'Dunkirk', genre: 'War' },
  
  // 1917
  { movie: '1917', genre: 'Action' },
  { movie: '1917', genre: 'Drama' },
  { movie: '1917', genre: 'War' },
  
  // Jojo Rabbit
  { movie: 'Jojo Rabbit', genre: 'Comedy' },
  { movie: 'Jojo Rabbit', genre: 'Drama' },
  { movie: 'Jojo Rabbit', genre: 'War' },
  
  // The Shape of Water
  { movie: 'The Shape of Water', genre: 'Drama' },
  { movie: 'The Shape of Water', genre: 'Fantasy' },
  { movie: 'The Shape of Water', genre: 'Romance' },
  
  // Three Billboards
  { movie: 'Three Billboards Outside Ebbing, Missouri', genre: 'Comedy' },
  { movie: 'Three Billboards Outside Ebbing, Missouri', genre: 'Crime' },
  { movie: 'Three Billboards Outside Ebbing, Missouri', genre: 'Drama' },
  
  // Arrival
  { movie: 'Arrival', genre: 'Drama' },
  { movie: 'Arrival', genre: 'Mystery' },
  { movie: 'Arrival', genre: 'Sci-Fi' },
  
  // Blade Runner 2049
  { movie: 'Blade Runner 2049', genre: 'Action' },
  { movie: 'Blade Runner 2049', genre: 'Drama' },
  { movie: 'Blade Runner 2049', genre: 'Sci-Fi' },
  { movie: 'Blade Runner 2049', genre: 'Thriller' },
];

// ============ API ENDPOINTS ============

app.get('/api/movies', async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (m:Movie)
      OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
      RETURN m.title AS title, m.year AS year, m.rating AS rating,
             COLLECT(DISTINCT g.name) AS genres
      ORDER BY m.rating DESC
    `);
    res.json(result.records.map(r => r.toObject()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get('/api/search', async (req, res) => {
  const q = req.query.q || '';
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (m:Movie)
      WHERE m.title =~ $regex
      OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
      RETURN m.title AS title, m.year AS year, m.rating AS rating,
             COLLECT(DISTINCT g.name) AS genres
      ORDER BY m.rating DESC
      LIMIT 50
    `, { regex: `(?i).*${q}.*` });
    res.json(result.records.map(r => r.toObject()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get('/api/actor/:name', async (req, res) => {
  const name = req.params.name;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (p:Person {name: $name})-[:ACTED_IN]->(m:Movie)
      OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
      RETURN m.title AS title, m.year AS year, m.rating AS rating,
             COLLECT(DISTINCT g.name) AS genres
      ORDER BY m.rating DESC
    `, { name });
    res.json(result.records.map(r => r.toObject()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get('/api/movies/:title', async (req, res) => {
  const title = req.params.title;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (m:Movie {title: $title})
      OPTIONAL MATCH (m)-[:IN_GENRE]->(g:Genre)
      OPTIONAL MATCH (p:Person)-[:ACTED_IN]->(m)
      OPTIONAL MATCH (d:Person)-[:DIRECTED]->(m)
      RETURN m.title AS title, m.year AS year, m.rating AS rating,
             COLLECT(DISTINCT g.name) AS genres,
             COLLECT(DISTINCT p.name) AS actors,
             COLLECT(DISTINCT d.name) AS directors
    `, { title });
    if (result.records.length === 0) {
      res.status(404).json({ error: 'Movie not found' });
      return;
    }
    res.json(result.records[0].toObject());
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get('/api/movies/:title/similar', async (req, res) => {
  const title = req.params.title;
  const session = driver.session();
  try {
    const result = await session.run(`
      MATCH (m:Movie {title: $title})-[:ACTED_IN]<-[:ACTED_IN]-(p:Person)-[:ACTED_IN]->(similar:Movie)
      WHERE similar <> m
      WITH similar, COUNT(DISTINCT p) AS sharedActors
      ORDER BY sharedActors DESC
      LIMIT 6
      RETURN similar.title AS title, similar.rating AS rating, sharedActors AS sharedCount
    `, { title });
    res.json(result.records.map(r => r.toObject()));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ============ SEED DATABASE ============

async function seedDatabase() {
  const session = driver.session();
  try {
    console.log('🗑️ Clearing old data...');
    await session.run('MATCH (n) DETACH DELETE n');

    console.log('🎬 Creating movies...');
    for (const m of movies) {
      await session.run(
        'CREATE (:Movie {title: $title, year: $year, rating: $rating})',
        m
      );
    }

    console.log('👤 Creating people...');
    for (const p of people) {
      await session.run(
        'CREATE (:Person {name: $name, born: $born})',
        p
      );
    }

    console.log('🏷️ Creating genres...');
    for (const g of genres) {
      await session.run('CREATE (:Genre {name: $name})', { name: g });
    }

    console.log('🔗 Creating relationships...');
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

    console.log('✅ Database seeded successfully!');
    console.log(`📊 ${movies.length} movies, ${people.length} people, ${genres.length} genres`);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await session.close();
  }
}

// ============ SERVER STARTUP ============

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Check if database is empty, seed if needed
  const session = driver.session();
  try {
    const result = await session.run('MATCH (m:Movie) RETURN COUNT(m) AS count');
    const count = result.records[0].get('count').toNumber ? 
                  result.records[0].get('count').toNumber() : 
                  result.records[0].get('count');
    
    if (count === 0) {
      console.log('📦 Database is empty. Seeding with data...');
      await seedDatabase();
    } else {
      console.log(`✅ Database already contains ${count} movies.`);
    }
  } catch (err) {
    console.log('⚠️ Could not check database state. Attempting to seed...');
    await seedDatabase();
  } finally {
    await session.close();
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await driver.close();
  process.exit(0);
});