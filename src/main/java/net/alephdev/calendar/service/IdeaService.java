package net.alephdev.calendar.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.IdeaDto;
import net.alephdev.calendar.models.Idea;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.functional.IdeaRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IdeaService {

    private final IdeaRepository ideaRepository;
    private final UserService userService;

    public List<Idea> getAllIdeas() {
        return ideaRepository.findAll();
    }

    public Idea createIdea(IdeaDto idea, User user) {
        Idea created = new Idea();
        created.setDescription(idea.getDescription());
        created.setAuthorLogin(user);
        created.setStatusEnumId(Idea.Status.PENDING);

        return ideaRepository.save(created);
    }

    public Idea updateIdea(Integer id, IdeaDto updatedIdea, User user) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Idea not found"));

        if(user.getLogin().equals(idea.getAuthorLogin().getLogin()) || userService.isPrivileged(user)) {
            idea.setDescription(updatedIdea.getDescription());
            return ideaRepository.save(idea);
        }
        throw new IllegalArgumentException("Not permitted to update idea");
    }

    public void deleteIdea(Integer id) {
        ideaRepository.deleteById(id);
    }

    @Transactional
    public void processIdea(Integer ideaId, String newStatus) {
        ideaRepository.processIdea(ideaId, newStatus);
    }
}