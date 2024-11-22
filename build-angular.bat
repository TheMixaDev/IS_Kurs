cmd /c "cd angular && npm i"
cmd /c "cd angular && ng build"
cmd /c "rd /s /q src\main\resources\public"
cmd /c "xcopy angular\dist\calendar\browser src\main\resources\public /s /e /h"
