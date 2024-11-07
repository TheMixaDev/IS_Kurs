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
