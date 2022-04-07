const express = require("express");
const app = express();
const body = require('body-parser');
app.use(body.raw({ type:'*/*' }));

const
    kafka = require('kafka-node'),
    Producer = kafka.Producer,
    KeyedMessage = kafka.KeyedMessage,
    client = new kafka.KafkaClient({kafkaHost: '127.0.0.1:9092'}),
    producer = new Producer(client)

app.get("/health", (req, res) => {
    res.send({ "status": "ok" });
});

app.post("/:topic/container", (req, res) => {
    const topic = req.params.topic
    const messages = [req.body]
    const payloads = [
        { topic, messages }
    ]
    producer.send(payloads,(err) => {
        if (err)
            console.log(err);
    });
    res.end()
});

app.post("/:topic/json", (req, res) => {
    const topic = req.params.topic
    const messages = [req.body]
    const payloads = [
        { topic, messages }
    ]
    producer.send(payloads,(err) => {
        if (err)
            console.log(err);
    });
    res.end()
});

module.exports = {
    path: "/api/",
    handler: app
};