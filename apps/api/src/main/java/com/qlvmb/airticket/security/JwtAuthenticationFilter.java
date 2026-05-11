package com.qlvmb.airticket.security;

import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.stream.Stream;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  public static final String JWT_AUTH_ERROR_ATTRIBUTE = "qlvmb.jwt_auth_error";

  private final JwtTokenService jwtTokenService;

  public JwtAuthenticationFilter(JwtTokenService jwtTokenService) {
    this.jwtTokenService = jwtTokenService;
  }

  @Override
  protected void doFilterInternal(
      HttpServletRequest request,
      HttpServletResponse response,
      FilterChain filterChain
  ) throws ServletException, IOException {
    String authorization = request.getHeader("Authorization");
    if (authorization == null || !authorization.startsWith("Bearer ")) {
      filterChain.doFilter(request, response);
      return;
    }

    String token = authorization.substring(7).trim();
    if (token.isEmpty()) {
      request.setAttribute(JWT_AUTH_ERROR_ATTRIBUTE, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
      filterChain.doFilter(request, response);
      return;
    }

    try {
      JwtTokenService.AccessTokenPayload payload = jwtTokenService.parseAccessToken(token);
      List<SimpleGrantedAuthority> authorities = Stream.concat(
              payload.roles().stream().map(role -> "ROLE_" + role.toUpperCase(Locale.ROOT)),
              payload.permissions().stream()
          )
          .distinct()
          .map(SimpleGrantedAuthority::new)
          .toList();
      AuthenticatedUser authenticatedUser = new AuthenticatedUser(
          payload.userId(),
          payload.email(),
          payload.displayName(),
          payload.roles(),
          payload.permissions()
      );
      UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
          authenticatedUser,
          null,
          authorities
      );
      SecurityContextHolder.getContext().setAuthentication(authentication);
    } catch (JwtException exception) {
      SecurityContextHolder.clearContext();
      request.setAttribute(JWT_AUTH_ERROR_ATTRIBUTE, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
    }

    filterChain.doFilter(request, response);
  }
}
