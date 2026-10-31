import type { Metadata } from "next";
import { SurveyResultsPanel } from "@/components/admin/SurveysAdmin";

export const instant = false;

export const metadata: Metadata = { title: "Survey results | IPILE admin" };

async function Content({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;
  return <SurveyResultsPanel surveyId={surveyId} />;
}

export default function Page({ params }: { params: Promise<{ surveyId: string }> }) {
  return <Content params={params} />;
}
