package net.alephdev.calendar.repository.specification;

import jakarta.persistence.criteria.Join;
import net.alephdev.calendar.models.Task;
import net.alephdev.calendar.models.TaskTag;
import net.alephdev.calendar.models.User;
import org.springframework.data.jpa.domain.Specification;

public class TaskSpecification {

    public static Specification<Task> hasStatus(Integer statusId) {
        return (root, query, criteriaBuilder) ->
                statusId == null ? null : criteriaBuilder.equal(root.get("status").get("id"), statusId);
    }

    public static Specification<Task> hasSprint(Integer sprintId) {
        return (root, query, criteriaBuilder) ->
                sprintId == null ? null : criteriaBuilder.equal(root.get("sprint").get("id"), sprintId);
    }

    public static Specification<Task> hasImplementer(User implementer) {
        return (root, query, criteriaBuilder) ->
                implementer == null ? null : criteriaBuilder.equal(root.get("implementer"), implementer);
    }

    public static Specification<Task> hasTag(Integer tagId) {
        return (root, query, criteriaBuilder) -> {
            if (tagId == null) return null;
            Join<Task, TaskTag> taskTags = root.join("taskTags");
            return criteriaBuilder.equal(taskTags.get("tag").get("id"), tagId);
        };
    }
}

