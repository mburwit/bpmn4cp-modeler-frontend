(function(window) {
  window.__env = window.__env || {};

  // Environment variables
  window.__env.keycloakEnabled = false;
  window.__env.keycloakUrl = "https://middleware.vcare-project.eu/keycloak/auth/";
  window.__env.keycloakRealm = "vcare";
  window.__env.keycloakClientId = "pathwaymodeler";
  window.__env.keycloakRequiredRole = "vcare_doctor";
  window.__env.repositoryProtocol = "http";
  window.__env.repositoryHost = "localhost";
  window.__env.repositoryPort = 8080;
  window.__env.repositoryPath = "/";
  window.__env.contextPath = "/";
})(this);
