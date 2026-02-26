This project is a time tracker with two components:
- a backend written in Scala using akka-http, located in the main src directory,
- a frontend written in React using TypeScript, located in the ui subdirectory.

The frontend and backend are separate and communicate via HTTP requests.
The backend is built using sbt, and the sbt assembly copies in the ui build artifacts.
The ui is built using npm.
