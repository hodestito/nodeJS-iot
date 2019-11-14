var express = require('express');
var app = express();
const { Board, Proximity } = require("johnny-five");
var five = require('johnny-five');
const board = new Board();

var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://test.mosquitto.org')

var led;
var ocupada;
var anterior;


board.on("ready", () => {
    led = new five.Led(10);
    const proximity = new Proximity({
        controller: "HCSR04",
        pin: 7
    });


    proximity.on("change", () => {
        const { centimeters, inches } = proximity;
        console.log("Proximity: ");
        console.log("  cm  : ", centimeters);
        console.log("  in  : ", inches);
        console.log("-----------------");
        anterior = ocupada;
        if (centimeters < 5) {
            led.off();
            ocupada = "Ocupada";
            
        } else {
            led.on();
            ocupada = "Livre";
        }
        if (anterior != ocupada){
            client.publish('presence29', ocupada);
        }
    });

    app.get('/', function (req, res) {
        res.send('A vaga está ' + ocupada);
    });

    app.listen(3000, function() {
        console.log('App listening!')
    });

    client.on('connect', function () {
        console.log('MQTT OK')
    })

    client.on('message', function (topic, message) {
        // message is Buffer
        console.log(message.toString())
        client.end()
    })

});