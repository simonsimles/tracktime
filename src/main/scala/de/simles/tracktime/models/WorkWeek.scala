package de.simles.tracktime.models

import java.time.LocalDate
import java.time.temporal.WeekFields
import spray.json.DefaultJsonProtocol

case class WorkWeek(weekNumber: Int, comment: Option[String], work: Seq[Work]) {
  def withWork(newWork: Seq[Work]): WorkWeek =
    WorkWeek(weekNumber, comment, newWork)
  def withComment(newComment: String): WorkWeek =
    WorkWeek(weekNumber, Some(newComment), work)
}

object WorkWeek extends ((Int, Option[String], Seq[Work]) => WorkWeek) {
  def getWeekNumber(date: LocalDate): Int =
    date.get(WeekFields.ISO.weekOfYear())
}
