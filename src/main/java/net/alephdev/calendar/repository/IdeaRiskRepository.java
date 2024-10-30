package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.IdeaRisk;
import net.alephdev.calendar.models.keys.IdeaRiskId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IdeaRiskRepository extends JpaRepository<IdeaRisk, IdeaRiskId> {}
