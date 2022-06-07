(function(window) {
  window.__env = window.__env || {};

  // Environment variables
  window.__env.keycloakEnabled = "${KEYCLOAK_ENABLED}" === "true";
  window.__env.keycloakUrl = "${KEYCLOAK_URL}";
  window.__env.keycloakRealm = "${KEYCLOAK_REALM}";
  window.__env.keycloakClientId = "${KEYCLOAK_CLIENT_ID}";
  window.__env.keycloakRequiredRole = "${KEYCLOAK_REQUIRED_ROLE}";
  window.__env.repositoryProtocol = "${REPOSITORY_PROTOCOL}";
  window.__env.repositoryHost = "${REPOSITORY_HOST}";
  window.__env.repositoryPort = "${REPOSITORY_PORT}";
  window.__env.repositoryPath = "${REPOSITORY_PATH}";
  window.__env.contextPath = "${CONTEXT_PATH}";
  window.__env.repositoryAuth = "${REPOSITORY_AUTH}" === "true";
  window.__env.repositoryAuthUser = "${REPOSITORY_AUTH_USER}";
  window.__env.repositoryAuthPassword = "${REPOSITORY_AUTH_PASSWORD}";
})(this);
