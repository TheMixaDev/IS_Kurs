package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.TaskRisk;
import net.alephdev.calendar.models.keys.TaskRiskId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRiskRepository extends JpaRepository<TaskRisk, TaskRiskId> {}
