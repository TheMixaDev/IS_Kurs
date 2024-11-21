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
    name VARCHAR(2047) NOT NULL,
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
    description VARCHAR(2047) NOT NULL,
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
    probability NUMERIC(1, 2) NOT NULL,
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

-- Получение спринтов по году и команде
CREATE OR REPLACE FUNCTION get_sprints_by_year_and_team(
    target_year INT,
    input_team_name VARCHAR(255) DEFAULT NULL
)
RETURNS TABLE (
    sprintId INT,
    majorVersion VARCHAR(255),
    startDate DATE,
    endDate DATE,
    teamName VARCHAR(255),
    teamColor VARCHAR(7)
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        s.id,
        s.major_version,
        s.start_date,
        s.end_date,
        t.name,
        t.color
    FROM
        Sprint s
    JOIN
        Team t ON s.team_id = t.id
    WHERE
        EXTRACT(YEAR FROM s.start_date) = target_year
        AND (input_team_name IS NULL OR t.name = input_team_name);
END;
$$;

--- Функция для получения топ-10 рисков по задачам
CREATE OR REPLACE FUNCTION get_top_10_task_risks()
RETURNS TABLE (
    riskId INT,
    description TEXT,
    totalEstimatedLoss DECIMAL
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.id,
        r.description,
        SUM(r.estimated_loss) AS total_estimated_loss
    FROM
        Risk r
    JOIN
        Task_Risk tr ON r.id = tr.risk_id
    GROUP BY
        r.id, r.description
    ORDER BY
        total_estimated_loss DESC
    LIMIT 10;
END;
$$;

--- Рассчет текущей загрузки команды на спринт
CREATE OR REPLACE FUNCTION calculate_team_load(input_team_id INT, input_sprint_id INT)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  team_capacity NUMERIC;
  total_story_points NUMERIC;
BEGIN
  SELECT COUNT(*) 
  INTO team_capacity 
  FROM Users 
  WHERE team_id = input_team_id;

  SELECT SUM(story_points)
  INTO total_story_points
  FROM Task
  WHERE sprint_id = input_sprint_id;

  RETURN (total_story_points / team_capacity) * 100;
END;
$$;

--- Получить количество сторипоинтов пользователей за спринт
CREATE OR REPLACE FUNCTION get_story_points_per_user_in_sprint(sprint_id INT)
RETURNS TABLE (
    userLogin VARCHAR(255),
    totalStoryPoints BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    u.login, 
    COALESCE(SUM(t.story_points), 0) as total_story_points
  FROM Users u
  LEFT JOIN Task t ON u.login = t.implementer AND t.sprint_id = get_story_points_per_user_in_sprint.sprint_id
  WHERE u.team_id = (SELECT team_id FROM Sprint WHERE id = get_story_points_per_user_in_sprint.sprint_id)
  GROUP BY u.login;
END;
$$;

--- Ускорение поиска спринтов по году
CREATE INDEX sprint_start_date_year_idx ON Sprint (EXTRACT(YEAR FROM start_date));
--- Ускорение поиска спринтов по команде
CREATE INDEX sprint_team_id_idx ON Sprint (team_id);
--- Ускорение поиска задач по спринту
CREATE INDEX task_sprint_id_idx ON Task (sprint_id);

--- Обработать идею
CREATE OR REPLACE PROCEDURE process_idea(
    p_idea_id INT,
    new_status VARCHAR(255)
)
LANGUAGE plpgsql
AS $$
DECLARE
  idea_description TEXT;
  idea_author VARCHAR(255);
  new_task_id INT;
  idea_status TEXT;
BEGIN
  IF new_status = 'APPROVED' THEN
    SELECT description, author_login, status_enum_id INTO idea_description, idea_author, idea_status 
    FROM Idea 
    WHERE id = p_idea_id;

    IF idea_status != 'APPROVED' THEN
      INSERT INTO Task(name, implementer, status_id, priority_enum, created_by)
      VALUES (idea_description, idea_author, 1, 'MEDIUM', idea_author)
      RETURNING id INTO new_task_id;

      UPDATE Idea SET task_id = new_task_id WHERE id = p_idea_id;

      INSERT INTO Task_Risk (task_id, risk_id)
      SELECT new_task_id, risk_id
      FROM Idea_Risk
      WHERE idea_id = p_idea_id;
    END IF;
  END IF;
  UPDATE Idea SET status_enum_id = new_status WHERE id = p_idea_id;
END;
$$;

-- Role --
INSERT INTO Role (id, name, responsibilities) VALUES
(1, 'Менеджер проекта', 'Управление проектом, коммуникация с заказчиком'),
(2, 'Тестировщик', 'Тестирование, написание тест-кейсов'),
(3, 'Аналитик', 'Сбор требований, написание документации'),
(4, 'Разработчик', 'Написание кода, тестирование');
SELECT setval('role_id_seq', 4, true);

-- Team --
INSERT INTO Team (id, name, color, description, is_active) VALUES
(1, 'Main develop', '#FF5733', 'Команда разработки функционала', true),
(2, 'Integrations', '#3498DB', 'Команда интеграции сторонних сервисов', true),
(3, 'API', '#2ECC71', 'Команда разработки API', true);
SELECT setval('team_id_seq', 3, true);

-- Users --
INSERT INTO Users (login, password, first_name, last_name, email, team_id, role_id) VALUES
('ernst_ignatukev', 'AYd5n0D3wTiBrPQ', 'Богдан', 'Русаков', 'Samson_Efremova50@mail.ru', 3, 1),
('glafira9', 'u_cHebONpbQEy7h', 'Ипполит', 'Богданова', 'Emelukyan_Fomicheva73@mail.ru', 2, 2),
('emiliya91', 'a5LnzSeIttVqS0o', 'Николай', 'Соколова', 'Selivan_Burova@yahoo.com', 3, 2),
('frol99', 'Lhy3_T8n9b1e2Ej', 'Борислав', 'Никонов', 'Andron14@yahoo.com', 3, 2),
('milan.dukyachkov', 'W1D_papCck4mJLy', 'Бажен', 'Дементьев', 'Kirill_Sysoeva@gmail.com', 1, 2),
('demukyan66', 'ipv7n483fNUolU_', 'Софон', 'Сергеев', 'Erofei.Volkova43@yandex.ru', 1, 2),
('prokofii.polyakov90', 'x7RM0OpdDh1wZaq', 'Петр', 'Фадеева', 'Gurii68@yandex.ru', 3, 2),
('arkhip.zhukov59', 'QVMwALYerkb_PT8', 'Елена', 'Волкова', 'Glafira_Komissarov20@yandex.ru', 2, 4),
('matvei72', 't5kYraxCj8I95VH', 'Радован', 'Кириллова', 'Sinklitikiya.Petrov42@yandex.ru', 3, 3),
('averkii29', 'YOlacp9ASQAss10', 'Алевтина', 'Вишняков', 'Sidor.Dukyachkova@ya.ru', 3, 3),
('vasilii77', 'W00zQVaHaGBDaJ_', 'Октябрина', 'Жданов', 'Sigizmund_Titova@yandex.ru', 2, 2),
('viktorin.zhukova', 'hkaq6cnTgwHqpIn', 'Родион', 'Шубин', 'Sofron_Kosheleva@ya.ru', 3, 3),
('anisim53', 'LkDLLhMLPy5eB4k', 'Потап', 'Щукин', 'Leonid.Rozhkova@gmail.com', 2, 3),
('vseslav.tretukyakov41', 'XlfCSXK6ngWDW8C', 'Боян', 'Фролов', 'Filaret_Karpov3@mail.ru', 2, 3),
('modest_kiselev93', 'dSyuXRJnsuW34Y5', 'Агап', 'Герасимов', 'Evgraf0@ya.ru', 1, 2),
('ernest60', 'wz7vtBgXddin4Dn', 'Николай', 'Осипова', 'Vasilii_Guseva22@ya.ru', 1, 4),
('karl72', '99Ot8inoCvZwMxw', 'Лариса', 'Емельянова', 'Emiluk36@ya.ru', 1, 2),
('akim.fokina52', 'uR11H6Z1Z2CpaZE', 'Федор', 'Медведева', 'Mitofan74@yandex.ru', 1, 3),
('vysheslav_evdokimov', 'USxhWmTQx3QRSMK', 'Вадим', 'Лихачев', 'Viktoriya_Sukhanova81@mail.ru', 1, 4),
('leon_karpov', 'ImLzrtHpXHGrTVZ', 'Ирина', 'Андреев', 'Sinklitikiya.Orekhova20@gmail.com', 1, 3),
('ferapont_galkina36', 'kLR1N5tVCSR8YDi', 'Анисим', 'Савина', 'Vitalii1@yandex.ru', 2, 2),
('panfil_fadeeva', '2Z4CeusQYU4cimC', 'Павел', 'Бурова', 'Kapiton_Nikitin22@mail.ru', 3, 4),
('antonina_belozerova', '39c5f8JDZeWC_zY', 'Зиновий', 'Котов', 'Ivan.Ilukin@yahoo.com', 3, 2),
('nikanor66', 'hd2RpVCkJi4t4iE', 'Нина', 'Комиссаров', 'Leon.Tarasov@yandex.ru', 1, 4),
('lyubovuk46', 'tQuyxyGBuXjW22d', 'Спартак', 'Цветкова', 'Rostislav.Pakhomova61@hotmail.com', 3, 2),
('cheslav90', 'Kh1pVTdOlTN4mi9', 'Лукьян', 'Наумова', 'Yulii90@ya.ru', 2, 4),
('nestor.belozerova', 'MRQLqFSYxFRRco3', 'Виктория', 'Соловьев', 'Ilarion.Sergeev@ya.ru', 1, 4),
('ostap60', 'uRwv2jKP6IYBXio', 'Прокл', 'Крюков', 'Gedeon.Selezneva@ya.ru', 3, 4),
('solomon_zykova', 'wQMiNRTKN6MEJgR', 'Пимен', 'Власова', 'Longin_Efremova11@ya.ru', 3, 2),
('klavdii_kornilov80', '8uLHJpmn3fbqHC8', 'Вадим', 'Игнатьева', 'Evlampii82@hotmail.com', 1, 4),
('ryurik_filippova40', 'rfg4RqtK4RP0Hti', 'Платон', 'Селиверстов', 'Oktyabrina.Sukhanova51@mail.ru', 2, 3),
('dobroslav.aksenova31', 'nLleLRbJdn6aVjh', 'Олимпиада', 'Власова', 'Efrem88@ya.ru', 3, 2),
('vseslav23', 'WtJILRrFYVx4nGO', 'Парамон', 'Куликова', 'Ipat.Makarov44@gmail.com', 3, 4),
('iya_scherbakova', '_77B5pPD73H6HsJ', 'Леонид', 'Кириллов', 'Ilukya81@hotmail.com', 2, 4),
('nadezhda.merkusheva62', '9dYLkyF8J27Urqn', 'Артем', 'Лобанова', 'Oksana_Anisimova47@ya.ru', 1, 2),
('gedeon_aleksandrov57', 'IZIATnlUlO6e3DD', 'Виталий', 'Трофимов', 'Sofiya74@yandex.ru', 2, 2),
('averkii.ryabov', 'nI741ZbHdox5hDz', 'Касьян', 'Панов', 'Demid_Sukhanov22@yandex.ru', 2, 4),
('prov_alekseev22', 'euzPzy5wXxOrZiR', 'Прасковья', 'Третьякова', 'Darukya_Savina@yahoo.com', 3, 3),
('panteleimon.krylov', '3EAPbtRQk8vAUGe', 'Ангелина', 'Мартынов', 'Serafim38@yahoo.com', 3, 2),
('akulina99', 'NoPzRRomcb7FwvQ', 'Никифор', 'Тимофеев', 'Pakhom25@yahoo.com', 3, 3),
('vasilii_kiseleva21', 'cqiG7FVuelwkFXL', 'Тимофей', 'Рогова', 'Evstignei.Seliverstova@gmail.com', 3, 2),
('porfirii92', 'uBUmD2VFtpcvniS', 'Савва', 'Комиссарова', 'Maksim33@yahoo.com', 3, 2),
('demukyan60', 'ErDWhqWjOYAmLQr', 'Милан', 'Гусев', 'Sidor.Sharov40@gmail.com', 1, 3),
('kapiton_dorofeeva71', 'IaUEBYJ6pU5M7Cd', 'Валентина', 'Игнатова', 'Fedosii91@ya.ru', 3, 4),
('ermil.kalinin', 'r3uLvdhVQcCDmMJ', 'Лучезар', 'Комиссаров', 'Milii86@yandex.ru', 3, 4),
('kirill_molchanova48', 'w8aPnZirxGiQbQJ', 'Леонид', 'Одинцов', 'Demid25@gmail.com', 3, 4),
('sigizmund12', 'ApA2sdrAp8U9P0o', 'Никита', 'Пономарева', 'Kharlampii.Zhdanov68@mail.ru', 3, 3),
('avksentii93', 'vWLep9SGkNR4Z99', 'Гостомысл', 'Орлов', 'Mefodii54@mail.ru', 1, 3),
('raisa.ivanova', 'r_kwkowyMIM1xcO', 'Доброслав', 'Козлова', 'Anatolii.Rusakov66@ya.ru', 1, 2),
('nina_sysoeva91', 'zBsJrCM_k_4aNed', 'Аполлинарий', 'Медведев', 'Kallistrat75@hotmail.com', 1, 4);

-- Status --
INSERT INTO Status (id, name, description) VALUES
(1, 'На утверждении', 'Задача ожидает утверждения'),
(2, 'Открыт', 'Задача открыта и готова к разработке'),
(3, 'Разработка', 'Задача находится в разработке'),
(4, 'Тестирование', 'Задача находится на тестировании'),
(5, 'Закрыт', 'Задача завершена');
SELECT setval('status_id_seq', 5, true);

-- Sprint --
INSERT INTO Sprint (id, major_version, start_date, end_date, regression_start, regression_end, team_id) VALUES
(1, 'v1.1', '2023-01-08', '2023-01-22', '2023-01-20', '2023-01-22', 1),
(2, 'v1.2', '2023-01-23', '2023-02-06', '2023-02-04', '2023-02-06', 2),
(3, 'v1.3', '2023-02-07', '2023-02-21', '2023-02-19', '2023-02-21', 3),
(4, 'v2.0', '2023-02-22', '2023-03-08', '2023-03-06', '2023-03-08', 1),
(5, 'v2.1', '2023-03-09', '2023-03-23', '2023-03-21', '2023-03-23', 2),
(6, 'v2.2', '2023-03-24', '2023-04-07', '2023-04-05', '2023-04-07', 3),
(7, 'v2.3', '2023-04-08', '2023-04-22', '2023-04-20', '2023-04-22', 1),
(8, 'v3.0', '2023-04-23', '2023-05-07', '2023-05-05', '2023-05-07', 2),
(9, 'v3.1', '2023-05-08', '2023-05-22', '2023-05-20', '2023-05-22', 3),
(10, 'v3.2', '2023-05-23', '2023-06-06', '2023-06-04', '2023-06-06', 1),
(11, 'v3.3', '2023-06-07', '2023-06-21', '2023-06-19', '2023-06-21', 2),
(12, 'v4.0', '2023-06-22', '2023-07-06', '2023-07-04', '2023-07-06', 3);
SELECT setval('sprint_id_seq', 12, true);


-- Releases --
INSERT INTO Releases (version, release_date, description, sprint_id) VALUES
('v1.0.0', '2023-01-22', 'Релиз версии v1.0.0', 1),
('v1.1.0', '2023-02-06', 'Релиз версии v1.1.0', 2),
('v1.2.0', '2023-02-21', 'Релиз версии v1.2.0', 3),
('v1.3.0', '2023-03-08', 'Релиз версии v1.3.0', 4),
('v2.0.0', '2023-03-23', 'Релиз версии v2.0.0', 5),
('v2.1.0', '2023-04-07', 'Релиз версии v2.1.0', 6),
('v2.2.0', '2023-04-22', 'Релиз версии v2.2.0', 7),
('v2.3.0', '2023-05-07', 'Релиз версии v2.3.0', 8),
('v3.0.0', '2023-05-22', 'Релиз версии v3.0.0', 9),
('v3.1.0', '2023-06-06', 'Релиз версии v3.1.0', 10),
('v3.2.0', '2023-06-21', 'Релиз версии v3.2.0', 11),
('v3.3.0', '2023-07-06', 'Релиз версии v3.3.0', 12);

-- Task --
INSERT INTO Task (id, name, story_points, implementer, sprint_id, status_id, priority_enum, created_by) VALUES
(1, 'Новая рост анализа демократической всего обуславливает.', 5, 'raisa.ivanova', 2, 3, 'MEDIUM', 'viktorin.zhukova'),
(2, 'Профессионального же повседневная значение этих количественный обеспечивает идейные равным особенности.', 20, 'porfirii92', 11, 1, 'MEDIUM', 'matvei72'),
(3, 'Таким массового оценить.', 8, 'ermil.kalinin', 1, 1, 'CRITICAL', 'milan.dukyachkov'),
(4, 'Кругу задача сомнений важную оценить нас степени нас.', 2, 'vasilii_kiseleva21', 6, 3, 'MEDIUM', 'cheslav90'),
(5, 'Для принципов кругу на порядка прогрессивного экономической поставленных гражданского.', 2, 'glafira9', 2, 1, 'MEDIUM', 'emiliya91'),
(6, 'Кадров социально-экономическое путь потребностям.', 5, 'iya_scherbakova', 6, 4, 'CRITICAL', 'ostap60'),
(7, 'Участия зависит обучения развития актуальность богатый.', 1, 'emiliya91', 6, 1, 'CRITICAL', 'anisim53'),
(8, 'Подготовке реализация за формировании целесообразности финансовых всего требует формировании анализа.', 2, 'dobroslav.aksenova31', 6, 1, 'MEDIUM', 'porfirii92'),
(9, 'Способствует качества высшего повышение.', 2, 'ermil.kalinin', 5, 4, 'LOW', 'vasilii77'),
(10, 'Всего и место отношении разработке собой системы требует внедрения.', 8, 'anisim53', 8, 5, 'MEDIUM', 'iya_scherbakova'),
(11, 'Также современного форм задания процесс ресурсосберегающих определения эксперимент позволяет.', 20, 'averkii.ryabov', 10, 3, 'MEDIUM', 'nadezhda.merkusheva62'),
(12, 'Формированию информационно-пропогандистское способствует проблем модель путь активом.', 8, 'ryurik_filippova40', 7, 2, 'CRITICAL', 'vasilii_kiseleva21'),
(13, 'Ресурсосберегающих управление принимаемых эксперимент выбранный эксперимент показывает.', 3, 'vasilii77', 9, 2, 'LOW', 'cheslav90'),
(14, 'Активности нас участниками повседневной качества последовательного путь а.', 20, 'ferapont_galkina36', 7, 5, 'CRITICAL', 'akulina99'),
(15, 'Качества современного базы формирования для реализация количественный идейные создание.', 5, 'solomon_zykova', 3, 2, 'CRITICAL', 'lyubovuk46'),
(16, 'Управление новых задача влечёт новая проверки представляет национальный.', 13, 'frol99', 11, 2, 'CRITICAL', 'vasilii77'),
(17, 'Занимаемых проект высокотехнологичная постоянное задач.', 20, 'nadezhda.merkusheva62', 8, 3, 'CRITICAL', 'ernst_ignatukev'),
(18, 'Же проект не управление дальнейших стороны повышению принципов общественной начало.', 8, 'avksentii93', 8, 3, 'LOW', 'demukyan66'),
(19, 'Обеспечивает в прогресса общества обществом дальнейших сфера специалистов существующий.', 1, 'leon_karpov', 8, 3, 'CRITICAL', 'ermil.kalinin'),
(20, 'Условий нашей задания занимаемых обществом базы однако собой разнообразный.', 2, 'demukyan60', 6, 4, 'LOW', 'demukyan60'),
(21, 'Повышение от от.', 2, 'klavdii_kornilov80', 4, 5, 'LOW', 'nina_sysoeva91'),
(22, 'Уточнения формированию внедрения.', 8, 'anisim53', 11, 3, 'LOW', 'nadezhda.merkusheva62'),
(23, 'Условий систему рост.', 20, 'averkii29', 6, 1, 'LOW', 'panfil_fadeeva'),
(24, 'Организационной место организации повседневной организационной специалистов технологий в начало сложившаяся.', 5, 'vasilii_kiseleva21', 7, 1, 'LOW', 'iya_scherbakova'),
(25, 'Организации качественно разнообразный представляет концепция а практика поставленных также.', 20, 'anisim53', 2, 4, 'LOW', 'raisa.ivanova'),
(26, 'Системы постоянное специалистов представляет реализация повышению рост уровня широкому кадров.', 5, 'akim.fokina52', 5, 3, 'MEDIUM', 'demukyan66'),
(27, 'Этих место правительством национальный шагов административных в сознания информационно-пропогандистское.', 13, 'gedeon_aleksandrov57', 5, 3, 'CRITICAL', 'frol99'),     
(28, 'Условий широким в прогрессивного значительной.', 2, 'averkii.ryabov', 1, 1, 'CRITICAL', 'solomon_zykova'),
(29, 'Занимаемых порядка для важные.', 1, 'avksentii93', 12, 5, 'CRITICAL', 'akulina99'),
(30, 'Социально-ориентированный системы информационно-пропогандистское постоянное разработке специалистов создание.', 5, 'ermil.kalinin', 9, 1, 'LOW', 'prov_alekseev22'),
(31, 'Задача не создание повышение собой стороны модели вызывает.', 8, 'prokofii.polyakov90', 4, 4, 'MEDIUM', 'kirill_molchanova48'),
(32, 'Собой высшего реализация деятельности прогресса проверки задач условий.', 8, 'klavdii_kornilov80', 11, 5, 'LOW', 'nestor.belozerova'),
(33, 'Широким информационно-пропогандистское активизации стороны формировании технологий внедрения значительной модель.', 5, 'modest_kiselev93', 3, 1, 'MEDIUM', 'glafira9'),   
(34, 'Качества широким для поставленных постоянное структуры отношении что.', 3, 'panteleimon.krylov', 7, 4, 'LOW', 'solomon_zykova'),
(35, 'Задания консультация богатый особенности активом начало постоянный кадров.', 3, 'ernst_ignatukev', 11, 1, 'LOW', 'porfirii92'),
(36, 'Модернизации за задача базы модернизации задача за материально-технической за модернизации.', 8, 'cheslav90', 11, 1, 'MEDIUM', 'antonina_belozerova'),
(37, 'Участия качественно занимаемых формирования концепция.', 2, 'matvei72', 2, 4, 'CRITICAL', 'ernst_ignatukev'),
(38, 'Место идейные широким активом формированию рост новых соответствующей идейные.', 3, 'cheslav90', 5, 3, 'MEDIUM', 'prov_alekseev22'),
(39, 'Административных технологий массового проект.', 5, 'lyubovuk46', 6, 2, 'LOW', 'frol99'),
(40, 'И профессионального базы структуры настолько понимание этих технологий по.', 13, 'ernst_ignatukev', 9, 3, 'MEDIUM', 'panfil_fadeeva'),
(41, 'Организации различных обеспечение количественный.', 5, 'demukyan66', 8, 2, 'MEDIUM', 'modest_kiselev93'),
(42, 'Уточнения уточнения поэтапного стороны потребностям сложившаяся.', 2, 'nikanor66', 3, 5, 'MEDIUM', 'akulina99'),
(43, 'Следует сущности задач роль участия следует задача.', 13, 'akulina99', 8, 5, 'MEDIUM', 'viktorin.zhukova'),
(44, 'Позиции предпосылки путь напрямую нами системы анализа повышению.', 2, 'arkhip.zhukov59', 4, 2, 'CRITICAL', 'akim.fokina52'),
(45, 'Создаёт модели активности стороны создаёт следует структура.', 13, 'ryurik_filippova40', 9, 5, 'CRITICAL', 'gedeon_aleksandrov57'),
(46, 'Существующий всего систему принципов.', 2, 'klavdii_kornilov80', 10, 4, 'CRITICAL', 'vasilii_kiseleva21'),
(47, 'Форм эксперимент позволяет деятельности всего национальный социально-экономическое на таким правительством.', 20, 'averkii29', 1, 2, 'LOW', 'vseslav.tretukyakov41'),
(48, 'Уточнения нашей следует курс проект играет дальнейшее существующий.', 8, 'dobroslav.aksenova31', 7, 3, 'MEDIUM', 'antonina_belozerova'),
(49, 'Правительством представляет предпосылки курс эксперимент отношении этих качественно повседневной занимаемых.', 20, 'akulina99', 8, 4, 'LOW', 'nadezhda.merkusheva62'),
(50, 'Очевидна в уровня.', 5, 'frol99', 11, 3, 'LOW', 'ferapont_galkina36'),
(51, 'Участниками сущности управление кругу а рамки богатый социально-экономическое общества.', 13, 'ostap60', 4, 4, 'CRITICAL', 'gedeon_aleksandrov57'),
(52, 'Значение повышение следует обществом широкому специалистов.', 1, 'vseslav.tretukyakov41', 9, 4, 'MEDIUM', 'iya_scherbakova'),
(53, 'Позиции количественный качества изменений порядка нас повседневной изменений.', 1, 'nina_sysoeva91', 3, 5, 'LOW', 'emiliya91'),
(54, 'Повышение отметить деятельности реализация современного.', 2, 'nikanor66', 11, 2, 'LOW', 'solomon_zykova'),
(55, 'Административных особенности шагов позволяет равным.', 5, 'glafira9', 1, 4, 'CRITICAL', 'ferapont_galkina36'),
(56, 'Качества сущности прогресса отношении анализа общественной порядка.', 3, 'modest_kiselev93', 12, 1, 'MEDIUM', 'vasilii77'),
(57, 'Сфера активом образом повышение рамки различных изменений изменений.', 3, 'kapiton_dorofeeva71', 12, 5, 'CRITICAL', 'vasilii_kiseleva21'),
(58, 'Рамки собой понимание всего плановых повышение показывает влечёт и.', 13, 'panteleimon.krylov', 11, 5, 'LOW', 'ermil.kalinin'),
(59, 'Принимаемых формирования намеченных место развития активности материально-технической.', 20, 'nina_sysoeva91', 4, 5, 'MEDIUM', 'vasilii77'),
(60, 'Стороны насущным также сознания создаёт укрепления.', 5, 'nestor.belozerova', 3, 3, 'CRITICAL', 'ferapont_galkina36'),
(61, 'Модель соображения принимаемых базы.', 8, 'milan.dukyachkov', 10, 4, 'CRITICAL', 'milan.dukyachkov'),
(62, 'Поэтапного качественно прогресса место высокотехнологичная существующий.', 20, 'nestor.belozerova', 8, 1, 'MEDIUM', 'modest_kiselev93'),
(63, 'Общества системы повседневной способствует форм базы.', 13, 'milan.dukyachkov', 3, 2, 'CRITICAL', 'porfirii92'),
(64, 'Соображения идейные забывать дальнейшее также создаёт модель активизации опыт шагов.', 3, 'nestor.belozerova', 2, 3, 'LOW', 'arkhip.zhukov59'),
(65, 'Же занимаемых степени значение повседневной повседневной оценить социально-ориентированный.', 8, 'dobroslav.aksenova31', 10, 5, 'MEDIUM', 'gedeon_aleksandrov57'),
(66, 'Формирования значимость экономической системы.', 20, 'ermil.kalinin', 8, 3, 'LOW', 'karl72'),
(67, 'Обеспечивает рост проверки насущным важные.', 20, 'antonina_belozerova', 1, 1, 'LOW', 'averkii.ryabov'),
(68, 'А административных процесс значительной консультация организации сознания нами намеченных широкому.', 1, 'vseslav23', 6, 3, 'MEDIUM', 'akim.fokina52'),
(69, 'Этих следует с предложений.', 13, 'ryurik_filippova40', 9, 5, 'MEDIUM', 'karl72'),
(70, 'Вызывает повышение создаёт плановых.', 13, 'vasilii77', 3, 5, 'LOW', 'akulina99'),
(71, 'Интересный существующий другой укрепления влечёт определения прогрессивного.', 2, 'vasilii77', 11, 4, 'CRITICAL', 'antonina_belozerova'),
(72, 'Позволяет общества выполнять массового соображения повседневной.', 20, 'modest_kiselev93', 2, 3, 'CRITICAL', 'prov_alekseev22'),
(73, 'Базы кадровой обществом роль модели.', 20, 'nikanor66', 12, 5, 'LOW', 'akim.fokina52'),
(74, 'Порядка от играет очевидна важную обуславливает а постоянное также таким.', 2, 'lyubovuk46', 9, 1, 'MEDIUM', 'vasilii_kiseleva21'),
(75, 'В кадров широкому значимость высшего существующий консультация.', 5, 'akulina99', 7, 1, 'MEDIUM', 'vseslav.tretukyakov41'),
(76, 'Этих прогрессивного управление понимание повышению кадров поэтапного проект.', 2, 'nestor.belozerova', 12, 2, 'CRITICAL', 'leon_karpov'),
(77, 'Формированию модель отношении предпосылки информационно-пропогандистское формирования.', 8, 'emiliya91', 2, 1, 'CRITICAL', 'antonina_belozerova'),
(78, 'Забывать представляет подготовке сложившаяся структуры нами требует.', 5, 'karl72', 3, 5, 'CRITICAL', 'ernst_ignatukev'),
(79, 'Количественный профессионального с очевидна путь выбранный разнообразный место и.', 1, 'gedeon_aleksandrov57', 6, 1, 'CRITICAL', 'vasilii77'),
(80, 'Повседневная сущности воздействия.', 1, 'vseslav.tretukyakov41', 5, 2, 'CRITICAL', 'anisim53'),
(81, 'Социально-ориентированный что понимание деятельности инновационный подготовке качественно предложений представляет.', 5, 'glafira9', 5, 3, 'LOW', 'dobroslav.aksenova31'),
(82, 'А управление обществом.', 20, 'akulina99', 1, 5, 'CRITICAL', 'ryurik_filippova40'),
(83, 'Развития постоянный повышение сложившаяся финансовых влечёт существующий.', 20, 'ostap60', 2, 1, 'CRITICAL', 'prov_alekseev22'),
(84, 'Прогресса стороны повышению участниками инновационный различных.', 8, 'lyubovuk46', 3, 4, 'CRITICAL', 'nina_sysoeva91'),
(85, 'Модернизации материально-технической опыт деятельности.', 13, 'averkii.ryabov', 7, 3, 'LOW', 'nikanor66'),
(86, 'Социально-ориентированный деятельности материально-технической участниками требует сфера проблем формирования.', 2, 'sigizmund12', 9, 2, 'CRITICAL', 'kirill_molchanova48'),
(87, 'Повседневная выбранный собой роль влечёт особенности сфера инновационный выбранный.', 3, 'solomon_zykova', 2, 1, 'MEDIUM', 'cheslav90'),
(88, 'Модернизации эксперимент определения систему проблем от прогресса дальнейшее.', 20, 'porfirii92', 8, 5, 'MEDIUM', 'nadezhda.merkusheva62'),
(89, 'И технологий обществом качественно.', 13, 'averkii29', 7, 5, 'LOW', 'nina_sysoeva91'),
(90, 'Уровня финансовых национальный.', 13, 'ryurik_filippova40', 12, 1, 'MEDIUM', 'dobroslav.aksenova31'),
(91, 'Очевидна эксперимент обучения поставленных технологий постоянное степени материально-технической формирования задач.', 1, 'ryurik_filippova40', 12, 2, 'CRITICAL', 'solomon_zykova'),
(92, 'По обществом укрепления разработке.', 3, 'avksentii93', 1, 5, 'CRITICAL', 'akim.fokina52'),
(93, 'Активом насущным изменений современного курс актуальность сознания.', 8, 'leon_karpov', 3, 1, 'CRITICAL', 'prokofii.polyakov90'),
(94, 'Широким рамки начало повышению новых широкому активом принимаемых что следует.', 2, 'raisa.ivanova', 4, 1, 'CRITICAL', 'prokofii.polyakov90'),
(95, 'Задач поэтапного показывает нас широким активом.', 13, 'leon_karpov', 5, 5, 'CRITICAL', 'modest_kiselev93'),
(96, 'Роль деятельности количественный принимаемых развития кадровой.', 8, 'cheslav90', 4, 4, 'CRITICAL', 'nadezhda.merkusheva62'),
(97, 'Задача структура настолько воздействия гражданского обуславливает актуальность.', 3, 'nikanor66', 8, 5, 'LOW', 'kapiton_dorofeeva71'),
(98, 'Повышению нас забывать качества сложившаяся разработке активизации определения деятельности сущности.', 1, 'raisa.ivanova', 1, 2, 'CRITICAL', 'demukyan66'),
(99, 'Структуры нами подготовке.', 13, 'nadezhda.merkusheva62', 5, 5, 'MEDIUM', 'ferapont_galkina36'),
(100, 'Идейные место значительной существующий обучения значительной высшего направлений структура кадровой.', 8, 'nikanor66', 7, 4, 'LOW', 'panfil_fadeeva');
SELECT setval('task_id_seq', 100, true);

-- Idea --
INSERT INTO Idea (id, description, author_login, status_enum_id, task_id) VALUES
(1, 'Модель активизации соответствующих. Что существующий зависит ресурсосберегающих модернизации соответствующей инновационный. Обеспечивает процесс разработке современного концепция и задач структура.', 'emiliya91', 'APPROVED', 5),
(2, 'Также модернизации значимость. Работы информационно-пропогандистское широким повседневная структура следует консультация. Кадровой нами задания.', 'averkii.ryabov', 'REJECTED', NULL),
(3, 'Курс насущным идейные кадровой требует разнообразный за высшего. Насущным структура системы повышению проблем влечёт различных качества в деятельности. Обучения что настолько сознания.', 'solomon_zykova', 'REJECTED', NULL),
(4, 'Новых кадров забывать вызывает внедрения принимаемых организации. Сознания создаёт очевидна целесообразности повышению проблем собой. Проверки ресурсосберегающих прежде нас разработке ресурсосберегающих порядка системы.', 'sigizmund12', 'PENDING', NULL),
(5, 'Значение выполнять поставленных условий. Начало социально-экономическое подготовке обеспечивает проверки. Однако процесс предпосылки консультация широкому гражданского структура.', 'avksentii93', 'REJECTED', NULL),
(6, 'Проект вызывает высокотехнологичная организационной значение предложений. Определения рост массового стороны. Рост количественный активизации инновационный.', 'averkii.ryabov', 'PENDING', NULL),
(7, 'Опыт общественной опыт всего особенности. Управление новая правительством зависит не. Предложений разработке отношении профессионального показывает уровня массового шагов особенности сущности.', 'klavdii_kornilov80', 'REJECTED', NULL),
(8, 'Административных образом занимаемых отметить показывает широкому собой кадровой активизации. Повышение интересный концепция дальнейшее задач. Специалистов активом с системы поставленных забывать.', 'iya_scherbakova', 'REJECTED', NULL),
(9, 'Повседневной подготовке идейные же важную поставленных отношении повышение проверки а. Отметить повседневной участия дальнейших. Существующий идейные особенности насущным прогрессивного повышение специалистов разработке концепция.', 'averkii29', 'REJECTED', NULL),
(10, 'Целесообразности форм вызывает прогрессивного ресурсосберегающих. Формирования прежде широким рост актуальность социально-экономическое обучения. Не кадровой обеспечение и формирования технологий широким.', 'cheslav90', 'REJECTED', NULL);
SELECT setval('idea_id_seq', 10, true);

-- Risk --
INSERT INTO Risk (id, description, probability, estimated_loss) VALUES
(1, 'Падение сервера', 0.11, 6169.91),
(2, 'Отмена компании', 0.44, 8442.31),
(3, 'Взлом', 0.58, 1408.71),
(4, 'Падение стороннего сервиса', 0.28, 6355.38),
(5, 'Закрытие проекта', 0.23, 2177.51);
SELECT setval('risk_id_seq', 5, true);

-- Tag --
INSERT INTO Tag (id, name, description) VALUES
(1, 'Задача', 'Новая функциональность'),
(2, 'Баг', 'Ошибка, требующая исправления'),
(3, 'Эпик', 'Глобальная задача'),
(4, 'Рисерч', 'Исследование потенциальной задачи');
SELECT setval('tag_id_seq', 4, true);

-- Idea_Risk --
INSERT INTO Idea_Risk (idea_id, risk_id) VALUES
(2, 5),
(3, 2),
(3, 1),
(9, 5),
(9, 1);

-- Task_Risk --
INSERT INTO Task_Risk (task_id, risk_id) VALUES
(2, 2),
(20, 4),
(20, 5),
(92, 2),
(92, 1),
(8, 1),
(8, 3),
(1, 4),
(2, 5),
(6, 2),
(3, 2),
(3, 1),
(5, 2),
(5, 4),
(6, 3);

-- Task_Tag --
INSERT INTO Task_Tag (task_id, tag_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(6, 1),
(7, 2),
(8, 3),
(9, 4);

-- Role_Status --
INSERT INTO Role_Status (role_id, status_id) VALUES
(2, 1),
(2, 3),
(2, 5),
(3, 1),
(3, 2),
(4, 3),
(4, 4);
