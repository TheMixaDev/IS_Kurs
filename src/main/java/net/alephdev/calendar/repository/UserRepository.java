package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByLoginIgnoreCase(String login);

    @Query("SELECT u FROM User u WHERE (LOWER(u.login) LIKE LOWER(CONCAT('%', :login, '%')) OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :login, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :login, '%'))) AND u.password IS NOT NULL AND LENGTH(u.password) > 0 AND u.team IS NOT NULL AND u.role IS NOT NULL")
    Page<User> findActiveUsersByLoginContainingIgnoreCase(String login, Pageable pageable);

    @Query("SELECT u FROM User u WHERE (LOWER(u.login) LIKE LOWER(CONCAT('%', :login, '%')) OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :login, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :login, '%')))")
    Page<User> findUsersByLoginContainingIgnoreCase(String login, Pageable pageable);

    @Query("SELECT u FROM User u WHERE (LOWER(u.login) LIKE LOWER(CONCAT('%', :login, '%')) OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :login, '%')) OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :login, '%'))) AND u.team.id = :team_id")
    Page<User> findAllByLoginAndTeamIgnoreCase(String login, Integer team_id, Pageable pageable);
}
