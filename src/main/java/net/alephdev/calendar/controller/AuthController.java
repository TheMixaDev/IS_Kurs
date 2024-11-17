package net.alephdev.calendar.controller;

import lombok.RequiredArgsConstructor;
import net.alephdev.calendar.dto.JwtRequestDto;
import net.alephdev.calendar.dto.JwtResponseDto;
import net.alephdev.calendar.dto.MessageDto;
import net.alephdev.calendar.jwt.JwtUtils;
import net.alephdev.calendar.models.User;
import net.alephdev.calendar.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody JwtRequestDto authenticationRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authenticationRequest.getUsername(), authenticationRequest.getPassword())
            );

            if (authentication.isAuthenticated()) {
                String username = ((UserDetails) authentication.getPrincipal()).getUsername();
                User user = userService.getUserByLogin(username);

                String token = jwtUtils.generateToken(user);
                return ResponseEntity.ok(new JwtResponseDto(token, user));
            } else {
                return new ResponseEntity<>(new MessageDto("Неверный логин или пароль"), HttpStatus.UNAUTHORIZED);
            }
        } catch (BadCredentialsException e) {
            return new ResponseEntity<>(new MessageDto("Неверный логин или пароль"), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>(new MessageDto(e.getMessage()), HttpStatus.UNAUTHORIZED);
        }
    }
}
