require("dotenv").config();

const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const hasGitHubConfig = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
);

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  console.warn("AVISO: configure SESSION_SECRET com pelo menos 32 caracteres no arquivo .env.");
}

if (!hasGitHubConfig) {
  console.warn("AVISO: configure GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET para habilitar o login GitHub.");
}

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || "chave-local-apenas-para-desenvolvimento",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 1000 * 60 * 60 * 8
  }
}));

app.use(passport.initialize());
app.use(passport.session());

if (hasGitHubConfig) {
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL || `http://localhost:${PORT}/auth/github/callback`
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      username: profile.username,
      name: profile.displayName || profile.username,
      avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null,
      profileUrl: profile.profileUrl
    };
    return done(null, user);
  }));
}

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(express.static(path.join(__dirname, "public")));

function requireLogin(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect("/?login=required");
}

app.get("/auth/github", (req, res, next) => {
  if (!hasGitHubConfig) {
    return res.status(503).send("Login GitHub não configurado. Preencha as variáveis GITHUB_CLIENT_ID e GITHUB_CLIENT_SECRET.");
  }
  passport.authenticate("github", { scope: ["user:email"] })(req, res, next);
});

app.get("/auth/github/callback", (req, res, next) => {
  if (!hasGitHubConfig) return res.redirect("/?login=unavailable");
  passport.authenticate("github", {
    failureRedirect: "/?login=failed"
  })(req, res, () => res.redirect("/painel"));
});

app.get("/painel", requireLogin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "painel.html"));
});

app.get("/api/usuario", requireLogin, (req, res) => {
  res.json({ authenticated: true, user: req.user });
});

app.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy(() => res.redirect("/"));
  });
});

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.listen(PORT, () => {
  console.log(`Pizzaria & Festa disponível em http://localhost:${PORT}`);
});
