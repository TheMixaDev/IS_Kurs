package net.alephdev.calendar.repository.functional;

import net.alephdev.calendar.models.Idea;
import net.alephdev.calendar.models.Idea.Status;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, Integer> {
    @Modifying
    @Query(value = "CALL process_idea(:ideaId, :newStatus)", nativeQuery = true)
    void processIdea(@Param("ideaId") Integer ideaId, @Param("newStatus") String newStatus);

    Page<Idea> findAllByStatusEnumId(Status status, Pageable pageable);

    @Query("""
        SELECT i FROM Idea i 
        WHERE LOWER(i.statusEnumId) LIKE LOWER(CONCAT('%', :status, '%')) 
        OR CASE 
            WHEN i.statusEnumId = 'APPROVED' THEN 'принята'
            WHEN i.statusEnumId = 'PENDING' THEN 'ожидает'
            WHEN i.statusEnumId = 'REJECTED' THEN 'отклонена'
        END LIKE LOWER(CONCAT('%', :status, '%'))
    """)
    Page<Idea> findAllByStatusContainingIgnoreCase(@Param("status") String status, Pageable pageable);
}
