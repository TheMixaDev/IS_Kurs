package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.Release;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReleaseRepository extends JpaRepository<Release, Integer> {}
