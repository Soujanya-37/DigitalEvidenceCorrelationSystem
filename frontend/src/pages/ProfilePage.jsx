import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Briefcase,
  Mail,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";

import PageCard from "../components/PageCard";
import { getCurrentUser } from "../services/authService";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCurrentUser();

      console.log("Profile API response:", data);

      setUser(data);
    } catch (err) {
      console.error("Failed to load profile:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load investigator profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <PageCard
        title="Analyst profile"
        description="Operational access, permissions, and investigator profile details"
        accent="cyan"
      >
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <p className="text-sm text-slate-400">
            Loading authenticated investigator profile...
          </p>
        </div>
      </PageCard>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <PageCard
        title="Analyst profile"
        description="Operational access, permissions, and investigator profile details"
        accent="cyan"
      >
        <div className="rounded-3xl border border-red-500/20 bg-red-950/20 p-5">
          <p className="text-sm text-red-300">
            {error}
          </p>
        </div>
      </PageCard>
    );
  }

  // ============================================================
  // PROFILE
  // ============================================================

  return (
    <PageCard
      title="Analyst profile"
      description="Operational access, permissions, and investigator profile details"
      accent="cyan"
    >
      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">

        {/* ======================================================
            USER INFORMATION
        ====================================================== */}

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5"
        >
          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-cyan-500/15 p-3 text-cyan-300">
              <UserCircle2 size={24} />
            </div>

            <div>

              <p className="text-xl font-semibold text-white">
                {user?.full_name ||
                  user?.name ||
                  user?.username ||
                  "Investigator"}
              </p>

              <p className="text-sm text-slate-400">
                {user?.role || "INVESTIGATOR"}
              </p>

            </div>

          </div>

          <div className="mt-5 space-y-3 text-sm text-slate-400">

            {/* EMAIL */}

            <div className="flex items-center gap-2">

              <Mail
                size={16}
                className="text-cyan-300"
              />

              {user?.email || "Email unavailable"}

            </div>

            {/* ROLE */}

            <div className="flex items-center gap-2">

              <Briefcase
                size={16}
                className="text-cyan-300"
              />

              Role:{" "}
              {user?.role || "Investigator"}

            </div>

            {/* ACCOUNT STATUS */}

            <div className="flex items-center gap-2">

              <BadgeCheck
                size={16}
                className="text-cyan-300"
              />

              Authenticated investigator account

            </div>

          </div>
        </motion.div>

        {/* ======================================================
            ACCESS PERMISSIONS
        ====================================================== */}

        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-5">

          <div className="flex items-center gap-2 text-sm text-slate-300">

            <ShieldCheck
              size={16}
              className="text-cyan-300"
            />

            Access permissions

          </div>

          <div className="mt-4 space-y-2 text-sm text-slate-300">

            {[
              "Case creation and review",
              "Evidence upload and review",
              "Alibi verification",
              "AI analysis",
              "Timeline reconstruction",
              "Report generation",
            ].map((item) => (

              <div
                key={item}
                className="rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2"
              >
                {item}
              </div>

            ))}

          </div>

        </div>

      </div>

      {/* ========================================================
          ACCOUNT INFORMATION
      ======================================================== */}

      <div className="mt-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5">

        <div className="flex items-center gap-2 text-sm text-slate-300">

          <ShieldCheck
            size={16}
            className="text-emerald-300"
          />

          Authentication status

        </div>

        <div className="mt-4 flex flex-wrap gap-3">

          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300">
            JWT authenticated
          </span>

          <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1.5 text-xs text-cyan-300">
            Investigator access
          </span>

          <span className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300">
            Secure review mode
          </span>

        </div>

      </div>

    </PageCard>
  );
}