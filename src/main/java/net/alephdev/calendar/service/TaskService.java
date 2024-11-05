package net.alephdev.calendar.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.models.RoleStatus;
import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.RoleStatusRepository;
import net.alephdev.calendar.repository.StatusRepository;
import net.alephdev.calendar.repository.TaskRepository;
import net.alephdev.calendar.repository.functional.SprintRepository;

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


    public List<Task> getAllTasks() {
        return taskRepository.findAll();
    }

    public Task createTask(Task task) {
        return taskRepository.save(task);
    }

    public Task updateTask(Integer id, Task updatedTask) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Task not found"));

        task.setName(updatedTask.getName());
        task.setStoryPoints(updatedTask.getStoryPoints());
        task.setImplementer(updatedTask.getImplementer());
        task.setSprint(updatedTask.getSprint());
        task.setStatus(updatedTask.getStatus());
        task.setPriorityEnum(updatedTask.getPriorityEnum());
        task.setCreatedBy(updatedTask.getCreatedBy());
        return taskRepository.save(task);
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
        if (user.getRole() != null && userService.isPrivileged(user)) {
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

        if (user.getRole() != null && user.getRole().getId() == 1) {
            // Admin can set any status
            roleService.getStatuses(user.getRole());
            task.setStatus(statusRepository.findById(statusId).get());
        } else if (task.getImplementer() != null && task.getImplementer().getLogin().equals(user.getLogin())) {
            List<RoleStatus> allowedStatuses = roleStatusRepository.findAllByRole_Id(user.getRole().getId());
            Optional<RoleStatus> allowedStatus = allowedStatuses.stream()
                    .filter(roleStatus -> roleStatus.getStatus().getId().equals(statusId))
                    .findFirst();

            if (allowedStatus.isPresent()) {
                task.setStatus(allowedStatus.get().getStatus());
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