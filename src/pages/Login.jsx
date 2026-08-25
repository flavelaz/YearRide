// React importieren und useState Hook holen
// useState = damit können wir Daten speichern die sich ändern
import { useState } from "react";

import { Link } from "react-router-dom";

// Das CSS für diese Seite importieren
import "./Login.css";

// Die Login-Komponente - eine Funktion die HTML zurückgibt
function Login() {
  // email = was der Benutzer ins E-Mail Feld tippt, startet leer ""
  // setEmail = die Funktion um email zu ändern
  const [email, setEmail] = useState("");
  // passwort = was der Benutzer ins Passwort Feld tippt, startet leer ""
  // setPasswort = die Funktion um passwort zu ändern
  const [passwort, setPasswort] = useState("");
  // handleSubmit = wird aufgerufen wenn der Button geklickt wird
  const handleSubmit = () => {
    if (email === "" || passwort === "") {
      // Prüfen ob E-Mail oder Passwort leer ist  // .trim() entfernt unsichtbare Leerzeichen // || bedeutet "oder"

      // Popup anzeigen wenn ein Feld leer ist
      alert("Bitte alle Felder ausfüllen");
      return; // Funktion stoppen - nichts weiter machen
    }
    // Wenn alles ausgefüllt ist - Daten in der Console ausgeben
    // Später werden wir hier die Daten ans Backend schicken
    console.log("E-Mail:", email);
    console.log("Passwort:", passwort);
  };
  return (
    // Das HTML was angezeigt wird
    // Äusseres div - zentriert die Box in der Mitte der Seite
    <div className="login-containter">
      <div className="login-box">
        {" "}
        {/*Inneres div - die weisse Box*/}
        <h1>Anmelden</h1>
        <input
          // E-Mail Eingabefeld
          type="email" // type="email" = Browser prüft ob es eine gültige E-Mail ist
          placeholder="E-Mail"
          value={email} // value={email} = zeigt den aktuellen Wert der email Variable
          onChange={(e) => setEmail(e.target.value)} // onChange = wird bei jedem Tastendruck aufgerufen
          // e.target.value = was gerade im Feld steht
        />
        <input
          type="password" // type="password" = Text wird als •••• angezeigt
          placeholder="Passwort"
          value={passwort}
          onChange={(e) => setPasswort(e.target.value)}
        />
        <button onClick={handleSubmit}>Anmelden</button>{" "}
        {/*Button - onClick verbindet den Klick mit handleSubmit*/}
        {/*Link zur Register-Seite*/}
        <p>
          Noch kein Konto? <Link to="/register">Registrieren</Link>
        </p>
      </div>
    </div>
  );
}
export default Login; // Export damit App.jsx diese Komponente importieren kann
