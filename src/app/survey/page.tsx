import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import SurveyExperience from "@/components/survey/SurveyExperience";

export const metadata: Metadata = {
  title: "Feedback survey | IPILE",
  description: "Tell us how testing IPILE went.",
};

export default function SurveyPage() {
  return (
    <div className="marketplace-site">
      <Navbar />
      <main className="page-shell">
        <SurveyExperience />
      </main>
      <Footer />
    </div>
  );
}
