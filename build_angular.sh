cd angular || exit
ng build
rm -rf ../src/main/java/resources/public
cp -r ../dist/calendar/browser src/main/java/resources/public
