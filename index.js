import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "books",
  password: "5440277",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  const result= await db.query("select * from information");
  let books= result.rows;
  res.render("index.ejs", {
    book: books
  });
});

app.post("/sort", async (req, res) => {
  if (req.body["add"] === "new" ){
    res.render("Add.ejs");
  }
  else if( req.body["sort"] === "writer" ){
    const result= await db.query("select * from information order by writer");
    let books= result.rows;
    res.render("index.ejs", {
      book: books
    });
  } else if ( req.body["sort"] === "name" ){
    const result= await db.query("select * from information order by name");
    let books= result.rows;
    res.render("index.ejs", {
      book: books
    });
  } else {
    const result= await db.query("select * from information order by rating");
    let books= result.rows;
    res.render("index.ejs", {
      book: books
    });
  }
} );

app.post("/new", async (req,res) => {
const name= req.body["name"];
const writer=req.body["writer"];
const number=req.body["number"];
const isbn=req.body["isbn"];
const sum=req.body["sum"];
const rev=req.body["review"];
try {
  await db.query("insert into information (name,writer,rating,isbn,summary) values ($1,$2,$3,$4,$5)",[name,writer,number,isbn,sum] );
}
catch (err){
  console.log("not succseed");
}

const result=await db.query("select id from information where name=$1",[name] );
const id=result.rows;
const id_book=id[0].id;
await db.query("insert into review (review,id_book ) values ($1,$2)",[rev,id_book] );
const resul=await db.query("select * from information" );
let books=resul.rows;
res.render("index.ejs",{book:books});
} );

app.post("/add", async (req,res) => {
  const name=req.body["button"];
  try{
    const result=await db.query("select * from information join review on information.id=id_book  where name=$1", [name]);
    let books=result.rows;
    res.render("about.ejs", {book:books});
  }
  catch(err){
    console.log("not succssed");
  }
} );

app.post("/delete", async (req,res) => {
  const name=req.body["button2"];
  try{
    const result=await db.query("select id from information where name=$1", [name]);
    let books=result.rows;
    const id=books[0].id;
    try {
      await db.query("delete from review where id_book=$1", [id]);
      try {
        await db.query("delete from information where name=$1", [name]);
      }
      catch (err){
        console.log("not 1 good");
      }
    } catch (err) {
      console.log("not good");
    }
  } catch(err){
    console.log("not good");
  }
    res.redirect("/");
} );

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
