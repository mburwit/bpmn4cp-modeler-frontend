#!/bin/sh

##################################
# Configuring the app using ENV  #
##################################

echo "### Configuring the app using ENV..."
# Make CONTEXT_PATH have one leading and no trailing slash and configure nginx#
CONTEXT_PATH="/$(echo $CONTEXT_PATH | sed -e 's#\(/*\)\(.*\)#\2#' | sed -e 's#/*$##')"

if [[ "${CONTEXT_PATH}" != "/" ]];
  then CONTEXT_PATH="${CONTEXT_PATH}/";
fi

# replace context path occurrences in built angular app
echo "Configuring Angular app for context path: ${CONTEXT_PATH}"
rm -R /usr/share/nginx/html
find /share/nginx/html/ -type f -exec sh -c 'mkdir -p "$(dirname /usr$1)" && envsubst "\${CONTEXT_PATH}" < "$1" > "/usr$1"' -- {} \;
envsubst < /share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js

if [[ "${CONTEXT_PATH}" != "/" ]];
  then
    mv /usr/share/nginx/html /usr/share/nginx/deployment
    mkdir /usr/share/nginx/html
    mv /usr/share/nginx/deployment /usr/share/nginx/html${CONTEXT_PATH}
fi