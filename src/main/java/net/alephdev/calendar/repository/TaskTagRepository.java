package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.TaskTag;
import net.alephdev.calendar.models.keys.TaskTagId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskTagRepository extends JpaRepository<TaskTag, TaskTagId> {}