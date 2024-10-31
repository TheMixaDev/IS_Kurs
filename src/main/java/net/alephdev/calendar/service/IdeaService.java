package net.alephdev.calendar.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import net.alephdev.calendar.models.Idea;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.IdeaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class IdeaService {

    private final IdeaRepository ideaRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public IdeaService(IdeaRepository ideaRepository) {
        this.ideaRepository = ideaRepository;
    }

    public List<Idea> getAllIdeas() {
        return ideaRepository.findAll();
    }

    public Idea createIdea(Idea idea, User user) {
        idea.setAuthorLogin(user);
        return ideaRepository.save(idea);
    }

    public Idea updateIdea(Integer id, Idea updatedIdea, User user) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Idea not found"));

        if(idea.getAuthorLogin().getLogin().equals(user.getLogin())) {
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
        entityManager.createNativeQuery("CALL process_idea(:ideaId, :newStatus)")
                .setParameter("ideaId", ideaId)
                .setParameter("newStatus", newStatus)
                .executeUpdate();
    }
}