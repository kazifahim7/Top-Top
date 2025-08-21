var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { connect } from "mongoose";
import { Server } from "http";
import config from "./app/config/index.js";
import app from "./app.js";
let server;
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        // 4. Connect to MongoDB
        try {
            yield connect(config.dataBase_url);
            server = app.listen(config.port, () => {
                console.log(`app is listening on port ${config.port}`);
            });
        }
        catch (error) {
            console.log(error);
        }
    });
}
run();
process.on('unhandledRejection', (err) => {
    console.log(`unahandledRejection is detected , shutting down ...`, err);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    }
    process.exit(1);
});
process.on('uncaughtException', () => {
    console.log(` uncaughtException is detected , shutting down ...`);
    process.exit(1);
});
//# sourceMappingURL=server.js.map