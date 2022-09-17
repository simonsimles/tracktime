package de.simles.tracktime.registry

import akka.actor.typed.ActorRef
import akka.actor.typed.Behavior
import akka.actor.typed.scaladsl.Behaviors
import de.simles.tracktime.models._

import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

object ProjectRegistry extends AbstractRegistry {
  sealed trait ProjectCommand
  final case class GetProjects(replyTo: ActorRef[Seq[Project]]) extends ProjectCommand
  final case class GetProject(
      projectId: String,
      replyTo: ActorRef[Option[Project]]
  ) extends ProjectCommand
  final case class AddOrUpdateProject(
      project: Project,
      replyTo: ActorRef[Project]
  ) extends ProjectCommand
  final case class DeleteProject(projectId: String, replyTo: ActorRef[Option[Project]])
      extends ProjectCommand

  import de.simles.tracktime.JsonFormats._
  def apply(): Behavior[ProjectCommand] = Behaviors.receiveMessage {
    case GetProjects(replyTo) =>
      replyTo ! readFile[Seq[Project]]().getOrElse(Seq.empty)
      Behaviors.same
    case GetProject(id, replyTo) =>
      replyTo ! readFile[Seq[Project]]().getOrElse(Seq.empty).find(_.projectId == id)
      Behaviors.same
    case AddOrUpdateProject(project, replyTo) =>
      writeFile(
        readFile[Seq[Project]]()
          .getOrElse(Seq.empty)
          .filterNot(_.projectId == project.projectId) :+ project
      )
      replyTo ! project
      Behaviors.same
    case DeleteProject(projectId, replyTo) =>
      val projects = readFile[Seq[Project]]().getOrElse(Seq.empty)
      writeFile(projects.filterNot(_.projectId == projectId))
      replyTo ! projects.filter(_.projectId == projectId).lift(0)
      Behaviors.same
  }

  override def getFolder(): String = "projects"
}
