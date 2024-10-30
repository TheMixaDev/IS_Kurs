package net.alephdev.calendar.annotation.implementation;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import net.alephdev.calendar.annotation.AuthorizedRequired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class AuthInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        if (handler instanceof HandlerMethod) {
            HandlerMethod handlerMethod = (HandlerMethod) handler;

            AuthorizedRequired authorizedRequired = handlerMethod.getMethodAnnotation(AuthorizedRequired.class);
            if (authorizedRequired != null) {
                return checkAuthentication(response);
            }

            authorizedRequired = handlerMethod.getBeanType().getAnnotation(AuthorizedRequired.class);
            if (authorizedRequired != null) {
                return checkAuthentication(response);
            }
        }
        return true;
    }

    private boolean checkAuthentication(HttpServletResponse response) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return false;
        }
        return true;
    }
}
