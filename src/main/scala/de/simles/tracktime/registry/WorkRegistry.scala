package de.simles.tracktime.registry

import akka.actor.typed.ActorRef
import akka.actor.typed.Behavior
import akka.actor.typed.scaladsl.Behaviors
import de.simles.tracktime.models._

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.time.LocalDate
import java.time.temporal.WeekFields

object WorkRegistry extends AbstractRegistry {
  sealed trait WorkCommand
  final case class GetWorkWeek(weekDay: LocalDate, replyTo: ActorRef[Option[WorkWeek]])
      extends WorkCommand
  final case class GetWorkForWeek(
      weekDay: LocalDate,
      replyTo: ActorRef[Seq[Work]]
  ) extends WorkCommand
  final case class AddOrUpdateWork(work: Work, replyTo: ActorRef[Work]) extends WorkCommand
  final case class DeleteWork(work: Work, replyTo: ActorRef[Work]) extends WorkCommand
  final case class AddWeekComment(
      weekDay: LocalDate,
      comment: String,
      replyTo: ActorRef[WorkWeek]
  ) extends WorkCommand

  import de.simles.tracktime.JsonFormats._
  def apply(): Behavior[WorkCommand] = Behaviors.receiveMessage {
    case GetWorkWeek(weekDay, replyTo) =>
      replyTo ! readFile[WorkWeek](getFolderForWeek(weekDay))
      Behaviors.same
    case GetWorkForWeek(weekDay, replyTo) =>
      replyTo ! readFile[WorkWeek](getFolderForWeek(weekDay)).map(_.work).getOrElse(Seq.empty)
      Behaviors.same
    case AddOrUpdateWork(work, replyTo) =>
      val workWeek = readFile[WorkWeek](getFolderForWeek(work.date))
        .getOrElse(WorkWeek(WorkWeek.getWeekNumber(work.date), None, Seq.empty))
      val otherWork = workWeek.work.filterNot(_.id == work.id)
      val newWork = if (!workWeek.work.exists(_.id == work.id)) {
        work.withId(otherWork.maxBy(_.id).id + 1)
      } else { work }
      writeFile(
        workWeek.withWork(otherWork :+ newWork),
        getFolderForWeek(work.date)
      )
      replyTo ! newWork
      Behaviors.same
    case DeleteWork(work, replyTo) =>
      val workWeek = readFile[WorkWeek](getFolderForWeek(work.date))
        .getOrElse(WorkWeek(WorkWeek.getWeekNumber(work.date), None, Seq.empty))
      writeFile(
        workWeek.withWork(workWeek.work.filterNot(_.id == work.id)),
        getFolderForWeek(work.date)
      )
      replyTo ! work
      Behaviors.same
    case AddWeekComment(weekDay, comment, replyTo) =>
      val newWorkWeek =
        readFile[WorkWeek](getFolderForWeek(weekDay))
          .getOrElse(WorkWeek(WorkWeek.getWeekNumber(weekDay), None, Seq.empty))
          .withComment(comment)
      writeFile(
        newWorkWeek,
        getFolderForWeek(weekDay)
      )
      replyTo ! newWorkWeek
      Behaviors.same
  }

  def getFolderForWeek(date: LocalDate): String = {
    val directory = "work"
    val year = f"${date.getYear()}%04d"
    val week = f"${WorkWeek.getWeekNumber(date)}%02d"
    return Paths.get(directory, year, week).toString()
  }
}
