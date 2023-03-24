if [ ! -d "$2/certs/servers/$1/" ]; then
#create server.cnf
mkdir $2/certs/servers/$1/
cp $2/config/general_server.cnf $2/certs/servers/$1/server.cnf

echo "$1" >> $2/certs/servers/$1/server.cnf

#create signing request from server to CA
openssl req -new -config $2/certs/servers/$1/server.cnf -key $2/certs/general/key.pem -out $2/certs/servers/$1/csr.pem

#sign request
openssl x509 -req -in $2/certs/servers/$1/csr.pem -CA $2/certs/ca/ca-cert.pem -CAkey $2/certs/ca/ca-key.pem -CAcreateserial -out $2/certs/servers/$1/cert.pem -extensions req_ext -extfile $2/certs/servers/$1/server.cnf 
fi