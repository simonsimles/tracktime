# Tracktime

## Build
### Fat jar
`sbt assembly`

### Docker build
`docker build . -t tracktime`

`docker run -d --name tracktime -v ~/Documents/tracktime:/app/data -p 5555:9000 tracktime`


## Network binding

By default the server is configured to bind to the loopback interface (`127.0.0.1`) on port `9000`, so it is only reachable from the local machine. To make it listen on all interfaces (so it's reachable externally), change the bind address in `src/main/scala/de/simles/tracktime/TracktimeApp.scala` back to `0.0.0.0`.

