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
import org.springframework.data.domain.Sort;
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
        return userRepository.findUsersByLoginContainingIgnoreCase(login, PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "team", "login")));
    }

    public Page<User> getAllUsersWithPartialLoginAndTeam(int page, String login, int team) {
        return userRepository.findAllByLoginAndTeamIgnoreCase(login, team, PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "team", "login")));
    }

    public Page<User> getAllUsersWithPartialLoginActive(int page, String login) {
        return userRepository.findActiveUsersByLoginContainingIgnoreCase(login, PageRequest.of(page, 20, Sort.by(Sort.Direction.ASC, "team", "login")));
    }

    public User getUserByLogin(String login) {
        return userRepository.findById(login)
                .orElseThrow(() -> new EntityNotFoundException("Пользователь не найден"));
    }

    @Transactional
    public User register(UserDto userDto) {
        if (userRepository.findByLoginIgnoreCase(userDto.getLogin()).isPresent()) {
            throw new IllegalArgumentException("Пользователь с таким логином уже зарегистрирован");
        }

        User user = User.builder()
                .login(userDto.getLogin().trim())
                .email(userDto.getEmail().trim())
                .password(passwordEncoder.encode(userDto.getPassword()))
                .firstName(userDto.getFirstName().trim())
                .lastName(userDto.getLastName().trim())
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User updateUser(String login, UserDto userDto) {
        User user = getUserByLogin(login);
        if(userDto.getEmail() != null && !userDto.getEmail().isEmpty()) user.setEmail(userDto.getEmail());
        if(userDto.getPassword() != null && !userDto.getPassword().isEmpty()) user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        if(userDto.getFirstName() != null && !userDto.getFirstName().isEmpty()) user.setFirstName(userDto.getFirstName());
        if(userDto.getLastName() != null && !userDto.getLastName().isEmpty()) user.setLastName(userDto.getLastName());

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
        } else {
            user.setRole(null);
        }

        return userRepository.save(user);
    }

    public boolean isPrivileged(User user) {
        return user.getRole() != null && user.getRole().getId() == 1;
    }

    public void wipeUser(String login) {
        User user = getUserByLogin(login);
        user.setTeam(null);
        user.setRole(null);
        user.setPassword("");
        userRepository.save(user);
    }
}
