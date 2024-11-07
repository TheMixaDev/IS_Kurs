--- Ускорение поиска спринтов по году
CREATE INDEX sprint_start_date_year_idx ON Sprint (EXTRACT(YEAR FROM start_date));
--- Ускорение поиска спринтов по команде
CREATE INDEX sprint_team_id_idx ON Sprint (team_id);
--- Ускорение поиска задач по спринту
CREATE INDEX task_sprint_id_idx ON Task (sprint_id);