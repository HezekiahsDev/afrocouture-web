import type { Metadata } from "next";
import { SurveyResponseDetail } from "@/components/admin/SurveysAdmin";

export const instant = false;

export const metadata: Metadata = { title: "Survey response | IPILE admin" };

async function Content({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SurveyResponseDetail id={id} />;
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return <Content params={params} />;
}
