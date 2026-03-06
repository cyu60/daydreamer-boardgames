-- Seed data from BGG scraper (13 games)
-- Clear existing games first to avoid duplicates
DELETE FROM games;

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
),
(
  'Dominion: Intrigue',
  '40834',
  2,
  6,
  30,
  'https://cf.geekdo-images.com/OGOmpi0GgwOwH2y28QgkuA__itemrep/img/BUiLGjf1tVpnUsg9WEyRq1HXAL4=/fit-in/246x300/filters:strip_icc()/pic460011.jpg',
  'In Dominion: Intrigue (as with Dominion), each player starts with an identical, very small deck of cards. In the center of the table is a selection of other cards the players can "buy" as they can afford them. Through their selection of cards to buy, and how they play their hands as they draw them, the players construct their deck on the fly, striving for the most efficient path to the precious victory points by game end.',
  'https://www.youtube.com/watch?v=z7BxZRAta4s',
  2009,
  7.7
),
(
  'BANG! The Bullet!',
  '30933',
  3,
  8,
  40,
  'https://cf.geekdo-images.com/omqNXDxHuFcizPoSm79ADA__itemrep/img/pnPIGNEbNbOuPISuW0e7ZIF8u1U=/fit-in/246x300/filters:strip_icc()/pic3835714.jpg',
  'BANG! The Bullet! is the deluxe version of BANG! and its expansions. Coming in a deluxe bullet-''box'' it contains: BANG! - Third Edition with reworked cards and rules, Dodge City - Second Edition with reworked cards and characters, High Noon - Second Edition, High Noon II (A Fistful Of Cards) - Second Edition, Two new exclusive High Noon cards - ''New Identity'' and ''Handcuffs'', Three new characters - Uncle Will, Johnny Kisch, and Claus ''The Saint'', Two blank cards, One silver sheriff badge',
  'https://www.youtube.com/watch?v=dcanu6cwfxc',
  2007,
  6.9
),
(
  'King of Tokyo',
  '70323',
  2,
  6,
  30,
  'https://cf.geekdo-images.com/m_RzXpHURC0_xLkvRSR_sw__itemrep/img/HVllMOifrnS8P1Ygzj7Teo_rwA4=/fit-in/246x300/filters:strip_icc()/pic3043734.jpg',
  'In King of Tokyo, you play mutant monsters, gigantic robots, and strange aliens—all of whom are destroying Tokyo and whacking each other in order to become the one and only King of Tokyo.',
  'https://www.youtube.com/watch?v=L_n_9vG9G-8',
  2011,
  7.1
),
(
  'Ascension Tactics',
  '304531',
  1,
  4,
  90,
  'https://cf.geekdo-images.com/891ZOmibeW3iRhEcdN0B5w__itemrep/img/cUo7y7NYepAeq_Yj6N7NcIwJJeY=/fit-in/246x300/filters:strip_icc()/pic7364675.png',
  'Ascension Tactics is a revolutionary new game, pioneering a brand-new genre by combining the best of tactical miniatures games with the fast-paced strategy of deck-building games. Ascension Tactics brings the most iconic characters from the award-winning deck-building game to life as highly-detailed paintable 3D miniatures.',
  'https://www.youtube.com/watch?v=1YUNcuybF50',
  2022,
  7.8
),
(
  'Sushi Go Party!',
  '192291',
  2,
  8,
  20,
  'https://cf.geekdo-images.com/jvYmb5EFnoXyiCB68gbybg__crop100/img/FyjLycE7enPtb16-PeZ_g3UNko4=/100x100/filters:strip_icc()/pic3031286.jpg',
  'Sushi Go Party! expands Sushi Go! with a party platter of mega maki, super sashimi, and endless edamame. You still earn points by picking winning sushi combos, but now you can customize each game by choosing à la carte from a menu of more than twenty delectable dishes. What''s more, up to eight players can join in on the sushi-feast. Let the good times roll!',
  'https://www.youtube.com/watch?v=FnnT4nlAPuM',
  2016,
  7.4
),
(
  'SCOUT',
  '291453',
  2,
  5,
  20,
  'https://cf.geekdo-images.com/cf0xxkevbwTGF3VUZymKjg__itemrep/img/SBOXfC-WOg_Iko_2lHw3VMymsow=/fit-in/246x300/filters:strip_icc()/pic6398727.png',
  'SCOUT is a ladder-climbing game in which cards have two potential values, players may not rearrange their hand of cards, and players may pass their turn to take a card from the current high set of cards into their hand.',
  'https://www.youtube.com/watch?v=Ymb0YsMzP2M',
  2019,
  7.8
),
(
  'Startups',
  '223770',
  3,
  7,
  20,
  'https://cf.geekdo-images.com/Y23LsS9HxPgO0XT5RvtwTA__itemrep/img/fFui2yl_IernQoLMvxT071hCvOI=/fit-in/246x300/filters:strip_icc()/pic3678411.png',
  'There are six companies that will change the world as we know it! You can be part of their success and be an investor. Try to become rich by making the right decisions!',
  'https://www.youtube.com/watch?v=k_j_X_09G6k',
  2017,
  7.2
),
(
  'ito',
  '327778',
  2,
  10,
  10,
  'https://cf.geekdo-images.com/CaGsrg17dVTXSP_7sjbm9w__itemrep/img/lYqGuoaZcOhet0Pl3VWWgVI63wA=/fit-in/246x300/filters:strip_icc()/pic8381709.png',
  'ito is a cooperative game where you and your friends will each get your own secret number you then have to try to put in order as a group based on the clues you give related to the chosen theme.',
  'https://www.youtube.com/watch?v=4Vo1kUkSjII',
  2019,
  7.3
),
(
  'For Sale',
  '172',
  3,
  6,
  30,
  'https://cf.geekdo-images.com/dJh9HkZC346NgPTAicJq_A__opengraph/img/xhKs15CeBIEiF3ACMGZ8IAGj0fs=/0x0:1680x882/fit-in/1200x630/filters:strip_icc()/pic1513085.jpg',
  'For Sale is a quick, fun game nominally about buying and selling real estate. During the game''s two distinct phases, players first bid for several buildings then, after all buildings have been bought, sell the buildings for the greatest profit possible.',
  'https://www.youtube.com/watch?v=TnIn9R0ygCo',
  1997,
  7.3
),
(
  'Salt and Pepper',
  '244798',
  2,
  5,
  10,
  'https://cf.geekdo-images.com/CwPyQs1CGwlRESa3H9cmEQ__square100/img/CTlIMNvmyreQVVj-3NYvrqWDXf8=/0x0:885x885/100x100/filters:strip_icc()/pic5968850.jpg',
  'Get ready to add some spice to your game night with Spicy Games! Each of the spice bottles hold all of the pieces you need to play a game. Each game takes 2 minutes to learn and 10 minutes to play. For ages 8 and up.',
  NULL,
  2016,
  4.5
);
