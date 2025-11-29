// Function to display warning messages
function showWarning(message) {
  const warningOverlay = document.getElementById("warning-overlay");
  const warningMessage = document.querySelector(".warning-message");

  if (message) {
    warningMessage.textContent = message;
    warningOverlay.style.display = "flex";
    document.body.classList.add("blurred");
  }
}

// Form submission handler with loading spinner
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector(".form").addEventListener("submit", async e => {
    e.preventDefault();

    console.log("Spinner shown");

    // Show loading spinner
    const loadingSpinner = document.getElementById("loading-spinner");
    loadingSpinner.style.display = "flex";

    // Disable form elements to prevent multiple submissions
    const formElements = document.querySelectorAll(".form input, .form button");
    formElements.forEach(el => {
      el.disabled = true;
    });

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // Get CSRF token from hidden input field
    const csrfToken = document.querySelector('input[name="_csrf"]').value;

    try {
      const response = await fetch("/api/v1/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "CSRF-Token": csrfToken, // Include the CSRF token in the request headers
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if the response is JSON before trying to parse it
      const contentType = response.headers.get("Content-Type");
      if (contentType && contentType.includes("application/json")) {
        const data = await response.json();

        // Hide loading spinner after response
        loadingSpinner.style.display = "none";

        if (data.status === "success") {
          console.log("Login successful", data);
          window.location.href = "/dashboard"; // Redirect to dashboard
        } else {
          console.error("Login failed", data);
          showWarning(data.message); // Show error message if login failed
        }
      } else {
        // If the response is not JSON, handle it accordingly (likely HTML error page)
        throw new Error("Unexpected response format. Expected JSON.");
      }
    } catch (error) {
      console.error("Network error or other issue", error);
      showWarning("A network error occurred. Please try again."); // Show network error
    } finally {
      // Re-enable form elements after the request completes
      loadingSpinner.style.display = "none";
      formElements.forEach(el => {
        el.disabled = false;
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const loginContainer = document.querySelector(".login-container");
  const errorMessage = loginContainer.getAttribute("data-error-message");

  if (errorMessage && errorMessage.trim() !== "") {
    showWarning(errorMessage);
  }
});

// Close the warning message
document.getElementById("close-warning-btn").addEventListener("click", () => {
  const warningOverlay = document.getElementById("warning-overlay");
  warningOverlay.style.display = "none"; // Hide the warning overlay
  document.body.classList.remove("blurred"); // Remove the blur effect
});
