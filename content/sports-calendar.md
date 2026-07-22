# Sports calendar — drives the "Watching" line in the Now bar
#
# One event per bullet:  START → END | live label | short name (optional)
# Dates are YYYY-MM-DD and inclusive. While an event is on, its live label shows;
# when several overlap, the shortest ones lead and the Now bar rotates through the
# rest, so a marquee event beats a months-long regular season. When nothing is
# live, the next event counts down using its short name (or live label).
# `Fallback:` shows when nothing is live or upcoming.
#
# Editions run ~6 years out so the feed never runs dry. Dates are approximate —
# adjust each edition as real schedules firm up.

Fallback: the winter transfer window

# ── Regular seasons — background filler between marquee events ──────────────────
# Phillies (MLB, ~late Mar → late Sep)
- 2026-03-26 → 2026-09-27 | the Phillies | Phillies Opening Day
- 2027-03-26 → 2027-09-27 | the Phillies | Phillies Opening Day
- 2028-03-26 → 2028-09-27 | the Phillies | Phillies Opening Day
- 2029-03-26 → 2029-09-27 | the Phillies | Phillies Opening Day
- 2030-03-26 → 2030-09-27 | the Phillies | Phillies Opening Day
- 2031-03-26 → 2031-09-27 | the Phillies | Phillies Opening Day
- 2032-03-26 → 2032-09-27 | the Phillies | Phillies Opening Day

# Nuggets (NBA, ~late Oct → mid Apr)
- 2026-10-21 → 2027-04-12 | the Nuggets | Nuggets basketball
- 2027-10-21 → 2028-04-12 | the Nuggets | Nuggets basketball
- 2028-10-21 → 2029-04-12 | the Nuggets | Nuggets basketball
- 2029-10-21 → 2030-04-12 | the Nuggets | Nuggets basketball
- 2030-10-21 → 2031-04-12 | the Nuggets | Nuggets basketball
- 2031-10-21 → 2032-04-12 | the Nuggets | Nuggets basketball
- 2032-10-21 → 2033-04-12 | the Nuggets | Nuggets basketball

# ── Tennis majors ───────────────────────────────────────────────────────────────
# Wimbledon (~late Jun → mid Jul)
- 2026-06-29 → 2026-07-12 | Wimbledon | Wimbledon
- 2027-06-28 → 2027-07-11 | Wimbledon | Wimbledon
- 2028-06-26 → 2028-07-09 | Wimbledon | Wimbledon
- 2029-06-25 → 2029-07-08 | Wimbledon | Wimbledon
- 2030-06-24 → 2030-07-07 | Wimbledon | Wimbledon
- 2031-06-30 → 2031-07-13 | Wimbledon | Wimbledon
- 2032-06-28 → 2032-07-11 | Wimbledon | Wimbledon

# US Open — tennis (~late Aug → mid Sep)
- 2026-08-31 → 2026-09-13 | the US Open | the US Open
- 2027-08-30 → 2027-09-12 | the US Open | the US Open
- 2028-08-28 → 2028-09-10 | the US Open | the US Open
- 2029-08-27 → 2029-09-09 | the US Open | the US Open
- 2030-08-26 → 2030-09-08 | the US Open | the US Open
- 2031-09-01 → 2031-09-14 | the US Open | the US Open
- 2032-08-30 → 2032-09-12 | the US Open | the US Open

# ── Football (NFL) & basketball (NBA) season markers ────────────────────────────
# NFL kickoff week (~early–mid Sep)
- 2026-09-10 → 2026-09-14 | the NFL kickoff | the NFL opener
- 2027-09-09 → 2027-09-13 | the NFL kickoff | the NFL opener
- 2028-09-07 → 2028-09-11 | the NFL kickoff | the NFL opener
- 2029-09-06 → 2029-09-10 | the NFL kickoff | the NFL opener
- 2030-09-05 → 2030-09-09 | the NFL kickoff | the NFL opener
- 2031-09-04 → 2031-09-08 | the NFL kickoff | the NFL opener
- 2032-09-09 → 2032-09-13 | the NFL kickoff | the NFL opener

# NBA opening week (~late Oct)
- 2026-10-20 → 2026-10-27 | NBA opening week | NBA tip-off
- 2027-10-19 → 2027-10-26 | NBA opening week | NBA tip-off
- 2028-10-24 → 2028-10-31 | NBA opening week | NBA tip-off
- 2029-10-23 → 2029-10-30 | NBA opening week | NBA tip-off
- 2030-10-22 → 2030-10-29 | NBA opening week | NBA tip-off
- 2031-10-21 → 2031-10-28 | NBA opening week | NBA tip-off
- 2032-10-19 → 2032-10-26 | NBA opening week | NBA tip-off

# ── Spring playoff season ───────────────────────────────────────────────────────
# Champions League knockouts (~mid Feb → late May)
- 2027-02-17 → 2027-05-29 | the Champions League knockouts | the Champions League
- 2028-02-16 → 2028-05-27 | the Champions League knockouts | the Champions League
- 2029-02-14 → 2029-05-26 | the Champions League knockouts | the Champions League
- 2030-02-19 → 2030-05-25 | the Champions League knockouts | the Champions League
- 2031-02-18 → 2031-05-31 | the Champions League knockouts | the Champions League
- 2032-02-17 → 2032-05-29 | the Champions League knockouts | the Champions League

# NBA playoffs (~mid Apr → late Jun)
- 2027-04-18 → 2027-06-21 | the NBA playoffs | the NBA playoffs
- 2028-04-15 → 2028-06-19 | the NBA playoffs | the NBA playoffs
- 2029-04-21 → 2029-06-18 | the NBA playoffs | the NBA playoffs
- 2030-04-20 → 2030-06-23 | the NBA playoffs | the NBA playoffs
- 2031-04-19 → 2031-06-22 | the NBA playoffs | the NBA playoffs
- 2032-04-17 → 2032-06-20 | the NBA playoffs | the NBA playoffs

# Stanley Cup playoffs (~mid Apr → late Jun)
- 2027-04-20 → 2027-06-20 | the Stanley Cup playoffs | the Stanley Cup playoffs
- 2028-04-18 → 2028-06-18 | the Stanley Cup playoffs | the Stanley Cup playoffs
- 2029-04-17 → 2029-06-17 | the Stanley Cup playoffs | the Stanley Cup playoffs
- 2030-04-16 → 2030-06-16 | the Stanley Cup playoffs | the Stanley Cup playoffs
- 2031-04-15 → 2031-06-22 | the Stanley Cup playoffs | the Stanley Cup playoffs
- 2032-04-20 → 2032-06-20 | the Stanley Cup playoffs | the Stanley Cup playoffs

# ── CONCACAF ────────────────────────────────────────────────────────────────────
# Nations League Finals (~mid–late Mar, annual)
- 2027-03-18 → 2027-03-21 | the CONCACAF Nations League finals | the Nations League finals
- 2028-03-23 → 2028-03-26 | the CONCACAF Nations League finals | the Nations League finals
- 2029-03-22 → 2029-03-25 | the CONCACAF Nations League finals | the Nations League finals
- 2030-03-21 → 2030-03-24 | the CONCACAF Nations League finals | the Nations League finals
- 2031-03-20 → 2031-03-23 | the CONCACAF Nations League finals | the Nations League finals
- 2032-03-18 → 2032-03-21 | the CONCACAF Nations League finals | the Nations League finals

# Gold Cup (~mid Jun → early Jul, biennial odd years)
- 2027-06-12 → 2027-07-04 | the CONCACAF Gold Cup | the Gold Cup
- 2029-06-09 → 2029-07-01 | the CONCACAF Gold Cup | the Gold Cup
- 2031-06-14 → 2031-07-06 | the CONCACAF Gold Cup | the Gold Cup

# ── FIFA World Cups ─────────────────────────────────────────────────────────────
# Men's (every 4 years)
- 2026-06-11 → 2026-07-19 | the FIFA World Cup | the World Cup
- 2030-06-13 → 2030-07-21 | the FIFA World Cup | the World Cup

# Women's (every 4 years)
- 2027-06-24 → 2027-07-25 | the Women's World Cup | the Women's World Cup
- 2031-06-24 → 2031-07-25 | the Women's World Cup | the Women's World Cup

# ── Olympic Games ───────────────────────────────────────────────────────────────
# Winter (every 4 years)
- 2030-02-01 → 2030-02-17 | the Winter Olympics | the Winter Games

# Summer (every 4 years)
- 2028-07-14 → 2028-07-30 | the Summer Olympics | the Summer Games
- 2032-07-23 → 2032-08-08 | the Summer Olympics | the Summer Games
