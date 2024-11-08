package net.alephdev.calendar.controller;

import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.TaskDto;
import net.alephdev.calendar.models.Sprint;
import net.alephdev.calendar.models.Status;
import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.SprintService;
import net.alephdev.calendar.service.StatusService;
import net.alephdev.calendar.service.TaskService;
import net.alephdev.calendar.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.bind.DefaultValue;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tasks")
@AuthorizedRequired
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;
    private final StatusService statusService;
    private final SprintService sprintService;

    @Autowired
    public TaskController(TaskService taskService, UserService userService, StatusService statusService, SprintService sprintService) {
        this.taskService = taskService;
        this.userService = userService;
        this.statusService = statusService;
        this.sprintService = sprintService;
    }

    @GetMapping
    public Page<Task> getAllTasks(
            @RequestParam @DefaultValue("0") int page,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) String implementerLogin,
            @RequestParam(required = false) Integer sprintId
    ) {
        Status status = null;
        User implementer = null;
        Sprint sprint = null;

        if (statusId != null)
            status = statusService.getStatus(statusId);
        if (implementerLogin != null)
            implementer = userService.getUserByLogin(implementerLogin);
        if (sprintId != null)
            sprint = sprintService.getSprint(sprintId);
        if(implementer != null) {
            if(sprint != null)
                return taskService.getAllTasksByImplementerAndSprint(implementer, sprintId, page);
            if(status != null)
                return taskService.getAllTasksByImplementerAndStatus(implementer, statusId, page);
            return taskService.getAllTasksByImplementer(implementer, page);
        }
        if(sprint != null) {
            if(status != null)
                return taskService.getAllTasksBySprintAndStatus(sprintId, statusId, page);
            return taskService.getAllTasksBySprint(sprintId, page);
        }
        if(status != null)
            return taskService.getAllTaskByStatus(statusId, page);

        return taskService.getAllTasks(page);
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskDto task, @CurrentUser User user) {
        if (taskService.canCreateTask(user)) {
            Task createdTask = taskService.createTask(task, user);
            return new ResponseEntity<>(createdTask, HttpStatus.CREATED);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Integer id, @RequestBody TaskDto updatedTask, @CurrentUser User user) {
        Task existingTask = taskService.getTask(id);

        if (taskService.canEditTask(user, existingTask)) {
            Task task = taskService.updateTask(id, updatedTask);
            return new ResponseEntity<>(task, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }


    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id, @CurrentUser User user) {
        return taskService.deleteTask(id);
    }

    @PutMapping("/{taskId}/implementer")
    public ResponseEntity<Task> assignImplementer(@PathVariable Integer taskId, @RequestParam String implementerLogin,
                                                  @CurrentUser User user) {
        Task existingTask = taskService.getTask(taskId);

        if ((user.getRole() != null && userService.isPrivileged(user)) ||
                (existingTask.getImplementer() != null && existingTask.getImplementer().getLogin().equals(user.getLogin())) ||
                existingTask.getCreatedBy().getLogin().equals(user.getLogin())) {
            Task task = taskService.assignImplementer(taskId, implementerLogin);
            return new ResponseEntity<>(task, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer taskId, @RequestParam Integer statusId,
                                             @CurrentUser User user) {
        Task task = taskService.updateStatus(taskId, statusId, user);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @PrivilegeRequired
    @PutMapping("/{taskId}/sprint")
    public ResponseEntity<Task> assignSprint(@PathVariable Integer taskId, @RequestParam Integer sprintId) {
        Task task = taskService.assignSprint(taskId, sprintId);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }
}