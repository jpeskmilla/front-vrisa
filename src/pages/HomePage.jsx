export default function HomePage() {
  return (
    <div style={{ padding: "2rem" }}>
      <h1>Bienvenido a VriSA</h1>
      <p>Monitoreo de calidad del aire en la ciudad de Cali.</p>

      <div style={{ marginTop: "1.5rem" }}>
        <a href="/login">Iniciar sesión</a> | <a href="/register">Registrarse</a>
      </div>
    </div>
  );
}