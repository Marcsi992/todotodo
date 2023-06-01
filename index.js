//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");


const app = express();
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', false);
const connectDB = async ()=> {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://GKM:gi0iXYK5WvZ9VkIp@cluster0.hqufiyk.mongodb.net/todolistDB');

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item ({
  name: "Welcome to your todolist!",
});

const item2 = new Item ({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item ({
  name: "<-- Hit this to delete an item.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
   Item.find({}).then((foundItems)=>{
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItem: foundItems });
    }
        });
    });

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName})
    .then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName)
    })
    .catch(function(err){});
  }
  
 
});

app.post("/delete", function (req,res) {
const checkedItemId = req.body.checkbox;
const listName = req.body.listName;

if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId)
    .then(function(){
      console.log("Successfully deleted from todoItems collection.");
      res.redirect("/");
    })
    .catch(function(err){});
} else {
  List.findOne({name:listName}).then((foundList)=>{

    foundList.items.pull({_id: checkedItemId});

    foundList.save();

    res.redirect("/"+listName);
});
}
});

app.get("/:customListName", function(req,res){
  const customListName = _.capitalize(req.params.customListName);
   List.findOne({ name: customListName})
   .then(function(foundList){
      if (!foundList) {
        //create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();

        console.log("saved");
        res.redirect("/" + customListName);
      } else {
        //show an existing list
        res.render("list",{listTitle:foundList.name, newListItem:foundList.items})
      console.log("not saved");
   
   }
   
  })
  .catch(function(err){});
});



app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItem: workItems });
});

app.get("/about", function(req,res){
  res.render("about");
});

app.post("/work", function (req, res) {
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

connectDB().then(() => {
  app.listen(PORT, function () {
    console.log(`Server started on port ${PORT}.`);
  });
});



