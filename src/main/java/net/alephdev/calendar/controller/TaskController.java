package net.alephdev.calendar.controller;

import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.MessageDto;
import net.alephdev.calendar.dto.TaskDto;
import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.TaskService;
import net.alephdev.calendar.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@AuthorizedRequired
public class TaskController {

    private final TaskService taskService;
    private final UserService userService;

    @Autowired
    public TaskController(TaskService taskService, UserService userService) {
        this.taskService = taskService;
        this.userService = userService;
    }

    @GetMapping
    public List<Task> getAllTasks() {
        return taskService.getAllTasks();
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
        try {
            Task existingTask = taskService.getTask(id);

            if (taskService.canEditTask(user, existingTask)) {
                Task task = taskService.updateTask(id, updatedTask);
                return new ResponseEntity<>(task, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }


    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Integer id, @CurrentUser User user) {
        taskService.deleteTask(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @PutMapping("/{taskId}/implementer")
    public ResponseEntity<Task> assignImplementer(@PathVariable Integer taskId, @RequestParam String implementerLogin,
                                                  @CurrentUser User user) {
        try {
            Task existingTask = taskService.getTask(taskId);

            if ((user.getRole() != null && userService.isPrivileged(user)) ||
                    (existingTask.getImplementer() != null && existingTask.getImplementer().getLogin().equals(user.getLogin())) ||
                    existingTask.getCreatedBy().getLogin().equals(user.getLogin())) {
                Task task = taskService.assignImplementer(taskId, implementerLogin);
                return new ResponseEntity<>(task, HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{taskId}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Integer taskId, @RequestParam Integer statusId,
                                             @CurrentUser User user) {
        try {
            Task task = taskService.updateStatus(taskId, statusId, user);
            return new ResponseEntity<>(task, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new MessageDto(e.getMessage()), HttpStatus.FORBIDDEN);
        }
    }

    @PrivilegeRequired
    @PutMapping("/{taskId}/sprint")
    public ResponseEntity<Task> assignSprint(@PathVariable Integer taskId, @RequestParam Integer sprintId) {
        Task task = taskService.assignSprint(taskId, sprintId);
        return new ResponseEntity<>(task, HttpStatus.OK);
    }
}