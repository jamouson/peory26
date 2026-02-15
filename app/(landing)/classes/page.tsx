// =============================================================================
// File: src/app/(landing)/classes/page.tsx
// Description: Flower Piping Classes landing page.
//              Background provided by landing layout (cool marble).
// =============================================================================

import type { Metadata } from "next"
import { ClassesHero } from "./classes-hero"
import { CourseDetails } from "./course-details"
import { CourseDifferentiators } from "./course-differentiators"
import { CourseCurriculum } from "./course-curriculum"
import { CourseRegistration } from "./course-registration"
import { CoursePayment } from "./course-payment"
import { CourseRefund } from "./course-refund"
import { ClassesFaqCta } from "./classes-faq-cta"
import LogoCloud from "@/components/ui/LogoCloud"

export const metadata: Metadata = {
  title: "Flower Piping Classes | PEORY",
  description:
    "Learn the art of buttercream floral piping. From beautiful roses to intricate blooms — one-on-one instruction from an expert cake designer.",
}

export default function ClassesPage() {
  return (
    <>
      <ClassesHero />
        <LogoCloud />
      <CourseDetails />
      <CourseDifferentiators />
      <CourseCurriculum />
      <CourseRegistration />
      <CoursePayment />
      <CourseRefund />
      <ClassesFaqCta />
    </>
  )
}
