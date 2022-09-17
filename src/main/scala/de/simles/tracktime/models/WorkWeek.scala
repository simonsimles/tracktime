package de.simles.tracktime.models

import java.time.LocalDate
import java.time.temporal.WeekFields
import spray.json.DefaultJsonProtocol

case class Week(year: Int, week: Int)

object Week extends ((Int, Int) => Week) {
  def fromDate(date: LocalDate) = Week(date.getYear(), date.get(WeekFields.ISO.weekOfYear()))
  def getWeekNumber(date: LocalDate): Int =
    date.get(WeekFields.ISO.weekOfYear())
}

case class WorkWeek(week: Week, comment: Option[String], work: Seq[Work]) {
  def withWork(newWork: Seq[Work]): WorkWeek =
    WorkWeek(week, comment, newWork)
  def withComment(newComment: String): WorkWeek =
    WorkWeek(week, Some(newComment), work)
}
