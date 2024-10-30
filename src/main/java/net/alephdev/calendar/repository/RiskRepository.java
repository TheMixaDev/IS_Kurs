package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.Risk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RiskRepository extends JpaRepository<Risk, Integer> {}
