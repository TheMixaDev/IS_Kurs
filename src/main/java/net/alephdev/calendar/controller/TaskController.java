package net.alephdev.calendar.controller;

import net.alephdev.calendar.WebSocketHandler;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.TaskDto;
import net.alephdev.calendar.models.*;
import net.alephdev.calendar.service.*;
import org.springframework.beans.factory.annotation.Autowired;
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
    private final WebSocketHandler webSocketHandler;

    @Autowired
    public TaskController(TaskService taskService, UserService userService, WebSocketHandler webSocketHandler) {
        this.taskService = taskService;
        this.userService = userService;
        this.webSocketHandler = webSocketHandler;
    }

    @GetMapping
    public Page<Task> getAllTasks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(required = false) Integer statusId,
            @RequestParam(required = false) String implementerLogin,
            @RequestParam(required = false) Integer sprintId,
            @RequestParam(required = false) Integer tagId) {

        User implementer = implementerLogin != null ? userService.getUserByLogin(implementerLogin) : null;

        return taskService.getFilteredTasks(statusId, sprintId, implementer, tagId, page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Task> getTask(@PathVariable Integer id) {
        Task task = taskService.getTask(id);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Task> createTask(@RequestBody TaskDto task, @CurrentUser User user) {
        if (taskService.canCreateTask(user)) {
            Task createdTask = taskService.createTask(task, user);
            webSocketHandler.notifyClients("task");
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
            webSocketHandler.notifyClients("task", id);
            return new ResponseEntity<>(task, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }


    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id) {
        ResponseEntity<Void> result = taskService.deleteTask(id);
        webSocketHandler.notifyClients("task", id);
        return result;
    }

    @PutMapping("/{taskId}/implementer")
    public ResponseEntity<Task> assignImplementer(@PathVariable Integer taskId, @RequestParam String implementerLogin,
                                                  @CurrentUser User user) {
        Task existingTask = taskService.getTask(taskId);

        if ((user.getRole() != null && userService.isPrivileged(user)) ||
                (existingTask.getImplementer() != null && existingTask.getImplementer().getLogin().equals(user.getLogin())) ||
                existingTask.getCreatedBy().getLogin().equals(user.getLogin())) {
            Task task = taskService.assignImplementer(taskId, implementerLogin);
            webSocketHandler.notifyClients("task", taskId);
            return new ResponseEntity<>(task, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer taskId, @RequestParam Integer statusId,
                                             @CurrentUser User user) {
        Task task = taskService.updateStatus(taskId, statusId, user);
        webSocketHandler.notifyClients("task", taskId);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }

    @PrivilegeRequired
    @PutMapping("/{taskId}/sprint")
    public ResponseEntity<Task> assignSprint(@PathVariable Integer taskId, @RequestParam Integer sprintId) {
        Task task = taskService.assignSprint(taskId, sprintId);
        webSocketHandler.notifyClients("task", taskId);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }
}