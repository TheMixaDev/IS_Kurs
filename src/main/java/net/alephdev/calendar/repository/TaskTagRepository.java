package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.Tag;
import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.TaskTag;
import net.alephdev.calendar.models.keys.TaskTagId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskTagRepository extends JpaRepository<TaskTag, TaskTagId> {
    List<TaskTag> findAllByTask(Task task);

    void deleteByTaskAndTag(Task task, Tag tag);
}