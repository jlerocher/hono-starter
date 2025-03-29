import chalk from "chalk";

export const customLogger = (message: string, ...rest: string[]) => {
    console.log(
        `${chalk.green.bold("[INFO]")} [${chalk.underline.blue(new Date().toISOString())}] ${message}`,
        ...rest,
    );
};
