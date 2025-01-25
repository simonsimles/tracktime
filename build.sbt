lazy val akkaHttpVersion = "10.2.10"
lazy val akkaVersion = "2.6.20"

// Run in a separate JVM, to make sure sbt waits until all threads have
// finished before returning.
// If you want to keep the application running while executing other
// sbt tasks, consider https://github.com/spray/sbt-revolver/
fork := true

lazy val buildUi = taskKey[Unit]("Build UI")

lazy val root = (project in file("."))
  .settings(
    Compile / unmanagedResourceDirectories += baseDirectory.value / "ui" / "build",
    assembly / mainClass := Some("de.simles.tracktime.TracktimeApp"),
    assembly / assemblyJarName := "tracktime.jar",
    inThisBuild(
      List(
        organization := "de.simles",
        scalaVersion := "2.13.15"
      )
    ),
    buildUi := {
        import scala.sys.process._
        val p = Process(Seq("powershell", "npm", "run", "build"), file("ui")) !
    },
    Compile / copyResources := {
        val build = buildUi.value
        Compile / copyResources value
    },
    name := "tracktime",
    libraryDependencies ++= Seq(
      "com.typesafe.akka" %% "akka-http" % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-http-spray-json" % akkaHttpVersion,
      "com.typesafe.akka" %% "akka-actor-typed" % akkaVersion,
      "com.typesafe.akka" %% "akka-stream" % akkaVersion,
      "ch.qos.logback" % "logback-classic" % "1.2.3",
      "com.typesafe.akka" %% "akka-http-testkit" % akkaHttpVersion % Test,
      "com.typesafe.akka" %% "akka-actor-testkit-typed" % akkaVersion % Test,
      "org.scalatest" %% "scalatest" % "3.1.4" % Test
    )
  )
