import type { Metadata } from "next";
import { SurveyPreviewPanel } from "@/components/admin/SurveysAdmin";

export const instant = false;

export const metadata: Metadata = { title: "Survey preview | IPILE admin" };

async function Content({ params }: { params: Promise<{ surveyId: string }> }) {
  const { surveyId } = await params;
  return <SurveyPreviewPanel surveyId={surveyId} />;
}

export default function Page({ params }: { params: Promise<{ surveyId: string }> }) {
  return <Content params={params} />;
}
