package net.alephdev.calendar.repository.functional;

import net.alephdev.calendar.models.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Integer> {
    @Query(value = "CALL process_idea(:ideaId, :newStatus)", nativeQuery = true)
    void processIdea(@Param("ideaId") Integer ideaId, @Param("newStatus") String newStatus);
}
