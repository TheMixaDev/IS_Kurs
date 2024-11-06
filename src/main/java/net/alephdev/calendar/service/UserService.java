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
import net.alephdev.calendar.repository.functional.TeamRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeamRepository teamRepository;
    private final RoleRepository roleRepository;

    public Page<User> getAllUsers(int page) {
        return userRepository.findAll(PageRequest.of(page, 20));
    }

    public Page<User> getAllUserWithPartialLogin(int page, String login) {
        return userRepository.findAllByLoginContaining(login, PageRequest.of(page, 20));
    }

    public User getUserByLogin(String login) {
        return userRepository.findById(login)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    @Transactional
    public User register(UserDto userDto) {
        if (userRepository.findByLogin(userDto.getLogin()).isPresent()) {
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

    @Transactional
    public User updateUser(String login, UserDto userDto) {
        User user = getUserByLogin(login);
        user.setLogin(userDto.getLogin());
        user.setEmail(userDto.getEmail());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());

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
            throw new EntityNotFoundException("Role not found");
        }
    }

    public boolean isPrivileged(User user) {
        return user.getRole() != null && user.getRole().getId() == 1;
    }
}
