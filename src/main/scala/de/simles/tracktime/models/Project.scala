package de.simles.tracktime.models

import java.time.LocalDate
import scala.collection.immutable

final case class Project(
    projectId: String,
    name: String,
    jobNumbers: Seq[JobNumber],
    isActive: Boolean
) {
  def addJobNumber(jobNumber: JobNumber): Project = Project(
    projectId,
    name,
    jobNumbers :+ jobNumber,
    isActive
  )

  def toggleActive: Project = Project(
    projectId,
    name,
    jobNumbers,
    !isActive
  )
}

final case class JobNumber(
    jobNumber: String,
    startDate: Option[LocalDate],
    endDate: Option[LocalDate]
)
