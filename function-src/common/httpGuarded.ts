import { HttpFunction, http } from "@google-cloud/functions-framework";
import { ValiError, object, safeParse, string } from "valibot";
import { AuthError } from "./auth";

const drizzleError = object({
  body: object({ message: string() }),
});

export const httpGuarded: typeof http = (functionName, handler) => {
  const guardedHandler: HttpFunction = async (req, res) => {
    try {
      await handler(req, res);
    } catch (e: unknown) {
      if (e instanceof AuthError) {
        return res.status(401).json({ message: "Unauthorized", data: e.data });
      }
      if (e instanceof ValiError) {
        // ! DO NOT LOG `e`, CAN CONTAIN PASSWORD
        const saneError = {
          message: "Invalid input",
          issues: e.issues.map((issue) => ({
            problem: issue.message,
            validation: issue.validation,
            path: issue.path?.map((path) => path.key),
          })),
        };
        console.error(JSON.stringify(e));
        return res
          .status(400) // Bad Request
          .json(saneError);
      }
      const drizz = safeParse(drizzleError, e);
      if (drizz.success) {
        const isUniqueViolation = drizz.output.body.message.includes(
          "code = AlreadyExists"
        );
        if (isUniqueViolation) {
          return res.status(400).json({
            message: "Already exists",
          });
        }
      }
      console.error(JSON.stringify(e));
      res.sendStatus(500);
    }
  };
  http(functionName, guardedHandler);
};
