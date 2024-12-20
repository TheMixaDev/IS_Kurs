package net.alephdev.calendar.service;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.IdeaDto;
import net.alephdev.calendar.models.Idea;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.functional.IdeaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.NoSuchElementException;

@Service
@RequiredArgsConstructor
public class IdeaService {

    private final IdeaRepository ideaRepository;
    private final UserService userService;

    public Page<Idea> getAllIdeas(int page) {
        return ideaRepository.findAll(PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "id")));
    }

    public Page<Idea> getAllIdeasByStatus(Idea.Status status, int page) {
        return ideaRepository.findAllByStatusEnumId(status, PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "id")));
    }

    public Idea createIdea(IdeaDto idea, User user) {
        Idea created = new Idea();
        created.setDescription(idea.getDescription().trim());
        created.setAuthorLogin(user);
        created.setStatusEnumId(Idea.Status.PENDING);

        return ideaRepository.save(created);
    }

    public Idea updateIdea(Integer id, IdeaDto updatedIdea, User user) {
        Idea idea = ideaRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Идея не найдена"));

        if(canEditIdea(idea, user)) {
            idea.setDescription(updatedIdea.getDescription().trim());
            return ideaRepository.save(idea);
        }
        throw new IllegalArgumentException("Недостаточно прав для редактирования идеи");
    }


    public boolean canEditIdea(Idea idea, User user) {
        return idea.getAuthorLogin().getLogin().equals(user.getLogin()) || userService.isPrivileged(user);
    }

    @Transactional
    public void processIdea(Integer ideaId, String newStatus) {
        getIdea(ideaId);
        ideaRepository.processIdea(ideaId, newStatus);
    }

    public Idea getIdea(Integer ideaId) {
        return ideaRepository.findById(ideaId)
                .orElseThrow(() -> new NoSuchElementException("Идея не найдена"));
    }
}