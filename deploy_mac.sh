#!/bin/sh
echo "Build and Deploy for Mac"
git add . 
git commit -m "Build and Deploy for Mac"
git push origin main

npm version patch

git add . 
git commit -m "Bumb version"
git push origin main

rm -R ./build
npm run dist

PACKAGE_VERSION=$(grep '"version":' package.json | cut -d\" -f4)

git push origin '$PACKAGE_VERSION'

scp './build/alphaville-erp-zap_'$PACKAGE_VERSION'.dmg' root@191.252.219.73:/root/delore-erp-srv/www/site/downloads

echo "Finish"