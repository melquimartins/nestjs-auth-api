import { Controller, Post } from "@nestjs/common";
import { AppService } from "./app.service";

@Controller("users")
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Post("create")
    createUser(): { message: string } {
        return this.appService.createUser();
    }
}
