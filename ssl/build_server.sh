if [ ! -d "$SSL_PATH/certs/servers/$1/" ]; then
#create server.cnf
mkdir $SSL_PATH/certs/servers/$1/
cp $SSL_PATH/config/general_server.cnf $SSL_PATH/certs/servers/$1/server.cnf

echo "$1" >> $SSL_PATH/certs/servers/$1/server.cnf

#create signing request from server to CA
openssl req -new -config $SSL_PATH/certs/servers/$1/server.cnf -key $SSL_PATH/certs/general/key.pem -out $SSL_PATH/certs/servers/$1/csr.pem
#sign request
openssl x509 -req -extfile $SSL_PATH/certs/servers/$1/server.cnf -days 999 -passin "pass:password" -in $SSL_PATH/certs/servers/$1/csr.pem -CA $SSL_PATH/certs/ca/ca-cert.pem -CAkey $SSL_PATH/certs/ca/ca-key.pem -CAcreateserial -out $SSL_PATH/certs/servers/$1/cert.pem
fi