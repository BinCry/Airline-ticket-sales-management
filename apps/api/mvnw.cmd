@echo off
setlocal
set "MVNW_DIR=%~dp0"
if "%MVNW_DIR:~-1%"=="\" set "MVNW_DIR=%MVNW_DIR:~0,-1%"
set "WRAPPER_JAR=%MVNW_DIR%\.mvn\wrapper\maven-wrapper.jar"

if not exist "%WRAPPER_JAR%" (
  echo Khong tim thay maven-wrapper.jar trong .mvn\wrapper.
  exit /b 1
)

if defined JAVA_HOME (
  set "JAVA_EXE=%JAVA_HOME%\bin\java.exe"
) else (
  set "JAVA_EXE=java"
)

"%JAVA_EXE%" "-Dmaven.multiModuleProjectDirectory=%MVNW_DIR%" -classpath "%WRAPPER_JAR%" org.apache.maven.wrapper.MavenWrapperMain %*
