#!/bin/sh
echo "Build and Deploy for Win"
git add . 
git commit -m "Build and Deploy for Win"
git push origin master

npm version patch

git add . 
git commit -m "Bumb version"
git push origin master

rm -R ./build
npm run dist

PACKAGE_VERSION=$(grep '"version":' package.json | cut -d\" -f4)

scp './build/alphaville-erp-zap_'$PACKAGE_VERSION'.exe' root@191.252.219.73:/root/delore-erp-srv/www/site/downloads

echo "Finish"