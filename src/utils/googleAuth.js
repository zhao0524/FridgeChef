export function getAccessTokenFromSession() {
  return sessionStorage.getItem("google_access_token");
}

export function saveAccessToken(token) {
  sessionStorage.setItem("google_access_token", token);
}

export function signOut() {
  sessionStorage.removeItem("google_access_token");
}
