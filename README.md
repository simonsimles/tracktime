# Tracktime

## Build
### Fat jar
`sbt assembly`

### Docker build
`docker build . -t tracktime`

`docker run -d --name tracktime -v ~/Documents/tracktime:/app/data -p 5555:9000 tracktime`


## Network binding

By default the server is configured to bind to the loopback interface (`127.0.0.1`) on port `9000`, so it is only reachable from the local machine.

To change the bind address, set the `TRACKTIME_HOST` environment variable. For example, to listen on all interfaces (so it's reachable externally):

```bash
TRACKTIME_HOST=0.0.0.0 sbt run
```

