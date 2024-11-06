package net.alephdev.calendar.service;

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
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
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
        task.setName(taskDto.getName());
        task.setStoryPoints(taskDto.getStoryPoints());
        task.setPriorityEnum(taskDto.getPriorityEnum());
        task.setCreatedBy(user);
        task.setStatus(statusRepository.findById(1).orElseThrow(() -> new IllegalArgumentException("Default status not found")));

        return taskRepository.save(task);
    }

    public Task updateTask(Integer id, TaskDto updatedTask) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        task.setName(updatedTask.getName());
        task.setStoryPoints(updatedTask.getStoryPoints());
        task.setPriorityEnum(updatedTask.getPriorityEnum());
        return taskRepository.save(task);
    }

    public Task getTask(Integer id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));
    }


    public void deleteTask(Integer id) {
        taskRepository.deleteById(id);
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
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        User implementer = userService.getUserByLogin(implementerLogin);
        task.setImplementer(implementer);

        return taskRepository.save(task);
    }

    @Transactional
    public Task updateStatus(Integer taskId, Integer statusId, User user) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

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
                throw new IllegalArgumentException("You are not allowed to set this status");
            }
        } else {
            throw new IllegalArgumentException("You are not authorized to update the task status");
        }

        return taskRepository.save(task);
    }

    @Transactional
    public Task assignSprint(Integer taskId, Integer sprintId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        Sprint sprint = sprintRepository.findById(sprintId)
                .orElseThrow(() -> new IllegalArgumentException("Sprint not found"));

        task.setSprint(sprint);
        return taskRepository.save(task);
    }
}