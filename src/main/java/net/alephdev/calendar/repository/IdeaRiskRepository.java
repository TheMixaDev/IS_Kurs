package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.Idea;
import net.alephdev.calendar.models.IdeaRisk;
import net.alephdev.calendar.models.Risk;
import net.alephdev.calendar.models.keys.IdeaRiskId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IdeaRiskRepository extends JpaRepository<IdeaRisk, IdeaRiskId> {
    List<IdeaRisk> findAllByIdea(Idea idea);

    void deleteByIdeaAndRisk(Idea idea, Risk risk);
}
