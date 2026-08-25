// React und useState importieren
import { useState } from "react";

function Register() {
  //drei Felder erstellen
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passwort, setPasswort] = useState("");

  //wird aufgerufen wenn der Button gecklikt wird
  const handleSubmit = () => {
    // prüfen ob alle Felder ausgefüllt sind
    if (name.trim() === "" || email.trim() === "" || passwort.trim() === "") {
      alert("Bitte alle Felder ausfüllen");
      return;
    }
    console.log("Name:", name);
    console.log("E-Mail:", email);
    console.log("Passwort:", passwort);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Registreien</h1>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Passwort"
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
        />
        <button onClick={handleSubmit}>Registrieren</button>
      </div>
    </div>
  );
}
export default Register;
