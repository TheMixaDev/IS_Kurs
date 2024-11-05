package net.alephdev.calendar.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.UserDto;
import net.alephdev.calendar.models.Role;
import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.RoleRepository;
import net.alephdev.calendar.repository.UserRepository;
import net.alephdev.calendar.repository.repoWithFunc.TeamRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeamRepository teamRepository;
    private final RoleRepository roleRepository;

    public User getUserByLogin(String login) {
        return userRepository.findById(login)
                .orElseThrow(() -> new EntityNotFoundException("User not found with login: " + login));
    }

    @Transactional
    public User register(UserDto userDto) {
        if (!userRepository.findByLogin(userDto.getLogin()).isEmpty()) {
            throw new IllegalArgumentException("User with this login already exists");
        }

        User user = User.builder()
                .login(userDto.getLogin())
                .email(userDto.getEmail())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .firstName(userDto.getFirstName())
                .lastName(userDto.getLastName())
                .build();

        return userRepository.save(user);
    }

    public User authenticate(String login, String password) {
        User user = getUserByLogin(login);

        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        } else {
            throw new IllegalArgumentException("Invalid password");
        }
    }

    @Transactional
    public User updateUser(String login, UserDto userDto) {
        User user = getUserByLogin(login);
        user.setEmail(login);

        return userRepository.save(user);
    }

    @Transactional
    public User updateUserTeam(String login, Integer teamId) {
        User user = getUserByLogin(login);

        if (teamRepository.findById(teamId).isPresent()) {
            Team team = teamRepository.findById(teamId).get();
            user.setTeam(team);
        } else {
            user.setTeam(null);
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updateRole(String login, Integer roleId) {
        User user = getUserByLogin(login);

        if (roleRepository.findById(roleId).isPresent()) {
            Role role = roleRepository.findById(roleId).get();
            user.setRole(role);
            return userRepository.save(user);
        } else {
            throw new EntityNotFoundException("Role not found with id: " + roleId);
        }
    }

    public boolean isPrivileged(User user) {
        return user.getRole() != null && user.getRole().getId() == 1;
    }
}
