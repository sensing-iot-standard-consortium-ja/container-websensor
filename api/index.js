const express = require("express");
const app = express();
const body = require("body-parser");
app.use(body.raw({ type: "*/*" }));

const kafkaHost = process.env.KAFKA_BROKER || "localhost:9092";
console.log(kafkaHost);
const kafka = require("kafka-node"),
  Producer = kafka.Producer,
  client = new kafka.KafkaClient({ kafkaHost }),
  producer = new Producer(client);
producer.on("ready", function() {
  console.log("connect to kafka cluster");
});
producer.on("error", function(err) {
  console.log("kafka client can't ready...");
  console.log("kafka cluster " + kafkaHost + " ");
});

app.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

app.post("/:topic/container", (req, res) => {
  const topic = req.params.topic;
  const messages = [req.body];
  const payloads = [{ topic, messages }];
  producer.send(payloads, err => {
    if (err) console.log(err);
  });
  res.end();
});

app.post("/:topic/json", (req, res) => {
  const topic = req.params.topic;
  const messages = [req.body];
  const payloads = [{ topic, messages }];
  producer.send(payloads, err => {
    if (err) console.log(err);
  });
  res.end();
});

module.exports = {
  path: "/api/",
  handler: app
};
