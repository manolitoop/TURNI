const API_URL = "http://localhost:3000";

// 🔹 **Registro de Usuario**
document.getElementById("registerForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    
    const nombre = document.getElementById("nombre").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nombre, email, password, role })
        });

        const data = await response.json();
        if (response.ok) {
            alert("Registro exitoso. Redirigiendo a login...");
            window.location.href = "login.html";
        } else {
            alert(data.error || "Error en el registro");
        }
    } catch (error) {
        console.error("Error en registro:", error);
    }
});

// 🔹 **Inicio de Sesión**
document.getElementById("loginForm")?.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (response.ok) {
            // Guardar token y correo del usuario en localStorage
            localStorage.setItem("token", data.token); // Guardar token en localStorage
            localStorage.setItem("email", JSON.stringify(email)); // Guardar el email en localStorage

            console.log("Correo guardado en localStorage:", email);  // Verifica si se guarda correctamente

            alert("Inicio de sesión exitoso");

            // Redirigir según el rol
            if (data.role === "admin") {
                window.location.href = "index.admin.html";
            } else {
                window.location.href = "index.html";
            }
        } else {
            alert(data.error || "Error al iniciar sesión");
        }
    } catch (error) {
        console.error("Error en login:", error);
    }
});

