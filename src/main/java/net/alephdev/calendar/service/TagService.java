package net.alephdev.calendar.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.models.Tag;
import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.TaskTag;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.TagRepository;
import net.alephdev.calendar.repository.TaskTagRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TagService {

    private final TagRepository tagRepository;
    private final TaskTagRepository taskTagRepository;
    private final TaskService taskService;

    public List<Tag> getAllTags() {
        return tagRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Tag createTag(Tag tag) {
        return tagRepository.save(tag);
    }

    public Tag updateTag(Integer id, Tag updatedTag) {
        Tag tag = tagRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Tag not found"));

        tag.setName(updatedTag.getName());
        tag.setDescription(updatedTag.getDescription());

        return tagRepository.save(tag);
    }

    public ResponseEntity<Void> deleteTag(Integer id) {
        if (tagRepository.findById(id).isPresent()) {
            tagRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    public void addTagToTask(Task task, Tag tag, User user) {
        if(!taskService.canEditTask(user, task)) {
            throw new IllegalArgumentException("You are not allowed to add tags to this task");
        }
        TaskTag taskTag = new TaskTag();
        taskTag.setTask(task);
        taskTag.setTag(tag);
        taskTagRepository.save(taskTag);
    }

    public void removeTagFromTask(Task task, Tag tag, User user) {
        if(!taskService.canEditTask(user, task)) {
            throw new IllegalArgumentException("You are not allowed to remove tags from this task");
        }
        taskTagRepository.deleteByTaskAndTag(task, tag);
    }

    public List<Tag> getTagsForTask(Task task) {
        List<TaskTag> taskTags = taskTagRepository.findAllByTask(task);
        return taskTags.stream().map(TaskTag::getTag).collect(Collectors.toList());
    }

    public Tag getTag(Integer id) {
        return tagRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Tag not found"));
    }
}