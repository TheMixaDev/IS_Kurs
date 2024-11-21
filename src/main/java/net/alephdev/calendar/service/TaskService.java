package net.alephdev.calendar.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.TaskDto;
import net.alephdev.calendar.models.*;
import net.alephdev.calendar.repository.RoleStatusRepository;
import net.alephdev.calendar.repository.StatusRepository;
import net.alephdev.calendar.repository.TaskRepository;
import net.alephdev.calendar.repository.functional.SprintRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final RoleStatusRepository roleStatusRepository;
    private final StatusRepository statusRepository;
    private final SprintRepository sprintRepository;
    private final UserService userService;
    private final RoleService roleService;


    public Page<Task> getAllTasks(int page) {
        return taskRepository.findAll(PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "id")));
    }

    public Page<Task> getAllTaskByStatus(Integer statusId, int page) {
        return taskRepository.findAllByStatusId(statusId, PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "id")));
    }

    public Page<Task> getAllTasksBySprint(Integer sprintId, int page) {
        return taskRepository.findAllBySprintId(sprintId, PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "id")));
    }

    public Page<Task> getAllTasksByImplementer(User implementer, int page) {
        return taskRepository.findAllByImplementer(implementer, PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "id")));
    }

    public Page<Task> getAllTasksBySprintAndStatus(Integer sprintId, Integer statusId, int page) {
        return taskRepository.findAllBySprintIdAndStatusId(sprintId, statusId, PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "id")));
    }

    public Page<Task> getAllTasksByImplementerAndStatus(User implementer, Integer statusId, int page) {
        return taskRepository.findAllByImplementerAndStatusId(implementer, statusId, PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "id")));
    }

    public Page<Task> getAllTasksByImplementerAndSprint(User implementer, Integer sprintId, int page) {
        return taskRepository.findAllByImplementerAndSprintId(implementer, sprintId, PageRequest.of(page, 20, Sort.by(Sort.Direction.DESC, "id")));
    }

    public Task createTask(TaskDto taskDto, User user) {
        Task task = new Task();
        task.setName(taskDto.getName().trim());
        task.setStoryPoints(taskDto.getStoryPoints());
        task.setPriorityEnum(taskDto.getPriorityEnum());
        task.setCreatedBy(user);
        task.setStatus(statusRepository.findById(1).orElseThrow(() -> new NoSuchElementException("Стандартный статус не найден")));

        return taskRepository.save(task);
    }

    public Task updateTask(Integer id, TaskDto updatedTask) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Задача не найдена"));

        if(updatedTask.getName() != null)  task.setName(updatedTask.getName().trim());
        if(updatedTask.getStoryPoints() != null) task.setStoryPoints(updatedTask.getStoryPoints());
        if(updatedTask.getPriorityEnum() != null) task.setPriorityEnum(updatedTask.getPriorityEnum());
        return taskRepository.save(task);
    }

    public Task getTask(Integer id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Задача не найдена"));
    }


    public ResponseEntity<Void> deleteTask(Integer id) {
        if (taskRepository.findById(id).isPresent()) {
            taskRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    public boolean canCreateTask(User user) {
        if (user.getRole() != null) {
            if(userService.isPrivileged(user)) {
                return true;
            }
            List<RoleStatus> roleStatuses = roleStatusRepository.findAllByRole_Id(user.getRole().getId());
            return roleStatuses.stream().anyMatch(rs -> rs.getStatus().getId() == 1);
        }
        return false;
    }


    public boolean canEditTask(User user, Task task) {
        if (userService.isPrivileged(user)) {
            return true;
        }
        return user.getLogin().equals(task.getCreatedBy().getLogin()) ||
                (task.getImplementer() != null && user.getLogin().equals(task.getImplementer().getLogin()));
    }

    @Transactional
    public Task assignImplementer(Integer taskId, String implementerLogin) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NoSuchElementException("Задача не найдена"));
        try {
            User implementer = userService.getUserByLogin(implementerLogin);
            task.setImplementer(implementer);
        } catch (EntityNotFoundException e) {
            task.setImplementer(null);
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateStatus(Integer taskId, Integer statusId, User user) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NoSuchElementException("Задача не найдена"));

        if (userService.isPrivileged(user)) {
            // Admin can set any status
            task.setStatus(statusRepository.findById(statusId).get());
        } else if (task.getImplementer() != null && task.getImplementer().getLogin().equals(user.getLogin()) && user.getRole() != null) {
            List<Status> allowedStatuses = roleService.getStatuses(user.getRole());
            Optional<Status> allowedStatus = allowedStatuses.stream()
                    .filter(roleStatus -> roleStatus.getId().equals(statusId))
                    .findFirst();

            if (allowedStatus.isPresent()) {
                task.setStatus(allowedStatus.get());
            } else {
                throw new IllegalArgumentException("Вы не можете ставить статус этой задаче");
            }
        } else {
            throw new IllegalArgumentException("Вы не можете обновлять статус этой задаче");
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task assignSprint(Integer taskId, Integer sprintId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new NoSuchElementException("Задача не найдена"));

        try {
            Sprint sprint = sprintRepository.findById(sprintId)
                    .orElseThrow(() -> new NoSuchElementException("Спринт не найден"));
            task.setSprint(sprint);
        } catch (NoSuchElementException e) {
            task.setSprint(null);
        }

        return taskRepository.save(task);
    }
}