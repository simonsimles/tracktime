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
  final case class GetWorkWeek(week: Week, replyTo: ActorRef[Option[WorkWeek]])
      extends WorkCommand
  final case class GetWorkForWeek(
      week: Week,
      replyTo: ActorRef[Seq[Work]]
  ) extends WorkCommand
  final case class AddOrUpdateWork(work: Work, replyTo: ActorRef[Work]) extends WorkCommand
  final case class DeleteWork(work: Work, replyTo: ActorRef[Work]) extends WorkCommand
  final case class AddWeekComment(
      week: Week,
      comment: String,
      replyTo: ActorRef[WorkWeek]
  ) extends WorkCommand

  import de.simles.tracktime.JsonFormats._
  def apply(): Behavior[WorkCommand] = Behaviors.receiveMessage {
    case GetWorkWeek(week, replyTo) =>
      replyTo ! readFile[WorkWeek](getFolderForWeek(week))
      Behaviors.same
    case GetWorkForWeek(week, replyTo) =>
      replyTo ! readFile[WorkWeek](getFolderForWeek(week)).map(_.work).getOrElse(Seq.empty)
      Behaviors.same
    case AddOrUpdateWork(work, replyTo) =>
      val workWeek = readFile[WorkWeek](getFolderForWeek(work.date))
        .getOrElse(WorkWeek(Week.fromDate(work.date), None, Seq.empty))
      val otherWork = workWeek.work.filterNot(_.id == work.id)
      val newWork = if (!workWeek.work.exists(_.id == work.id)) {
        work.withId((if (otherWork.isEmpty) 0 else otherWork.maxBy(_.id).id) + 1)
      } else { work }
      writeFile(
        workWeek.withWork(otherWork :+ newWork),
        getFolderForWeek(work.date)
      )
      replyTo ! newWork
      Behaviors.same
    case DeleteWork(work, replyTo) =>
      val workWeek = readFile[WorkWeek](getFolderForWeek(work.date))
        .getOrElse(WorkWeek(Week.fromDate(work.date), None, Seq.empty))
      writeFile(
        workWeek.withWork(workWeek.work.filterNot(_.id == work.id)),
        getFolderForWeek(work.date)
      )
      replyTo ! work
      Behaviors.same
    case AddWeekComment(week, comment, replyTo) =>
      val newWorkWeek =
        readFile[WorkWeek](getFolderForWeek(week))
          .getOrElse(WorkWeek(week, None, Seq.empty))
          .withComment(comment)
      writeFile(
        newWorkWeek,
        getFolderForWeek(week)
      )
      replyTo ! newWorkWeek
      Behaviors.same
  }

  def getFolderForWeek(date: LocalDate): String = getFolderForWeek(Week.fromDate(date))

  def getFolderForWeek(weekForFolder: Week): String = {
    val directory = "work"
    val year = f"${weekForFolder.year}%04d"
    val week = f"${weekForFolder.week}%02d"
    return Paths.get(directory, year, week).toString()
  }
}
