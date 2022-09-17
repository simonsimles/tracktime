FROM amazoncorretto:11
COPY target/scala-2.13/tracktime.jar /app/tracktime.jar
RUN mkdir /app/data
WORKDIR /app
CMD java -jar /app/tracktime.jar
