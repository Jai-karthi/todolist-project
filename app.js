//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const { default: mongoose } = require("mongoose");
const { functions, functionsIn } = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb+srv://admin-jaikarthi:1974@cluster0.ruqvomy.mongodb.net/todolistDB",{useNewUrlParser:true});
mongoose.connect('mongodb://localhost:27017/test');

const itemschema = {
  name: String

};
const Item = mongoose.model("Item",itemschema);

const item1= new Item({
  name:"welcome to your todolist!"
});
const item2= new Item({
  name:"Hit the + button to add a new item."
});
const item3= new Item({
  name:"<--- Hit this delete an item."
});


const defaultItems = [item1,item2,item3];

// Item.insertMany(defaultItems).then(function () {
//        console.log("Successfully saved defult items to DB");
// }).catch(function (err) {
//   console.log(err);
// });

const listschema ={
  name:String,
  items : [itemschema]

}

const List = mongoose.model("List",listschema);

app.get("/", function(req, res) {

  Item.find({}).then(function(foundItems){
    if (foundItems.length === 0){
      Item.insertMany(defaultItems).then(function () {
        console.log("Successfully saved defult items to DB");
        }).catch(function (err) {
           console.log(err);
        });
        res.redirect("/")
    }else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }    
    })

});

app.get("/:customlistname",function(req,res){
  const customlistname = _.capitalize(req.params.customlistname);
  List.findOne({name:customlistname })
  .exec()
  .then(foundList => {
    res.render("list",{listTitle: foundList.name, newListItems: foundList.items})
  })
  .catch(err => {

      const list = new List({
        name:customlistname,
        items:defaultItems
      })
      list.save();
      res.redirect("/" + customlistname)
    })
    // Handle the error
});


app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name : itemname
  })

  if (listname == "Today"){
    item.save()
    res.redirect("/")
  }else{
    List.findOne({name:listname}).exec().then(foundList => {
      foundList.items.push(item)
      foundList.save()
      res.redirect("/"+listname)
    })
  }
});

app.post("/delete",function(req,res){
  const checkeditemid = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === "Today"){
    Item.findByIdAndRemove(checkeditemid)
    .then(() =>{
        console.log('successfully  been deleted')
        res.redirect("/")
    })
    .catch(err=>{List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkeditemid}}},{ new: true }).then(()=>{
      res.redirect("/"+listName );
  }).catch(err=>{
    res.redirect("/" + listName)
  })})
}}
)

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
