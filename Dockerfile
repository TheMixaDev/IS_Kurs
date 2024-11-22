FROM openjdk:17-jdk-slim
COPY ./ /usr/src/app
WORKDIR /usr/src/app
ENTRYPOINT ["java","-jar","./target/calendar-0.0.1-SNAPSHOT.jar"]