package de.simles.tracktime.registry

import java.nio.file.Files
import java.nio.file.Paths
import java.nio.file.Path
import java.time.Instant
import spray.json.JsonParser
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import java.io.File

abstract class AbstractRegistry {
  def getBaseFolder(): String = "data"
  def getFolder(): String = ???

  def getMostRecentFile(folder: String): Option[Path] = {
    import scala.jdk.CollectionConverters._
    val fullFolder: Path = new File(getBaseFolder()).toPath().resolve(folder)
    Files.createDirectories(fullFolder)
    LoggerFactory.getLogger(this.getClass()).info(f"Trying to read $fullFolder")
    return Files
      .list(fullFolder)
      .iterator()
      .asScala
      .toSeq
      .filter(_.getFileName.toString.matches("""\d{15}\.json$"""))
      .maxByOption(_.getFileName.toString)
  }

  def getNewFile(folder: String): Path =
    Paths.get(getBaseFolder(), folder, f"${Instant.now().toEpochMilli()}%015d.json")

  import spray.json._

  def readFile[A](folder: String = getFolder())(implicit reader: JsonReader[A]): Option[A] =
    getMostRecentFile(folder).map(Files.readString(_)).map(JsonParser(_).convertTo[A])

  def writeFile[A](obj: A, folder: String = getFolder())(implicit
      writer: JsonWriter[A]
  ) = Files.writeString(getNewFile(folder), obj.toJson.compactPrint)
}
