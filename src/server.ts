import { connect } from "mongoose";
import { Server } from "http"
import config from "./app/config/index.js";
import app from "./app.js";
import { userModel } from "./app/modules/auth/auth.model.js";
import { TAdmin } from "./app/Admin/index.js";
import bcrypt from 'bcrypt'

let server: Server;
const port = Number(config.port) || 5001;

async function run() {

     try {
          await connect(config.dataBase_url as string);
          server = app.listen(port, () => {
               console.log(`app is listening on port ${port}`);
          });
          if (server) {
               const isExists = await userModel.findOne({ email: TAdmin.email })
               if (isExists) {
                    console.log("this admin is already available")
               }
               else {
                    const hashedPassword = await bcrypt.hash(TAdmin.password!, Number(config.salt_round));
                    TAdmin.password = hashedPassword
                    await userModel.create(TAdmin)
               }
          }
     } catch (error) {
          console.log(error)
     }
}
run()


process.on('unhandledRejection', (err) => {
     console.log(`unhandledRejection is detected , shutting down ...`, err);
     if (server) {
          server.close(() => {
               process.exit(1);
          });
     }
     process.exit(1);
});

process.on('uncaughtException', () => {
     console.log(`uncaughtException is detected , shutting down ...`);
     process.exit(1);
});
