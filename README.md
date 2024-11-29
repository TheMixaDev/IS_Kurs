# Курсовая работа по информационным системам.

Сдана: 23.11.2024 на максимальный балл

Стек: Spring Boot + Angular

## Установка

1. Собрать angular (npm i && ng build) и перенести dist\calendar\browser в src\main\resources\public, либо запустить build-angular.bat на Windows
2. Скопировать src/main/resources/db_example.properties в db.properties
3. Установить зависимости с pom.xml и собрать бекенд с помощью maven
4. Запустить docker-compose up
5. Исполнить на коробке postgres скрипт src/main/resources/full.sql
6. Заменить пароли пользователей на 1234567 для получения доступа ко всем тестовым акканутам
   
   ```UPDATE users SET password = 'e13efc991a9bf44bbb4da87cdbb725240184585ccaf270523170e008cf2a3b85f45f86c3da647f69780fb9e971caf5437b3d06d418355a68c9760c70a31d05c7'```
7. Перезапустить докер и перейти на localhost
