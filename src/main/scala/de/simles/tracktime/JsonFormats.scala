package de.simles.tracktime

import spray.json.DefaultJsonProtocol
import de.simles.tracktime.models._

import java.time.LocalDate
import spray.json.JsString
import spray.json.RootJsonFormat
import spray.json.JsValue
import spray.json.JsObject

object JsonFormats extends DefaultJsonProtocol {

  implicit object LocalDateFormat extends RootJsonFormat[LocalDate] {
    def write(date: LocalDate) = JsString(
      f"${date.getYear()}%04d-${date.getMonthValue()}%02d-${date.getDayOfMonth()}%02d"
    )

    def read(json: JsValue): LocalDate = json match {
      case JsString(value) => LocalDate.parse(value)
      case _               => LocalDate.of(9999, 99, 99)
    }
  }

  implicit object TimeFormat extends RootJsonFormat[Time] {
    def write(obj: Time): JsValue = JsString(obj.toString())
    def read(json: JsValue): Time = json match {
      case JsString(value) => value
      case _               => ""
    }
  }

  implicit object WeekFormat extends RootJsonFormat[Week] {
    val re = raw"(\d{4})-W(\d{2})".r
    def write(obj: Week): JsValue = JsString(f"${obj.year}%04d-W${obj.week}%02d")
    def read(json: JsValue): Week = json match {
      case JsString(re(year, week)) => Week(year.toInt, week.toInt)
      case _                        => Week(9999, 9)
    }
  }

  implicit val intervalPeriodFormat = jsonFormat3(IntervalPeriod)
  implicit val absolutePeriodFormat = jsonFormat1(AbsolutePeriod)

  implicit object PeriodFormat extends RootJsonFormat[Period] {
    def read(json: JsValue): Period = json match {
      case JsObject(fields) =>
        if (fields.contains("time")) absolutePeriodFormat.read(json)
        else intervalPeriodFormat.read(json)
      case _ => AbsolutePeriod(Time.now)
    }
    def write(obj: Period): JsValue = obj match {
      case IntervalPeriod(_, _, _) =>
        intervalPeriodFormat.write(obj.asInstanceOf[IntervalPeriod])
      case AbsolutePeriod(_) =>
        absolutePeriodFormat.write(obj.asInstanceOf[AbsolutePeriod])
    }
  }

  implicit val workFormat = jsonFormat5(Work)
  implicit val jobNumberFormat = jsonFormat3(JobNumber)
  implicit val projectFormat = jsonFormat5(Project)

  implicit val workWeekFormat = jsonFormat3(WorkWeek)
}
