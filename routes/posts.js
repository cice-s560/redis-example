const express = require("express");
const axios = require("axios");
const router = express.Router();
const PostModel = require("../models/post");
// REDIS
const redisUrl = process.env.REDIS_URL || "localhost";
const redisPort = process.env.REDIS_PORT || "6379";

const redis = require("redis");
const redisClient = redis.createClient({
  url: `redis://${redisUrl}:${redisPort}`
});

function cacheMiddleware(req, res, next) {
  const context = req.baseUrl;

  redisClient.get(context, async (err, values) => {
    if (err) throw err;

    if (values) {
      console.log("Devuelvo cacheados --->");
      return res.status(304).json({ posts: JSON.parse(values) });
    }

    next();
  });
}

router.get("/", cacheMiddleware, async (req, res) => {
  console.log("Tengo que pedir los datos :(");

  const allPosts = await PostModel.find({}).exec();

  // lo que recibo, lo guardo en cache, para ahorrar peticiones en el futuro
  // .set() guarda en caché sin límite de tiempo. Debo invalidar caché amnualmente cuando quiera limpiarla
  // .setex() que actua como .get() pero acepta un param de tiempo de expiración en segundos
  redisClient.setex("/posts", 10, JSON.stringify(allPosts), err => {
    if (err) throw err;

    res.status(200).send({ posts: allPosts });
  });
});

router.get("/generateposts", async (req, res) => {
  axios("https://jsonplaceholder.typicode.com/posts")
    .then(data => {
      data.data.forEach(async item => {
        const post = new PostModel({
          userId: item.userId.toString(),
          title: item.title,
          body: item.body
        });

        await post.save();
      });

      return Promise.resolve();
    })
    .then(() => {
      res.status(201).send("Todo creado");
    });
});

module.exports = router;
