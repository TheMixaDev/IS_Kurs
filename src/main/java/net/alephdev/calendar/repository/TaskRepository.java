package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaskRepository extends JpaRepository<Task, Integer> {
    Page<Task> findAllByStatusId(Integer statusId, Pageable pageable);

    Page<Task> findAllBySprintId(Integer sprintId, Pageable pageable);

    Page<Task> findAllByImplementer(User implementer, Pageable pageable);

    Page<Task> findAllBySprintIdAndStatusId(Integer sprintId, Integer statusId, Pageable pageable);

    Page<Task> findAllByImplementerAndStatusId(User implementer, Integer statusId, Pageable pageable);

    Page<Task> findAllByImplementerAndSprintId(User implementer, Integer sprintId, Pageable pageable);
}
