const express = require("express");
const bodyParser = require('body-parser');
const port = process.env.port || 8080
const cors = require("cors");
const mysql = require('mysql');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const db = mysql.createPool({
    connectionLimit: 10,
    host: 'sql9.freesqldatabase.com',
    user: 'sql9616621',
    password: 'mR3ddKu4Mk',
    database: 'sql9616621'
  });


app.get("/display/:user", function (req, res) {
    const user = req.params.user;
    const sql_insert = `INSERT INTO Users (userName, track, openCount) VALUES ("${user}", 0, 1);`;
    db.query(sql_insert, err => {
        if (err && err.errno === 19) {
            db.query(`UPDATE Users SET openCount = openCount + 1 WHERE (userName = "${user}")`);
        }
    });
    res.status(200).sendFile(__dirname + '/Index.html');
});

app.get("/:user", function (req, res) {
    const user = req.params.user;
    const sql = "SELECT * FROM Users WHERE userName = ?";
    db.query(sql, [user], (err, row) => {
        if (err) {
            return res.status(200).send({}); 
        }
        else {
            return res.status(200).send({...row});
        }
    });
});

app.post("/track/:user", bodyParser.json(), function (req, res) {
    const user = req.params.user;
    const body = req.body;
    const sql = "SELECT * FROM Users WHERE userName = ?";
    db.query(sql, [user], (err, result) => {
        if (err) {
            return res.status(500).send({ error: err.message }); 
        }
        if (body.trackPercentage > result[0].track) {
            const sql = "UPDATE Users SET track = ? WHERE (userName = ?)";
            db.query(sql, [body.trackPercentage, user], err => {
                if (err) {
                    return res.status(500).send({ error: err.message }); 
                }
                res.status(200).send("successfully updated tracking percentage");
            });
        }
        else {
            res.status(400).send("precentage should be greater then stored precentage");
        }
    });
});

app.get("/admin/list", function (req, res) {
    const sql = "SELECT * FROM Users ORDER BY userName"
    db.query(sql, [], (err, result) => {
        if (err) {
            return res.status(500).send({ error: err.message });
        }
        res.status(200).json({
            message: 'success',
            data: result
        });
    });
});

app.listen(port, function () {
    console.log("server running on 8080");
}); 