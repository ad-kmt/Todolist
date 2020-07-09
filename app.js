//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

const day = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];



mongoose.connect("mongodb+srv://ad_kmt:kmt@16117006@cluster0.ljxdy.mongodb.net/todolist", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Web Development"
});

const item2 = new Item({
  name: "Algorithmic Toolbox"
});

const item3 = new Item({
  name: "Convolutional Neural Net"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, function(err, result) {

    if (result.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added the default items.");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: result
      });
    }
  });
});

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listTitle = req.body.list;

  const addItem = new Item({
    name: itemName
  });

  if(listTitle === day){
    addItem.save(function(err){
      if(!err){
        res.redirect("/");
      }
    });

  } else{

    List.findOne({name: listTitle}, function(err, foundList){
      //console.log(foundList);
      foundList.items.push(addItem);
      foundList.save(function(err){
        if(!err){
          res.redirect("/"+listTitle);
        }
      });
    });
  }

});

app.post("/delete", function(req, res){

  const currentItemID = req.body.checkbox;
  const listName = req.body.listTitle;

  if(listName === day){
    Item.remove({ _id: currentItemID }, function(err) {
      if (err) {
        console.log(err);
      }
      else {
        console.log("Successfully removed item: " + currentItemID);
      }
    });
    res.redirect("/");
  } else{

    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: currentItemID}}}, function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }
});


app.get("/:customListName", function(req, res){

  customListName = _.capitalize(req.params.customListName);

  // console.log(customListName);

  List.findOne({name: customListName}, function(err, foundList) {

    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save(function(err){
        if(!err){
          res.redirect("/" + customListName);
        }
      });

    } else {
      //console.log("already exists");

      res.render("list",{
        listTitle: foundList.name,
        newListItems: foundList.items
      });
    }

  });

});

// app.get("/work", function(req, res) {
//   res.render("list", {
//     listTitle: "Work List",
//     newListItems: workItems
//   });
// });

app.get("/about", function(req, res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server started on port 3000");
});
