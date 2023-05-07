# EXPOSED PRIVATE KEY WARNING
I must say im (potencialy) impressed by you (potencialy) ariving to my repo looking for private keys. I (potencialy) admire your skill, but i must inform you that this private keys are not in use. In fact the software I'm posting here is a proof of concept to exploit hypotheticaly exposed private keys
# Midnight

This here software is a Man In The Middle (MITM) suite with ssl spoofing capabilities. MITM attacks are an old concept, but ive never seen a suite that supports DNS and SSL spoofing where the attack is descrived using javascript. (DHCP spoofing support may be comming soon).

First of all, DO NOT USE midnight in the wild. It can easily and unknowingly intercept data you are not allowed to intercept if you dont understand whats going on. In fact if you are found intercepting such data it will be most certainly a crime. Please, please, please, don't. 

This doesn't mean you cant use it nowhere. Its perfectly ok (*)(**) to intercept trafic if you are the legitimate recipient. Midnight can remove adds from websites, help you see what your apps are sending or recieving, act as an IDS, record automaticaly your activity, etc...

(*) DO NOT mess with DRM protected or copyrightable content. If you have legitimate access to it you will have probably agreed to a copyright contract, wich you need to follow. Be aware of the terms and conditions of your apps.

(**) Apps will use secure ways to transfer important data. Using midnight the security of the conection will be unharmed, but the data will get stored insecurely on your computer, wich is another way attackers can get ahold of it. 

Have a look at the already existing configuration at "/config.js" to see how to design your own attacks.

# Startup tutorial

I will talk about the attacker's machine and the victim's machine, but they can be the same computer.
## 1
On the attacker's machine clone the repo, optionaly execute "npm install" to update dependencies, and run "node main.js" (bash and openssl must be installed and on the PATH variable).

## 2
Change the IP of the victim's DNS provider to use the IP of the attacker's machine. On linux modify the configuration with "sudo nano /etc/resolv.conf". Otherwise look up a tutorial if the victim is not a linux.

## 3 (optional, if you want ssl spoofing)
install the certificate of the CA in the victims computer (browser or OS, depending on what you want to capture and the OS). Look up a tutorial.

Congratulations, you are done! Try opening "example.com" on your computer and if everyting is OK you will see the attack in action.

# cheatsheet about stuff Ive needed while developing

## fichero de configuracion de DNS:
sudo nano /etc/resolv.conf

## comando de test
wget --ca-certificate=./ssl/certs/ca/ca-cert.pem -Okk --post-data="Buenas tardes soy el segmento post" https://example.com/?arg=soy_el_segmento_get

## windows port forwarding para wsl/docker (run as admin)
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=80 connectaddress=172.18.176.184
netsh interface portproxy add v4tov4 listenport=443 listenaddress=0.0.0.0 connectport=443 connectaddress=172.18.176.184
netsh interface portproxy add v4tov4 listenport=53 listenaddress=0.0.0.0 connectport=53 connectaddress=172.18.176.184

netsh interface portproxy delete v4tov4 listenport=80 listenaddress=0.0.0.0 
netsh interface portproxy delete v4tov4 listenport=443 listenaddress=0.0.0.0 
netsh interface portproxy delete v4tov4 listenport=53 listenaddress=0.0.0.0 

## windows dns (run as admin)

netsh interface ipv4 show config

[win+r] ipconfig /flushdns

netsh interface ipv4 set dns name="WiFi" static 192.168.1.30
nslookup example.com
curl example.com
netsh interface ip delete dnsservers "WiFi" all


## DNS de la ucm:
147.96.1.9

## directiva de inspecion de certificado para firefox

about:certificate?cert=

## regenerate CA 

bash ssl/build_ca.sh ssl

## sign server

bash ssl/build_server.sh [domain] ssl

## check integrity


openssl pkey -pubout -in ssl/certs/general/key.pem | openssl sha256
openssl req -pubkey -in ssl/certs/servers/[domain]/csr.pem -noout | openssl sha256
openssl x509 -pubkey -in ssl/certs/servers/[domain]/cert.pem -noout | openssl sha256

openssl req -pubkey -in ssl/certs/servers/example.com/csr.pem -noout | openssl sha256
openssl x509 -pubkey -in ssl/certs/servers/example.com/cert.pem -noout | openssl sha256
