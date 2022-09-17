package de.simles.tracktime.models

import java.time.LocalDate
import scala.collection.immutable

final case class Project(
    projectId: String,
    name: String,
    jobNumbers: Seq[JobNumber],
    isActive: Boolean,
    isChargeable: Boolean
) {
  def addJobNumber(jobNumber: JobNumber): Project = Project(
    projectId,
    name,
    jobNumbers :+ jobNumber,
    isActive,
    isChargeable
  )

  def toggleActive: Project = Project(
    projectId,
    name,
    jobNumbers,
    !isActive,
    isChargeable
  )
}

final case class JobNumber(
    jobNumber: String,
    startDate: Option[LocalDate],
    endDate: Option[LocalDate]
)
