const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require("body-parser")
const fetcher = require('express-param');

const {
  MongoClient
} = require('mongodb');
const uri = "mongodb+srv://******:*******@cluster0.4pex9.mongodb.net/users?retryWrites=true&w=majority";
const mongoose = require('mongoose');
mongoose.connect(uri);

const User = mongoose.model('user', {
  username: String,
  log: Array,
  count: Number
});

app.use(fetcher())


app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});



app.post("/api/users/:_id/exercises",(req,res,next)=>{

  let userId = req.params._id
  let description = req.body.description
  let duration = parseInt(req.body.duration)
  
  
  //console.log(req.body.date)
if (!req.body.date){
    date = new Date().toDateString()
  } else {
    date = new Date(req.body.date).toDateString()
  }

  //console.log(date)


  const expObj = {
    description,
    duration,
    date
  }

  User.findByIdAndUpdate(
    userId,
    {$push:{log:expObj}},
    {new:true},
    (err,updatedUser)=>{
      if(err) {
        console.log('update error:',err);
        return res.json('update error:', err);
      }
      
      let returnObj ={
        "_id":userId,
        "username":updatedUser.username,
        "date":expObj.date,
        "duration":parseInt(expObj.duration),"description":expObj.description
      }
      console.log(returnObj)
      return res.json(returnObj)
    }
  )  
})




app.post("/api/users", (req, res) => {
  var username = req.body.username

  const userx = new User({
    username: username
  });

  userx.save()

  res.json({ "_id": userx.id, "username": userx.username })


})

app.get("/api/users", (req, res) => {

  var users = []

  User.find({}, (err, result) => {
    result.forEach(user => {
      users.push({ "_id": user._id, "username": user.username })
    })
    res.send(users)
  })




})

app.get("/api/users/:_id/logs", (req, res) => {
  console.log(req.url)
  let optParams =["from","to","limit"]
  let id=["_id"]
  
  let options = req.fetchParameter(id,optParams);
  console.log(options)
  User.findById(req.params._id,(err, response) => {
    let count = response.log.length
    let limit=parseInt(options.limit)
    console.log(count)
    let newLogSliced=[]
    if(options.from && options.to){
      
      let fromDate=new Date(options.from).getTime()
      let toDate=new Date(options.to).getTime()
      let newLog=[]
      
      console.log("FROM : " + fromDate + "  TO : " +toDate)
      response.log.forEach(exercise=>{
        let comparisonDate=new Date(exercise.date).getTime()
        console.log(comparisonDate)
        if(comparisonDate>=fromDate && comparisonDate<=toDate){
          newLog.push({"description":exercise.description,"duration":exercise.duration,"date":exercise.date})
        }   

      })
      console.log("HEREEEEEEE limit ",limit)
      if(limit){
        newLogSliced=newLog.slice(0,limit)
      }else{
        newLogSliced=newLog
      }
      console.log(newLogSliced)
      res.json({"username":response.username,"count":count,"_id":response._id,"log":newLogSliced})
      var check={"username":response.username,"count":count,"_id":response._id,"log":newLogSliced}
      console.log("REQ LIM ----",options ,"RES LIM-------- ",check,"------- END RES LIM")
    }else{
    console.log("HEREEEEEEE limit ",limit)
    if(limit){
      newLogSliced=response.log.slice(0,limit)
    }else{
      newLogSliced=response.log
    }
    res.json({"username":response.username,"count":count,"_id":response._id,"log":newLogSliced})}

    var check2={"username":response.username,"count":count,"_id":response._id,"log":newLogSliced}

    console.log("RES LIM-------- ",check2,"------- END RES LIM")
  })
  
  




})

app.get("/api/delete", (req, res) => {

  User.deleteMany({}, {}, (err, response) => {
    if (err) {
      console.log(err);
    } else {

      res.send("DELETED SUCCESFULLY")
    }

  })


})

app.get("/api/getall", (req, res) => {

  User.find({}, (err, response) => {
    res.send(response)
  })



})


const listener = app.listen(3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
