import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./index";
dotenv.config({ path: './src/config.env' });



const DBConnection = process.env.DATABASE!.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD!
);

mongoose
    .connect(DBConnection)
    .then(() => console.log('DB connection successful'));

const port = process.env.PORT;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});