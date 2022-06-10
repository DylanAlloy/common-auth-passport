const   express             = require("express"),
        mongoose            = require("mongoose"),
        passport            = require("passport"),
        config              = require("./config.json")
const app = express();
mongoose.Promise = global.Promise;
mongoose.connect(config.db.url, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true
});
app.use(require('cookie-parser')());
app.use(express.json())
app.use(require('express-session')({
    secret: config.auth.params.sessionSecret,
    resave: true,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use("/",                require("./routes/index"))
app.use("/api",             require("./routes/api"))
/* Listening on the port specified in the config.json file. */
app.listen(config.servicePort,function(){
    console.log(`Now listening on ${config.servicePort}`)
})
