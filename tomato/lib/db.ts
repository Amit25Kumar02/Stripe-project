import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI as string; // put your URI in .env.local
const options = {};

let client: MongoClient;
let db: Db;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;

  if (!client) {
    client = new MongoClient(uri, options);
    await client.connect();
  }

  db = client.db("tomato"); // 👈 replace with your DB name
  return db;
}
