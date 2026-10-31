"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  Scissors,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { apiErrorMessage } from "@/lib/api";
import { ROLE_HOME } from "@/lib/auth";
import type { SelfServiceRole } from "@/types";

type Role = SelfServiceRole;
const roles = [
  {
    id: "customer" as Role,
    number: "01",
    icon: ShoppingBag,
    title: "I am here to create",
    intro:
      "Find a maker, choose beautiful fabric, and bring a personal piece to life.",
    benefits: [
      "Discover artisans",
      "Explore the textile edit",
      "Add measurements when you commission",
    ],
    cta: "Start exploring",
  },
  {
    id: "tailor" as Role,
    number: "02",
    icon: Scissors,
    title: "I am here to make",
    intro:
      "Share your craft with people looking for work that feels one of a kind.",
    benefits: [
      "Showcase your atelier",
      "Connect with clients",
      "Start verification",
    ],
    cta: "Continue as an artisan",
  },
  {
    id: "merchant" as Role,
    number: "03",
    icon: Sparkles,
    title: "I am here to source",
    intro:
      "Bring exceptional textiles and their stories to the makers who need them.",
    benefits: [
      "Present your fabrics",
      "Reach new customers",
      "Start verification",
    ],
    cta: "Continue as a merchant",
  },
];

export default function RoleSelection({ idea }: { idea?: string }) {
  const { user, status, setRole } = useAuth();
  const [selected, setSelected] = useState<Role>("customer");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const chosen = roles.find((role) => role.id === selected)!;

  // Start from the role the signed-in person already has.
  useEffect(() => {
    const current = user?.role;
    if (current === "customer" || current === "tailor" || current === "merchant") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelected(current);
    }
  }, [user?.role]);

  async function continueJourney() {
    if (idea) sessionStorage.setItem("IPILE-style-idea", idea);
    // Customers can start browsing straight away; measurements are asked for when they commission.
    const home = selected === "customer" ? "/marketplace" : ROLE_HOME[selected];
    if (status !== "authenticated" || !user) {
      router.push(`/signup?${new URLSearchParams({ role: selected, next: home })}`);
      return;
    }
    setError("");
    // Also records the choice when it matches their current role, so sign-in stops asking.
    if (user.role !== selected || !user.pathChosenAt) {
      setPending(true);
      try {
        await setRole(selected);
      } catch (err) {
        setError(apiErrorMessage(err, "We could not switch your account. Please try again."));
        setPending(false);
        return;
      }
    }
    router.push(home);
  }
  return (
    <div className="join-page">
      <Link href="/marketplace" className="back-link">
        <ArrowLeft size={16} /> Back to discover
      </Link>
      <div className="join-intro">
        <span className="section-kicker">
          {status === "authenticated" && user ? "YOUR ACCOUNT IS READY" : "YOUR JOURNEY STARTS HERE"}
        </span>
        <h1>
          {status === "authenticated" && user ? (
            <>
              Welcome{user.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}. <em>How will you use IPILE?</em>
            </>
          ) : (
            <>
              There is room for <em>your story.</em>
            </>
          )}
        </h1>
        <p>
          {status === "authenticated" && user
            ? "Pick a path to finish setting up. Artisans and fabric merchants are verified by our team before customers can see them."
            : "Every piece starts with a person. Tell us where you fit in the atelier — you’ll create your account first, then set up the rest."}
        </p>
      </div>
      {idea && (
        <div className="join-idea">
          <Sparkles size={18} />
          <div>
            <span>YOUR STYLE IDEA</span>
            <p>“{idea}”</p>
          </div>
        </div>
      )}
      <div className="join-layout">
        <div className="join-visual">
          <Image
            src="/images/hero-editorial.jpg"
            alt="African couture model in a richly detailed garment"
            fill
            sizes="(max-width: 800px) 100vw, 40vw"
            className="cover-image"
          />
          <div className="join-visual-caption">
            <span>CRAFT / CONNECTION / CULTURE</span>
            <strong>Belong to something beautifully made.</strong>
          </div>
        </div>
        <div className="join-options">
          <span className="section-kicker">CHOOSE YOUR PATH</span>
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                className={`join-option ${selected === role.id ? "active" : ""}`}
                onClick={() => setSelected(role.id)}
                aria-pressed={selected === role.id}
                key={role.id}
              >
                <span className="join-option-num">{role.number}</span>
                <span className="join-option-icon">
                  <Icon size={23} />
                </span>
                <span className="join-option-body">
                  <strong>{role.title}</strong>
                  <span>{role.intro}</span>
                  <span className="join-benefits">
                    {role.benefits.map((benefit) => (
                      <span key={benefit}>
                        <Check size={13} />
                        {benefit}
                      </span>
                    ))}
                  </span>
                </span>
                <span className="join-radio" />
              </button>
            );
          })}
          <button
            className="join-continue"
            onClick={continueJourney}
            disabled={pending || status === "loading"}
            aria-busy={pending}
          >
            {pending ? "Setting up your account…" : chosen.cta}
            {pending ? (
              <LoaderCircle size={19} className="animate-spin" />
            ) : (
              <ArrowRight size={19} />
            )}
          </button>
          {error && (
            <p className="join-note" role="alert" style={{ color: "#9B2C24" }}>
              {error}
            </p>
          )}
          <p className="join-note">
            {status === "authenticated" ? (
              "You can change this until you submit a profile for review or place an order."
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/signin?next=/onboarding"
                  style={{ color: "var(--accent-soft)", fontWeight: 600 }}
                >
                  Sign in
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
