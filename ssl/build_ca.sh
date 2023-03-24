#create CA files
openssl req -x509 -config $1/config/ca.cnf -days 365 -newkey rsa:4096 -sha256 -nodes -keyout $1/certs/ca/ca-key.pem -out $1/certs/ca/ca-cert.pem

#create server priv key
openssl genrsa -out $1/certs/general/key.pem 4096