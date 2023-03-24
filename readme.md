# fichero de configuracion de DNS:
sudo nano /etc/resolv.conf

# comando de test
wget --ca-certificate=./ssl/certs/ca/ca-cert.pem -Okk --post-data="Buenas tardes soy el segmento post" https://example.com/?arg=soy_el_segmento_get

# windows port forwarding para wsl/docker (run as admin)
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=172.18.176.184
netsh interface portproxy add v4tov4 listenport=443 listenaddress=0.0.0.0 connectport=443 connectaddress=172.18.176.184
netsh interface portproxy add v4tov4 listenport=53 listenaddress=0.0.0.0 connectport=53 connectaddress=172.18.176.184

netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0 
netsh interface portproxy delete v4tov4 listenport=443 listenaddress=0.0.0.0 
netsh interface portproxy delete v4tov4 listenport=53 listenaddress=0.0.0.0 

# windows dns (run as admin)

netsh interface ipv4 show config

[win+r] ipconfig /flushdns

netsh interface ipv4 set dns name="WiFi" static 192.168.1.30
nslookup example.com
curl example.com
netsh interface ip delete dnsservers "WiFi" all


# DNS de la ucm:
147.96.1.9

# directiva de inspecion de certificado para firefox

about:certificate?cert=