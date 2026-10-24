import { supabase } from "../config/supabase.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

// --- GOOGLE PRIJAVA ---
export const googleLogin = async (req, res, next) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${BASE_URL}/auth/callback`,
      },
    });

    if (error) throw error;
    res.redirect(data.url);
  } catch (error) {
    next(error);
  }
};

// --- GITHUB PRIJAVA ---
export const githubLogin = async (req, res, next) => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${BASE_URL}/auth/callback`,
      },
    });

    if (error) throw error;
    res.redirect(data.url);
  } catch (error) {
    next(error);
  }
};

// --- ZAJEDNIČKI CALLBACK ZA SUPABASE ---
export const authCallback = async (req, res, next) => {
  try {
    const { code } = req.query;

    if (code) {
      // Supabase mijenja autorizacijski kod za sesiju (OAuth 2.1 standard)
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) throw error;

      const user = data.user;

      // Spremanje korisnika u Express sesiju
      req.session.regenerate((sessionError) => {
        if (sessionError) return next(sessionError);

        req.session.user = {
          id: user.id, // Jedinstveni ID iz Supabase baze
          provider: user.app_metadata?.provider,
          email: user.email,
          name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            user.email,
          picture: user.user_metadata?.avatar_url || "",
        };

        req.session.save((saveError) => {
          if (saveError) return next(saveError);
          res.redirect("/");
        });
      });
    } else {
      res.redirect("/");
    }
  } catch (error) {
    next(error);
  }
};
