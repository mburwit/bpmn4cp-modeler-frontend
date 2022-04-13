#!/bin/sh

function autogenerate_keystores() {
  local CERTS_PATH="/etc/nginx/ssl"
  local X509_CRT="tls.crt"
  local X509_KEY="tls.key"

  # if no cert provided, create key and self-signed cert
    if [ ! -f "${CERTS_PATH}/${X509_CRT}" ] || [ ! -f "${CERTS_PATH}/${X509_KEY}" ]; then
    echo "No server certificate information specified. Generating key and self-signed cert.."
    mkdir -p "${CERTS_PATH}"
    openssl req -new -newkey rsa:4096 -days 730 -nodes -x509 \
    -subj "/C=DE/ST=Saxony/L=Dresden/O=TUDresden/OU=HeLiCT/CN=${HOST}" \
    -keyout "${CERTS_PATH}/${X509_KEY}" \
    -out "${CERTS_PATH}/${X509_CRT}"
    echo "...Done!"
  fi
}

autogenerate_keystores
