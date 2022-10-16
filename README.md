# biofeedback.ant.net.uy

This repository corresponds to BIOFEEDBACK-JAM exhibition 
Recieves in real time OSC data and changes visuales in function of the values of frequencies corresponding to Muse S headband. 

It is a javascript server that uses Hydra to show visuals  

# Install

Install npm and the following dependencies 

```bash
npm install express -S 
npm install socket.io -S
npm install osc - S
npm install socket.io-client -S
``` 

# Start server

```bash 
	export PORT=8080
	npm start 
``` 

Open web browser at  [http://localhost:8080/](http://localhost:8080/)

If you want to open another instance, just execute the same command with other port 

