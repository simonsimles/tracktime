package de.simles.tracktime.models

import java.time.{LocalDate, LocalDateTime}
import scala.language.implicitConversions

case class Work(
    id: Int,
    date: LocalDate,
    project: String,
    period: Period,
    comment: Option[String]
) {
  def withId(newId: Int): Work = Work(newId, date, project, period, comment)
}

sealed trait Period {
  def getTimeString: String
}

case class IntervalPeriod(start: Time, end: Option[Time], pause: Option[Time])
    extends Period {
  override def getTimeString: String =
    (end.getOrElse(Time.now) - start - pause.getOrElse(Time(0, 0))).toString
}

case class AbsolutePeriod(time: Time) extends Period {
  override def getTimeString: String = time.toString
}

case class Time(hours: Int, minutes: Int) {
  override def toString: String = f"$hours%02d:$minutes%02d"

  def totalMinutes: Int = hours * 60 + minutes

  def -(otherTime: Time): Time = totalMinutes - otherTime.totalMinutes

  def +(otherTime: Time): Time = totalMinutes + otherTime.totalMinutes
}

object Time {
  def now: Time = {
    val timeNow = LocalDateTime.now()
    Time(timeNow.getHour, timeNow.getMinute)
  }

  private val StringPattern = "(\\d{0,2}):(\\d{0,2})".r

  implicit def fromInt(totalMinutes: Int): Time =
    Time(totalMinutes / 60, totalMinutes % 60)

  implicit def fromString(string: String): Time = string match {
    case StringPattern(hour, minute) =>
      Time(hour.toIntOption.getOrElse(0), minute.toIntOption.getOrElse(0))
    case _ => Time(0, 0)
  }
}
