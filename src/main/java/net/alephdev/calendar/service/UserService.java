package net.alephdev.calendar.service;

import net.alephdev.calendar.dto.UserDto;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(UserDto userDto) {
        if (userRepository.findByLogin(userDto.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Пользователь с таким именем уже существует");
        }

        User user = new User();
        user.setLogin(userDto.getUsername());
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));
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
}
