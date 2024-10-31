package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.RoleStatus;
import net.alephdev.calendar.models.keys.RoleStatusId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoleStatusRepository extends JpaRepository<RoleStatus, RoleStatusId> {
    List<RoleStatus> findAllByRole_Id(Integer id);
}
