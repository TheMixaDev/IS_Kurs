package net.alephdev.calendar.repository;

import net.alephdev.calendar.models.RoleStatus;
import net.alephdev.calendar.models.keys.RoleStatusId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleStatusRepository extends JpaRepository<RoleStatus, RoleStatusId> {}
