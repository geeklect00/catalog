import Database from "better-sqlite3";
const db = new Database("database.db");
const products = db.prepare("SELECT * FROM products").all();
console.log("Products in DB:", JSON.stringify(products, null, 2));
const settings = db.prepare("SELECT * FROM settings").all();
console.log("Settings in DB:", JSON.stringify(settings, null, 2));
