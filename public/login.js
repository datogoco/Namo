document.querySelector(".login-form").addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/api/v1/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (data.status === "success") {
      console.log("Login successful", data);
      window.location.href = "/dashboard"; // or any other route
    } else {
      console.error("Login failed", data);
    }
  } catch (error) {
    console.error("Network error or other issue", error);
  }
});
