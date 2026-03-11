@echo off
set "JAVA_HOME=C:\Users\sahup\AppData\Roaming\Code\User\globalStorage\pleiades.java-extension-pack-jdk\java\17"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo JAVA_HOME set to %JAVA_HOME%
java -version
call mvn clean spring-boot:run
pause
