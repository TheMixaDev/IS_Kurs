package net.alephdev.calendar.controller;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import net.alephdev.calendar.annotation.CurrentUser;
import net.alephdev.calendar.annotation.PrivilegeRequired;
import net.alephdev.calendar.dto.MessageDto;
import net.alephdev.calendar.models.Tag;
import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.TagService;
import net.alephdev.calendar.service.TaskService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@AuthorizedRequired
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;
    private final TaskService taskService;

    @GetMapping
    public List<Tag> getAllTags() {
        return tagService.getAllTags();
    }

    @PrivilegeRequired
    @PostMapping
    public ResponseEntity<Tag> createTag(@RequestBody Tag tag) {
        Tag createdTag = tagService.createTag(tag);
        return new ResponseEntity<>(createdTag, HttpStatus.CREATED);
    }

    @PrivilegeRequired
    @PutMapping("/{id}")
    public ResponseEntity<Tag> updateTag(@PathVariable Integer id, @RequestBody Tag updatedTag) {
        Tag tag = tagService.updateTag(id, updatedTag);
        return new ResponseEntity<>(tag, HttpStatus.OK);
    }

    @PrivilegeRequired
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTag(@PathVariable Integer id) {
        tagService.deleteTag(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }


    @PostMapping("/task/{taskId}")
    public ResponseEntity<?> addTagToTask(@PathVariable Integer taskId, @RequestParam Integer tagId, @CurrentUser User user) {
        try {
            Task task = taskService.getTask(taskId);
            Tag tag = tagService.getTag(tagId);

            tagService.addTagToTask(task, tag, user);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new MessageDto(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }


    @DeleteMapping("/task/{taskId}")
    public ResponseEntity<?> removeTagFromTask(@PathVariable Integer taskId, @RequestParam Integer tagId, @CurrentUser User user) {
        try {
            Task task = taskService.getTask(taskId);
            Tag tag = tagService.getTag(tagId);

            tagService.removeTagFromTask(task, tag, user);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(new MessageDto(e.getMessage()), HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/task/{taskId}")
    public ResponseEntity<List<Tag>> getTagsForTask(@PathVariable Integer taskId) {
        Task task = taskService.getTask(taskId);
        List<Tag> tags = tagService.getTagsForTask(task);
        return new ResponseEntity<>(tags, HttpStatus.OK);
    }
}