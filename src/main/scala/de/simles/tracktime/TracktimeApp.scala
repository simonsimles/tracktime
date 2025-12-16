package de.simles.tracktime

import akka.actor.typed.ActorSystem
import akka.actor.typed.scaladsl.Behaviors
import akka.http.scaladsl.Http
import akka.http.scaladsl.server.Route
import akka.http.scaladsl.server.Directives._

import scala.util.Failure
import scala.util.Success
import de.simles.tracktime.registry.ProjectRegistry
import de.simles.tracktime.registry.WorkRegistry

object TracktimeApp {
  private def startHttpServer(routes: Route)(implicit system: ActorSystem[_]): Unit = {
    import system.executionContext
    val futureBinding = Http().newServerAt("127.0.0.1", 9000).bind(routes)
    futureBinding.onComplete {
      case Success(binding) =>
        val address = binding.localAddress
        system.log.info("Server online at http://{}:{}/", address.getHostString, address.getPort)
      case Failure(ex) =>
        system.log.error("Failed to bind HTTP endpoint, terminating system", ex)
        system.terminate()
    }
  }

  def main(args: Array[String]): Unit = {
    val rootBehavior = Behaviors.setup[Nothing] { context =>
      val projectRegistryActor = context.spawn(ProjectRegistry(), "ProjectRegistryActor")
      context.watch(projectRegistryActor)
      val workRegistryActor = context.spawn(WorkRegistry(), "WorkRegistryActor")
      context.watch(workRegistryActor)

      val routes = new Routes(projectRegistryActor, workRegistryActor)(context.system)
      startHttpServer(routes.apiRoutes ~ routes.assets)(context.system)

      Behaviors.empty
    }
    val system = ActorSystem[Nothing](rootBehavior, "HelloAkkaHttpServer")
  }
}
