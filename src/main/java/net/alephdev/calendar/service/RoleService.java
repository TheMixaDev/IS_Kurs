package net.alephdev.calendar.service;

import net.alephdev.calendar.models.Role;
import net.alephdev.calendar.models.RoleStatus;
import net.alephdev.calendar.models.Status;
import net.alephdev.calendar.repository.RoleRepository;
import net.alephdev.calendar.repository.RoleStatusRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoleService {

    private final RoleRepository roleRepository;
    private final RoleStatusRepository roleStatusRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository, RoleStatusRepository roleStatusRepository) {
        this.roleRepository = roleRepository;
        this.roleStatusRepository = roleStatusRepository;
    }

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public Role createRole(Role role) {
        return roleRepository.save(role);
    }

    public Role updateRole(Integer id, Role updatedRole) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Role not found"));

        role.setName(updatedRole.getName());
        role.setResponsibilities(updatedRole.getResponsibilities());

        return roleRepository.save(role);
    }

    public void deleteRole(Integer id) {
        roleRepository.deleteById(id);
    }

    public List<Status> getStatuses(Role role) {
        return getStatuses(role.getId());
    }

    public List<Status> getStatuses(Integer id) {
        List<RoleStatus> roleStatuses = roleStatusRepository.findAllByRole_Id(id);
        return roleStatuses.stream()
                .map(RoleStatus::getStatus)
                .collect(Collectors.toList());
    }
}