package de.simles.tracktime

import akka.actor.typed.ActorRef
import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.AskPattern._
import akka.http.scaladsl.model.ContentType
import akka.http.scaladsl.model.ContentTypeRange
import akka.http.scaladsl.model.HttpCharset
import akka.http.scaladsl.model.HttpCharsets
import akka.http.scaladsl.model.MediaType
import akka.http.scaladsl.model.MediaTypes
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route._
import akka.http.scaladsl.server.Route
import akka.util.Timeout
import de.simles.tracktime.models.Project
import de.simles.tracktime.models.Week
import de.simles.tracktime.models.Work
import de.simles.tracktime.models.WorkWeek
import de.simles.tracktime.registry.ProjectRegistry
import de.simles.tracktime.registry.ProjectRegistry._
import de.simles.tracktime.registry.WorkRegistry
import de.simles.tracktime.registry.WorkRegistry._

import java.time.LocalDate
import scala.concurrent.Future

class Routes(
    projectRegistry: ActorRef[ProjectRegistry.ProjectCommand],
    workRegistry: ActorRef[WorkRegistry.WorkCommand]
)(implicit val system: ActorSystem[_]) {
  import akka.http.scaladsl.marshallers.sprayjson.SprayJsonSupport._
  import JsonFormats._

  private implicit val timeout =
    Timeout.create(system.settings.config.getDuration("my-app.routes.ask-timeout"))

  val apiRoutes: Route =
    pathPrefix("api") {
      concat(
        pathPrefix("projects")(projectRoute),
        pathPrefix("work")(workRoute)
      )
    }

  def assets: Route = getFromResourceDirectory("ui") ~ pathPrefix("") {
    get {
      getFromResource(
        "ui/index.html",
        ContentType(MediaType.textWithFixedCharset("html", HttpCharsets.`UTF-8`))
      )
    }
  }

  val projectRoute: Route = concat(
    get {
      complete(projectRegistry.ask(GetProjects))
    },
    post {
      entity(as[Project]) { project =>
        onSuccess(projectRegistry.ask(AddOrUpdateProject(project, _))) { performed =>
          complete((StatusCodes.OK, performed))
        }
      }
    },
    (delete & path(Segment)) { projectId =>
      onSuccess(projectRegistry.ask(DeleteProject(projectId, _))) { performed =>
        complete((StatusCodes.OK, performed))
      }
    }
  )

  val workRoute: Route = concat(
    path(IntNumber / IntNumber) { (year, week) =>
      concat(
        (get & parameter("onlyWork")) { _ =>
          onSuccess(workRegistry.ask(GetWorkForWeek(Week(year, week), _))) { result =>
            complete(StatusCodes.OK, result)
          }
        },
        get {
          onSuccess(workRegistry.ask(GetWorkWeek(Week(year, week), _))) { result =>
            result match {
              case Some(w) => complete(StatusCodes.OK, w)
              case None    => complete(StatusCodes.NoContent)
            }
          }
        },
        post {
          entity(as[String]) { comment =>
            onSuccess(workRegistry.ask(AddWeekComment(Week(year, week), comment, _))) { performed =>
              complete((StatusCodes.OK, performed))
            }
          }
        }
      )
    },
    post {
      entity(as[Work]) { work =>
        onSuccess(workRegistry.ask(AddOrUpdateWork(work, _))) { performed =>
          complete((StatusCodes.OK, performed))
        }
      }
    }
  )
}
