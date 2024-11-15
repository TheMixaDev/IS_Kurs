@echo off
cd angular
ng build
rmdir /s /q ..\src\main\java\resources\public
xcopy /e /i /q ..\dist\calendar ..\src\main\java\resources\public
