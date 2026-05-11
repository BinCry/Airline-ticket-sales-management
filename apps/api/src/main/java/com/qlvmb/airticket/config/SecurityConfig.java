package com.qlvmb.airticket.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.qlvmb.airticket.domain.dto.ApiErrorResponse;
import com.qlvmb.airticket.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.Map;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

  private static final String ACCESS_DENIED_MESSAGE =
      "B\u1ea1n kh\u00f4ng c\u00f3 quy\u1ec1n th\u1ef1c hi\u1ec7n thao t\u00e1c n\u00e0y.";
  private static final String UNAUTHORIZED_MESSAGE =
      "B\u1ea1n c\u1ea7n \u0111\u0103ng nh\u1eadp \u0111\u1ec3 ti\u1ebfp t\u1ee5c.";

  @Bean
  public SecurityFilterChain securityFilterChain(
      HttpSecurity httpSecurity,
      JwtAuthenticationFilter jwtAuthenticationFilter,
      ObjectMapper objectMapper
  ) throws Exception {
    return httpSecurity
        .cors(Customizer.withDefaults())
        .csrf(AbstractHttpConfigurer::disable)
        .formLogin(AbstractHttpConfigurer::disable)
        .httpBasic(AbstractHttpConfigurer::disable)
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .exceptionHandling(exceptionHandling -> exceptionHandling
            .authenticationEntryPoint((request, response, exception) ->
                writeErrorResponse(
                    response,
                    HttpStatus.UNAUTHORIZED,
                    resolveUnauthorizedMessage(request),
                    objectMapper
                )
            )
            .accessDeniedHandler((request, response, exception) ->
                writeErrorResponse(
                    response,
                    HttpStatus.FORBIDDEN,
                    ACCESS_DENIED_MESSAGE,
                    objectMapper
                )
            )
        )
        .authorizeHttpRequests(authorize -> authorize
            .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
            .requestMatchers("/error").permitAll()
            .requestMatchers("/api/meta/**", "/api/airports/**", "/api/flights/**", "/api/cms/homepage").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/bookings/manage/*").permitAll()
            .requestMatchers(HttpMethod.GET, "/api/auth/roles").permitAll()
            .requestMatchers(
                HttpMethod.POST,
                "/api/bookings/holds",
                "/api/bookings/*/payments/session",
                "/api/bookings/*/refund-request",
                "/api/payments/callback",
                "/api/check-in/complete",
                "/api/auth/register",
                "/api/auth/login",
                "/api/auth/refresh",
                "/api/auth/logout",
                "/api/auth/forgot-password/request-otp",
                "/api/auth/forgot-password/verify-otp",
                "/api/auth/reset-password"
            ).permitAll()
            .requestMatchers("/api/backoffice/operations/**", "/api/admin/**")
            .hasAuthority("ROLE_OPERATIONS_STAFF")
            .requestMatchers("/api/backoffice/sales/**", "/api/support/**", "/api/finance/**", "/api/backoffice/cms/**")
            .hasAuthority("ROLE_CUSTOMER_SUPPORT")
            .requestMatchers("/api/me/**", "/api/customers/**").authenticated()
            .requestMatchers("/api/**").permitAll()
            .anyRequest().authenticated()
        )
        .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
  }

  @Bean
  public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
  }

  private String resolveUnauthorizedMessage(HttpServletRequest request) {
    Object authErrorMessage = request.getAttribute(JwtAuthenticationFilter.JWT_AUTH_ERROR_ATTRIBUTE);
    if (authErrorMessage instanceof String message && !message.isBlank()) {
      return message;
    }
    return UNAUTHORIZED_MESSAGE;
  }

  private void writeErrorResponse(
      HttpServletResponse response,
      HttpStatus status,
      String message,
      ObjectMapper objectMapper
  ) throws IOException {
    response.setStatus(status.value());
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    response.getWriter().write(
        objectMapper.writeValueAsString(
            new ApiErrorResponse(
                status.value(),
                message,
                Map.of(),
                OffsetDateTime.now()
            )
        )
    );
  }
}
