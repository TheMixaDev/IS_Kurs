package net.alephdev.calendar.service;

import jakarta.transaction.Transactional;
import net.alephdev.calendar.models.Role;
import net.alephdev.calendar.models.RoleStatus;
import net.alephdev.calendar.models.Status;
import net.alephdev.calendar.repository.RoleRepository;
import net.alephdev.calendar.repository.RoleStatusRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleStatusRepository roleStatusRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public Role updateRole(Integer id, Role updatedRole) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));

        role.setName(updatedRole.getName());
        role.setResponsibilities(updatedRole.getResponsibilities());

        return roleRepository.save(role);
    }

    public void deleteRole(Integer id) {
        if (id <= 1) {
            throw new IllegalArgumentException("Cannot delete default role");
        }
        roleRepository.deleteById(id);
    }

    public List<Status> getStatuses(Role role) {
        return getStatuses(role.getId());
    }

    public List<Status> getStatuses(Integer id) {
        List<RoleStatus> roleStatuses = roleStatusRepository.findAllByRole_Id(id, Sort.by(Sort.Direction.ASC, "status_id"));
        return roleStatuses.stream()
                .map(RoleStatus::getStatus)
                .collect(Collectors.toList());
    }

    public void addRoleStatus(Role role, Status status) {
        roleStatusRepository.save(new RoleStatus(role, status));
    }

    public void removeRoleStatus(Role role, Status status) {
        roleStatusRepository.deleteByRole_IdAndStatus_Id(role.getId(), status.getId());
    }

    public Role getRole(Integer id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Role not found"));
    }
}