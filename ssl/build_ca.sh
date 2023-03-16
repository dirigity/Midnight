
#create CA certs
openssl req -new -x509 -days 9999 -config $SSL_PATH/config/ca.cnf -keyout $SSL_PATH/certs/ca/ca-key.pem -out $SSL_PATH/certs/ca/ca-cert.pem
#create server priv key
openssl genrsa -out $SSL_PATH/certs/general/key.pem 4096