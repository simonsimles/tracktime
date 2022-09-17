# Tracktime

## Build
### Fat jar
`sbt assembly`

### Docker build
`docker build . -t tracktime`

`docker run -d --name tracktime -v ~/Documents/tracktime:/app/data -p 5555:9000 tracktime`

