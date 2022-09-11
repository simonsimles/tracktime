package de.simles.tracktime

import akka.actor.typed.ActorRef
import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.AskPattern._
import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import akka.http.scaladsl.server.Route
import akka.util.Timeout
import de.simles.tracktime.models.Project
import de.simles.tracktime.models.Work
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
        pathPrefix("project")(projectRoute),
        pathPrefix("work")(workRoute)
      )
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
    path(Segment) { projectId =>
      delete {
        onSuccess(projectRegistry.ask(DeleteProject(projectId, _))) { performed =>
          complete((StatusCodes.OK, performed))
        }
      }
    }
  )

  val workRoute: Route = concat(
    path(Segment) { weekDay =>
      concat(
        get {
          complete(workRegistry.ask(GetWorkWeek(LocalDate.parse(weekDay), _)))
        },
        post {
          entity(as[String]) { comment =>
            onSuccess(workRegistry.ask(AddWeekComment(LocalDate.parse(weekDay), comment, _))) {
              performed =>
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
