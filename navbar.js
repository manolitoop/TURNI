document.addEventListener("DOMContentLoaded", function () {
    const userNameSpan = document.getElementById("email");
    const editProfileBtn = document.getElementById("edit-profile");
    const logoutBtn = document.getElementById("logout");

    // Recuperar el correo del usuario desde localStorage
    const usuario = JSON.parse(localStorage.getItem("email"));

    console.log("Correo recuperado de localStorage:", usuario);  // Verifica si se recupera correctamente

    if (usuario) {
        // Mostrar el correo del usuario en el navbar
        userNameSpan.textContent = usuario; // Aquí asignamos el correo al span
    } else {
        // Si no hay sesión, redirigir a login
        console.log("No hay sesión, redirigiendo a login");
        window.location.href = "login.html"; // Redirige si no hay usuario
    }

    // Redirigir a la página de edición de perfil
    editProfileBtn.addEventListener("click", () => {
        window.location.href = "editar-perfil.html"; // Asegúrate de que esta página exista
    });

    // Cerrar sesión
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("email"); // Eliminar correo del localStorage
        localStorage.removeItem("token"); // Eliminar token del localStorage
        window.location.href = "login.html"; // Redirigir a la página de login
    });
});
