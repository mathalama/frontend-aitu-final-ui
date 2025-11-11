(() => {
  const PROD_API_URL = "https://localhost:8080/api";
  const host = window.location.hostname || "";
  const normalized = host.trim().toLowerCase();
  const isLocal =
    !normalized ||
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized.endsWith(".localhost");

  if (!isLocal) {
    window.API_URL = window.API_URL || PROD_API_URL;
  } else if (window.API_URL) {
    delete window.API_URL;
  }
})();
