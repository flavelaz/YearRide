import { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState(null);

  const [authMode, setAuthMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [rides, setRides] = useState([]);
  const [selectedRide, setSelectedRide] = useState(null);

  const [title, setTitle] = useState("");
  const [gpxFile, setGpxFile] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      loadCurrentUser();
      loadRides();
    }
  }, [token]);

  function showMessage(text) {
    setMessage(text);

    setTimeout(() => {
      setMessage("");
    }, 3500);
  }

  async function request(path, options = {}) {
    const headers = options.headers || {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Es ist ein Fehler aufgetreten.");
    }

    return data;
  }

  async function handleAuthSubmit(event) {
    event.preventDefault();

    try {
      const path = authMode === "login" ? "/auth/login" : "/auth/register";

      const body =
        authMode === "login"
          ? { email, password }
          : { username, email, password };

      const data = await request(path, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);

      setUsername("");
      setEmail("");
      setPassword("");

      showMessage(
        authMode === "login"
          ? "Login erfolgreich."
          : "Registrierung erfolgreich."
      );
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function loadCurrentUser() {
    try {
      const data = await request("/auth/me");
      setUser(data.user || data);
    } catch (error) {
      logout();
    }
  }

  async function loadRides() {
    try {
      const data = await request("/rides");
      setRides(data);
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function loadRideById(id) {
    try {
      const data = await request(`/rides/${id}`);
      setSelectedRide(data);
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function uploadRide(event) {
    event.preventDefault();

    if (!title.trim()) {
      showMessage("Bitte einen Titel eingeben.");
      return;
    }

    if (!gpxFile) {
      showMessage("Bitte eine GPX-Datei auswählen.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("gpxFile", gpxFile);

      const data = await request("/rides", {
        method: "POST",
        body: formData
      });

      setTitle("");
      setGpxFile(null);

      const fileInput = document.getElementById("gpxFile");
      if (fileInput) {
        fileInput.value = "";
      }

      showMessage(data.message || "Fahrt wurde gespeichert.");
      loadRides();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function updateRide(id) {
    if (!editTitle.trim()) {
      showMessage("Der Titel darf nicht leer sein.");
      return;
    }

    try {
      await request(`/rides/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ title: editTitle })
      });

      setEditId(null);
      setEditTitle("");
      showMessage("Titel wurde geändert.");
      loadRides();

      if (selectedRide && selectedRide._id === id) {
        loadRideById(id);
      }
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function deleteRide(id) {
    const confirmDelete = window.confirm(
      "Möchtest du diese Fahrt wirklich löschen?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await request(`/rides/${id}`, {
        method: "DELETE"
      });

      if (selectedRide && selectedRide._id === id) {
        setSelectedRide(null);
      }

      showMessage("Fahrt wurde gelöscht.");
      loadRides();
    } catch (error) {
      showMessage(error.message);
    }
  }

  async function loadReport(event) {
    event.preventDefault();

    try {
      const data = await request(`/rides/report/${reportYear}`);
      setReport(data);
      showMessage("Jahresbericht wurde geladen.");
    } catch (error) {
      showMessage(error.message);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setRides([]);
    setSelectedRide(null);
    setReport(null);
    showMessage("Du wurdest ausgeloggt.");
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    return new Date(dateValue).toLocaleDateString("de-CH");
  }

  function formatDuration(seconds) {
    if (!seconds && seconds !== 0) {
      return "-";
    }

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours} h ${minutes} min`;
  }

  return (
    <div className="page">
      <header className="header">
        <div>
          <h1>YearRide</h1>
          <p>GPX-Fahrten hochladen und Jahresberichte auswerten</p>
        </div>

        {token && (
          <button className="secondary-button" onClick={logout}>
            Logout
          </button>
        )}
      </header>

      {message && <div className="message">{message}</div>}

      {!token ? (
        <main className="auth-layout">
          <section className="card auth-card">
            <h2>{authMode === "login" ? "Login" : "Registrieren"}</h2>

            <form onSubmit={handleAuthSubmit}>
              {authMode === "register" && (
                <div className="form-group">
                  <label>Benutzername</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="z.B. Flavio"
                  />
                </div>
              )}

              <div className="form-group">
                <label>E-Mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                />
              </div>

              <div className="form-group">
                <label>Passwort</label>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Passwort"
                />
              </div>

              <button className="primary-button" type="submit">
                {authMode === "login" ? "Einloggen" : "Account erstellen"}
              </button>
            </form>

            <button
              className="link-button"
              onClick={() =>
                setAuthMode(authMode === "login" ? "register" : "login")
              }
            >
              {authMode === "login"
                ? "Noch keinen Account? Registrieren"
                : "Bereits registriert? Zum Login"}
            </button>
          </section>
        </main>
      ) : (
        <main className="dashboard">
          <section className="card welcome-card">
            <h2>Willkommen{user?.username ? `, ${user.username}` : ""}</h2>
            <p>
              Hier kannst du GPX-Dateien hochladen, deine Fahrten verwalten und
              einen Jahresbericht erstellen.
            </p>
          </section>

          <section className="grid">
            <div className="card">
              <h2>GPX-Fahrt hochladen</h2>

              <form onSubmit={uploadRide}>
                <div className="form-group">
                  <label>Titel</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="z.B. Abendrunde Luzern"
                  />
                </div>

                <div className="form-group">
                  <label>GPX-Datei</label>
                  <input
                    id="gpxFile"
                    type="file"
                    accept=".gpx"
                    onChange={(event) => setGpxFile(event.target.files[0])}
                  />
                </div>

                <button className="primary-button" type="submit">
                  Fahrt speichern
                </button>
              </form>
            </div>

            <div className="card">
              <h2>Jahresbericht</h2>

              <form className="report-form" onSubmit={loadReport}>
                <input
                  type="number"
                  value={reportYear}
                  onChange={(event) => setReportYear(event.target.value)}
                />

                <button className="primary-button" type="submit">
                  Bericht laden
                </button>
              </form>

              {report && (
                <div className="report-box">
                  <p>
                    <strong>Jahr:</strong> {report.year}
                  </p>
                  <p>
                    <strong>Anzahl Fahrten:</strong> {report.totalRides}
                  </p>
                  <p>
                    <strong>Gesamtdistanz:</strong>{" "}
                    {report.totalDistanceKm} km
                  </p>
                  <p>
                    <strong>Höhenmeter:</strong>{" "}
                    {report.totalElevationGainM} m
                  </p>
                  <p>
                    <strong>Gesamtdauer:</strong>{" "}
                    {formatDuration(report.totalDurationSeconds)}
                  </p>
                  <p>
                    <strong>Durchschnitt:</strong>{" "}
                    {report.averageDistanceKm} km
                  </p>

                  {report.longestRide ? (
                    <p>
                      <strong>Längste Fahrt:</strong>{" "}
                      {report.longestRide.title} (
                      {report.longestRide.distanceKm} km)
                    </p>
                  ) : (
                    <p>
                      <strong>Längste Fahrt:</strong> Keine Fahrt vorhanden
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="section-title">
              <h2>Meine Fahrten</h2>
              <button className="secondary-button" onClick={loadRides}>
                Aktualisieren
              </button>
            </div>

            {rides.length === 0 ? (
              <p className="empty-text">Es wurden noch keine Fahrten erfasst.</p>
            ) : (
              <div className="ride-list">
                {rides.map((ride) => (
                  <div className="ride-item" key={ride._id}>
                    <div className="ride-main">
                      {editId === ride._id ? (
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(event) =>
                            setEditTitle(event.target.value)
                          }
                        />
                      ) : (
                        <>
                          <h3>{ride.title}</h3>
                          <p>
                            {formatDate(ride.date)} · {ride.distanceKm} km ·{" "}
                            {ride.elevationGainM} hm ·{" "}
                            {formatDuration(ride.durationSeconds)}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="ride-actions">
                      <button
                        className="small-button"
                        onClick={() => loadRideById(ride._id)}
                      >
                        Details
                      </button>

                      {editId === ride._id ? (
                        <>
                          <button
                            className="small-button"
                            onClick={() => updateRide(ride._id)}
                          >
                            Speichern
                          </button>
                          <button
                            className="small-button"
                            onClick={() => {
                              setEditId(null);
                              setEditTitle("");
                            }}
                          >
                            Abbrechen
                          </button>
                        </>
                      ) : (
                        <button
                          className="small-button"
                          onClick={() => {
                            setEditId(ride._id);
                            setEditTitle(ride.title);
                          }}
                        >
                          Bearbeiten
                        </button>
                      )}

                      <button
                        className="danger-button"
                        onClick={() => deleteRide(ride._id)}
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {selectedRide && (
            <section className="card">
              <div className="section-title">
                <h2>Fahrt Details</h2>
                <button
                  className="secondary-button"
                  onClick={() => setSelectedRide(null)}
                >
                  Schliessen
                </button>
              </div>

              <div className="details">
                <p>
                  <strong>Titel:</strong> {selectedRide.title}
                </p>
                <p>
                  <strong>Originaldatei:</strong>{" "}
                  {selectedRide.originalFileName || "-"}
                </p>
                <p>
                  <strong>Datum:</strong> {formatDate(selectedRide.date)}
                </p>
                <p>
                  <strong>Distanz:</strong> {selectedRide.distanceKm} km
                </p>
                <p>
                  <strong>Höhenmeter:</strong>{" "}
                  {selectedRide.elevationGainM} m
                </p>
                <p>
                  <strong>Dauer:</strong>{" "}
                  {formatDuration(selectedRide.durationSeconds)}
                </p>
                <p>
                  <strong>ID:</strong> {selectedRide._id}
                </p>
              </div>
            </section>
          )}
        </main>
      )}
    </div>
  );
}

export default App;
