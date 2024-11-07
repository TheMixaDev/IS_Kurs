CREATE TABLE Role (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    responsibilities TEXT
);

CREATE TABLE Team (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    color VARCHAR(7),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Users (
    login VARCHAR(255) PRIMARY KEY,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    email VARCHAR(255),
    team_id INT REFERENCES Team(id) ON DELETE SET NULL,
    role_id INT REFERENCES Role(id) ON DELETE SET NULL
);

CREATE TABLE Status (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE Sprint (
    id SERIAL PRIMARY KEY,
    major_version VARCHAR(255) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    regression_start DATE NOT NULL,
    regression_end DATE NOT NULL,
    team_id INT NOT NULL REFERENCES Team(id) ON DELETE SET NULL
);

CREATE TABLE Task (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    story_points INT,
    implementer VARCHAR(255) REFERENCES Users(login) ON DELETE SET NULL,
    sprint_id INT REFERENCES Sprint(id) ON DELETE SET NULL,
    status_id INT REFERENCES Status(id) ON DELETE SET DEFAULT,
    priority_enum TEXT NOT NULL,
    created_by VARCHAR(255) REFERENCES Users(login) ON DELETE SET NULL
);
ALTER TABLE Task ALTER COLUMN status_id SET DEFAULT 1;

CREATE TABLE Idea (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    author_login VARCHAR(255) REFERENCES Users(login) ON DELETE SET NULL,
    status_enum_id TEXT NOT NULL,
    task_id INT REFERENCES Task(id) ON DELETE CASCADE
);

CREATE TABLE Releases (
    id SERIAL PRIMARY KEY,
    version VARCHAR(255) NOT NULL,
    release_date DATE NOT NULL,
    description TEXT,
    sprint_id INT REFERENCES Sprint(id) ON DELETE CASCADE
);

CREATE TABLE Risk (
    id SERIAL PRIMARY KEY,
    description TEXT NOT NULL,
    probability NUMERIC(2, 1) NOT NULL,
    estimated_loss DECIMAL NOT NULL
);

CREATE TABLE Tag (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE Task_Tag (
    task_id INT REFERENCES Task(id) ON DELETE CASCADE,
    tag_id INT REFERENCES Tag(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);

CREATE TABLE Idea_Risk (
    idea_id INT REFERENCES Idea(id) ON DELETE CASCADE,
    risk_id INT REFERENCES Risk(id) ON DELETE CASCADE,
    PRIMARY KEY (idea_id, risk_id)
);

CREATE TABLE Task_Risk (
    task_id INT REFERENCES Task(id) ON DELETE CASCADE,
    risk_id INT REFERENCES Risk(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, risk_id)
);

CREATE TABLE Role_Status (
    role_id INT REFERENCES Role(id) ON DELETE CASCADE,
    status_id INT REFERENCES Status(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, status_id)
);

ALTER TABLE Sprint
ADD CONSTRAINT sprint_dates_check CHECK (end_date >= start_date AND regression_end >= regression_start);

ALTER TABLE Task
ADD CONSTRAINT story_points_nonnegative CHECK (story_points >= 0);

ALTER TABLE Risk
ADD CONSTRAINT probability_valid_range CHECK (probability >= 0 AND probability <= 1);

ALTER TABLE Risk
ADD CONSTRAINT estimated_loss_nonnegative CHECK (estimated_loss >= 0);


CREATE OR REPLACE FUNCTION check_release_date()
RETURNS TRIGGER AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM Sprint
        WHERE id = NEW.sprint_id
        AND NEW.release_date BETWEEN start_date AND end_date
    ) THEN
        RAISE EXCEPTION 'Release date must be within the sprint dates.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_sprint_dates_for_releases()
RETURNS TRIGGER AS $$
DECLARE
    p_release_date DATE;
BEGIN
    FOR p_release_date IN
        SELECT release_date
        FROM Releases
        WHERE sprint_id = NEW.id
    LOOP
        IF p_release_date < NEW.start_date OR p_release_date > NEW.end_date THEN
            RAISE EXCEPTION 'Release date % is outside the new sprint dates.', p_release_date;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_release_date_on_insert
BEFORE INSERT ON Releases
FOR EACH ROW
EXECUTE FUNCTION check_release_date();

CREATE TRIGGER check_release_date_on_update
BEFORE UPDATE ON Releases
FOR EACH ROW
WHEN (NEW.release_date <> OLD.release_date OR NEW.sprint_id <> OLD.sprint_id)
EXECUTE FUNCTION check_release_date();

CREATE TRIGGER check_sprint_dates_on_update
BEFORE UPDATE ON Sprint
FOR EACH ROW
EXECUTE FUNCTION check_sprint_dates_for_releases();
