-- Seed data from BGG scraper
INSERT INTO games (name, bgg_id, min_players, max_players, play_time_minutes, image_url, description, tutorial_url, year_published, rating) VALUES
(
  'Catan',
  '13',
  3,
  4,
  120,
  'https://cf.geekdo-images.com/0XODRpReiZBFUffEcqT5-Q__square100/img/CS0zXFDEkO7NJTWbWkpbMuYdo7U=/100x100/filters:strip_icc()/pic9156909.png',
  'In CATAN (formerly The Settlers of Catan), players try to be the dominant force on the island of Catan by building settlements, cities and roads. On each turn dice are rolled to determine which resources the island produces.',
  'https://www.youtube.com/watch?v=8Yj0Y3GKE40',
  1995,
  7.1
),
(
  'Dominion',
  '36218',
  2,
  4,
  30,
  'https://cf.geekdo-images.com/j6iQpZ4XkemZP07HNCODBA__square100/img/2r9sDtbDMFXDr_hJmVs5SLF2fyw=/100x100/filters:strip_icc()/pic394356.jpg',
  'You are a monarch, like your parents before you, a ruler of a small pleasant kingdom of rivers and evergreens. You want a bigger and more pleasant kingdom, with more rivers and a wider variety of trees. You want a Dominion!',
  'https://www.youtube.com/watch?v=KnO72F1ybHs',
  2008,
  7.6
),
(
  'Wingspan',
  '266192',
  1,
  5,
  70,
  'https://cf.geekdo-images.com/yLZJCVLlIx4c7eJEWUNJ7w__itemrep/img/DR7181wU4sHT6gn6Q1XccpPxNHg=/fit-in/246x300/filters:strip_icc()/pic4458123.jpg',
  'Wingspan is a competitive, medium-weight, card-driven, engine-building board game from Stonemaier Games. You are bird enthusiasts seeking to discover and attract the best birds to your network of wildlife preserves.',
  'https://www.youtube.com/watch?v=lgDgcLI2B0U',
  2019,
  8.0
);
