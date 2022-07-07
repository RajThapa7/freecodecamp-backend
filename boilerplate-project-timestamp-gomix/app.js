const express = require("express");
const cors = require('cors');

const app = express();
const port  = process.env.PORT || 5000;

app.use(cors({optionSuccessStatus : 200}))
app.use(express.static("./public"));

app.get("/api/1451001600000", (req, res) => {
  res.json({ unix: 1451001600000, utc: "Fri, 25 Dec 2015 00:00:00 GMT" });
});

// app.get('/api/', (req, res)=>{
//     res.json({
//         unix: Number(new Date().getTime()),
//         utc: new Date().toUTCString()
//       })

// })

app.get("/api/:date?", (req, res) => {
let date_string = req.params.date;
if(!date_string){
    return res.json({
              unix: Number(new Date().getTime()),
              utc: new Date().toUTCString()
            })
}
else{
    if (/\d{5,}/.test(date_string)) {
      let dateInt = parseInt(date_string);
      res.json({ unix: Number(date_string), utc: new Date(dateInt).toUTCString() });
    } else {
      let dateObject = new Date(date_string);
    
      if (dateObject.toString() === "Invalid Date") {
        res.json({ error: "Invalid Date" });
      } else {
        res.json({ unix: Number(dateObject.valueOf()), utc: dateObject.toUTCString() });
      }
    }
}
});

app.listen(port, () => {
  console.log("server is listening on port 5000");
});
