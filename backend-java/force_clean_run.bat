@echo off
set "JAVA_HOME=C:\Users\sahup\AppData\Roaming\Code\User\globalStorage\pleiades.java-extension-pack-jdk\java\17"
set "PATH=%JAVA_HOME%\bin;%PATH%"
echo JAVA_HOME set to %JAVA_HOME%
echo forcing clean build...
call mvn clean
echo starting application...
call mvn spring-boot:run
pause
