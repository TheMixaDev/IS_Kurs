package net.alephdev.calendar.service;

import jakarta.transaction.Transactional;
import net.alephdev.calendar.dto.UserDto;
import net.alephdev.calendar.dto.UserLoginDto;
import net.alephdev.calendar.models.Role;
import net.alephdev.calendar.models.Team;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.RoleRepository;
import net.alephdev.calendar.repository.UserRepository;
import net.alephdev.calendar.repository.repoWithFunc.TeamRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final TeamRepository teamRepository;
    private final RoleRepository roleRepository;

    @Autowired
    public UserService(
           UserRepository userRepository,
           PasswordEncoder passwordEncoder,
           TeamRepository teamRepository,
           RoleRepository roleRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.teamRepository = teamRepository;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public User register(UserDto userDto) {
        if (userRepository.findByLogin(userDto.getLogin()).isPresent()) {
            throw new IllegalArgumentException("Пользователь с таким именем уже существует");
        }

        User user = new User();
        user.setLogin(userDto.getLogin());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        user.setEmail(userDto.getEmail());
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());

        return userRepository.save(user);
    }

    public User authenticate(String username, String password) {
        User user = userRepository.findByLogin(username)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (passwordEncoder.matches(password, user.getPassword())) {
            return user;
        } else {
            throw new IllegalArgumentException("Неверный пароль");
        }
    }

    public User getUserByLogin(String login) {
        return userRepository.findById(login)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));
    }

    @Transactional
    public User updateUser(String login, UserDto userDto) {
        User user = userRepository.findById(login)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (userDto.getEmail() != null) {
            user.setEmail(userDto.getEmail());
        }
        if (userDto.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(userDto.getPassword()));
        }
        if (userDto.getFirstName() != null) {
            user.setFirstName(userDto.getFirstName());
        }
        if (userDto.getLastName() != null) {
            user.setLastName(userDto.getLastName());
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updateUserTeam(String login, Integer teamId) {
        User user = userRepository.findById(login)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (teamId != null) {
            Team team = teamRepository.findById(teamId)
                    .orElseThrow(() -> new IllegalArgumentException("Team not found"));
            user.setTeam(team);
        } else {
            user.setTeam(null);
        }

        return userRepository.save(user);
    }

    @Transactional
    public User updateRole(String login, Integer roleId) {
        User user = userRepository.findById(login)
                .orElseThrow(() -> new IllegalArgumentException("Пользователь не найден"));

        if (roleId != null) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new IllegalArgumentException("Роль не найдена"));
            user.setRole(role);
        }

        return userRepository.save(user);
    }

    public boolean isPrivileged(User user) {
        return user.getRole() != null && user.getRole().getId() == 1;
    }
}
