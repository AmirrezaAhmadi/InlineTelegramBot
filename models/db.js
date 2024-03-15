const mongoose = require('mongoose');
const config = require('config');

mongoose.connect(config.get("URL"))
.then( ()=> 
    console.log("connected to DataBase")
    )
.catch((error)=>(
    console.log ("failed to connect to DataBase")
))

const fileSchema = new mongoose.Schema({
  url : {type: String , required :true},
  title : {type: String , required :true}
})
const Db = mongoose.model("Gif", fileSchema);

module.exports = Db ;