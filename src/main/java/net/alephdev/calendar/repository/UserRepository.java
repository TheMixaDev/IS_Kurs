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
    Optional<User> findByLogin(String login);

    Page<User> findAllByLoginContaining(String login, Pageable pageable);

    Page<User> findAllByLoginContainingAndTeamId(String login, int team, Pageable pageable);

    @Query("SELECT u FROM User u WHERE u.login LIKE %:login% AND u.password IS NOT NULL AND LENGTH(u.password) > 0 AND u.team IS NOT NULL AND u.role IS NOT NULL")
    Page<User> findActiveUsersByLoginContaining(String login, Pageable pageable);
}
